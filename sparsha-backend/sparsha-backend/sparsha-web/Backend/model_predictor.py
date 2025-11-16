"""
Model loading and inference helper for the Sparsha skin disease detector.

This module encapsulates all PyTorch-specific logic so the rest of the Flask
backend can simply call `get_predictor().predict(image_bytes)` and receive a
structured response.
"""

from __future__ import annotations

import base64
import io
import logging
import threading
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
from PIL import Image, ImageFile, ImageOps

# Pillow can sometimes raise errors for slightly truncated JPEG uploads. This
# flag allows us to recover gracefully instead of crashing the request handler.
ImageFile.LOAD_TRUNCATED_IMAGES = True

try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torchvision import models, transforms

    TORCH_AVAILABLE = True
    TORCH_IMPORT_ERROR: Optional[Exception] = None
except Exception as exc:  # pragma: no cover - we still want graceful failures
    TORCH_AVAILABLE = False
    TORCH_IMPORT_ERROR = exc
    torch = None  # type: ignore
    nn = None  # type: ignore
    F = None  # type: ignore
    models = None  # type: ignore
    transforms = None  # type: ignore

try:
    import matplotlib.cm as cm

    MATPLOTLIB_AVAILABLE = True
except Exception as exc:  # pragma: no cover
    MATPLOTLIB_AVAILABLE = False
    cm = None  # type: ignore

# -----------------------------------------------------------------------------
# Configuration pulled from the reference Colab notebook provided by the user
# -----------------------------------------------------------------------------
IMAGE_SIZE = 380
NORMALIZE_MEAN = [0.485, 0.456, 0.406]
NORMALIZE_STD = [0.229, 0.224, 0.225]
MODEL_FILENAMES = (
    "sparsha_exp4_B4_epoch_19.pt",  # Actual file in this repository
    "sparsha_exp4_epoch_19.pt",  # Alias mentioned in the notebook/instructions
)
DEFAULT_CLASS_NAMES: List[str] = [
    # These serve as a readable fallback if the checkpoint metadata does not
    # include the actual Dermnet label mapping.
    "acne",
    "actinic_keratosis",
    "alopecia_areata",
    "basal_cell_carcinoma",
    "bullous_dermatosis",
    "cellulitis",
    "chickenpox",
    "eczema",
    "folliculitis",
    "herpes",
    "hidradenitis_suppurativa",
    "hives",
    "impetigo",
    "keratosis_pilaris",
    "lichen_planus",
    "melanoma",
    "molluscum_contagiosum",
    "psoriasis",
    "rosacea",
    "scabies",
    "seborrheic_dermatitis",
    "shingles",
    "vitiligo",
]


def _resolve_model_path() -> Optional[Path]:
    """Return the first existing model path from the known filenames."""
    base_dir = Path(__file__).resolve().parent
    for filename in MODEL_FILENAMES:
        candidate = base_dir / filename
        if candidate.exists():
            return candidate
    return None


class SkinDiseasePredictor:
    """
    Loads the EfficientNet-B4 checkpoint and runs predictions on uploaded images.
    """

    def __init__(self) -> None:
        self.logger = logging.getLogger(self.__class__.__name__)
        self.framework = "pytorch"
        self.input_size = (IMAGE_SIZE, IMAGE_SIZE)
        self.model_path = _resolve_model_path()
        self.device: Any
        if TORCH_AVAILABLE:
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        else:
            self.device = "cpu"
        self.model: Optional[torch.nn.Module] = None  # type: ignore
        self.transform = self._build_transform() if TORCH_AVAILABLE else None
        self.class_names: List[str] = DEFAULT_CLASS_NAMES.copy()
        self.lock = threading.Lock()
        self.is_loaded = False
        self.load_error: Optional[str] = None
        self.method_id = "ml_model"
        self.method_name = "efficientnet_b4"
        self.gradcam_layer = None

        if not TORCH_AVAILABLE:
            self.load_error = f"PyTorch is not installed: {TORCH_IMPORT_ERROR}"
            self.logger.error(self.load_error)
            return

        if not self.model_path:
            self.load_error = (
                "Model file not found. Expected one of: "
                + ", ".join(MODEL_FILENAMES)
            )
            self.logger.error(self.load_error)
            return

        self._load_model()

    # ------------------------------------------------------------------ helpers
    def _build_transform(self):
        """Create the exact preprocessing pipeline used during training."""
        return transforms.Compose(
            [
                transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize(mean=NORMALIZE_MEAN, std=NORMALIZE_STD),
            ]
        )

    def _load_model(self) -> None:
        """Load EfficientNet-B4 weights from disk."""
        try:
            checkpoint = torch.load(self.model_path, map_location=self.device)  # type: ignore[arg-type]
            self.logger.info("Loaded checkpoint from %s", self.model_path.name)

            # Try to recover class names from the checkpoint metadata
            extracted_names = self._extract_class_names(checkpoint)
            if extracted_names:
                self.class_names = extracted_names

            state_dict = self._extract_state_dict(checkpoint)
            if state_dict is None:
                raise ValueError("Checkpoint did not contain a state_dict")

            num_classes = self._infer_num_classes(state_dict)
            if num_classes is None:
                num_classes = len(self.class_names)

            if len(self.class_names) != num_classes:
                if len(self.class_names) < num_classes:
                    # Extend with generic labels to avoid index errors
                    for idx in range(len(self.class_names), num_classes):
                        self.class_names.append(f"class_{idx}")
                else:
                    self.class_names = self.class_names[:num_classes]

            model = models.efficientnet_b4(weights=None)
            in_features = model.classifier[1].in_features
            model.classifier = nn.Sequential(
                nn.Dropout(p=0.4, inplace=True),
                nn.Linear(in_features, num_classes),
            )

            missing, unexpected = model.load_state_dict(state_dict, strict=False)
            if missing:
                self.logger.warning("Missing keys while loading model: %s", missing)
            if unexpected:
                self.logger.warning("Unexpected keys while loading model: %s", unexpected)

            model.to(self.device)
            model.eval()

            self.model = model
            try:
                self.gradcam_layer = model.features[-1]
            except Exception:
                self.gradcam_layer = None
            self.is_loaded = True
            self.logger.info(
                "Model loaded successfully (%s classes, device=%s)",
                num_classes,
                self.device,
            )
        except Exception as exc:  # pragma: no cover - defensive logging
            self.load_error = str(exc)
            self.is_loaded = False
            self.logger.exception("Failed to load model: %s", exc)

    @staticmethod
    def _extract_state_dict(checkpoint: Any) -> Optional[Dict[str, Any]]:
        """Extract a state dict regardless of how the checkpoint was saved."""
        if isinstance(checkpoint, dict):
            for key in ("state_dict", "model_state_dict", "model", "net"):
                if key in checkpoint and isinstance(checkpoint[key], dict):
                    return SkinDiseasePredictor._strip_module_prefix(checkpoint[key])
            # Sometimes the checkpoint itself is already a state_dict
            return SkinDiseasePredictor._strip_module_prefix(checkpoint)
        return None

    @staticmethod
    def _strip_module_prefix(state_dict: Dict[str, Any]):
        """Remove 'module.' prefixes that appear when training with DataParallel."""
        cleaned = {}
        for key, value in state_dict.items():
            new_key = key.replace("module.", "", 1) if key.startswith("module.") else key
            cleaned[new_key] = value
        return cleaned

    @staticmethod
    def _extract_class_names(checkpoint: Any) -> Optional[List[str]]:
        """Return class names from common checkpoint metadata keys."""
        if not isinstance(checkpoint, dict):
            return None

        meta_keys = [
            "class_to_idx",
            "classes",
            "class_names",
            "idx_to_class",
        ]
        for key in meta_keys:
            if key in checkpoint:
                data = checkpoint[key]
                if isinstance(data, dict):
                    # class_to_idx -> sort by index value
                    try:
                        return [
                            name for name, _ in sorted(data.items(), key=lambda item: item[1])
                        ]
                    except Exception:
                        continue
                if isinstance(data, list):
                    return data
        return None

    @staticmethod
    def _infer_num_classes(state_dict: Dict[str, Any]) -> Optional[int]:
        """Infer number of output classes from classifier weights."""
        for key in ("classifier.1.weight", "classifier.1.bias"):
            if key in state_dict:
                tensor = state_dict[key]
                if hasattr(tensor, "shape"):
                    return int(tensor.shape[0])
        return None

    # ---------------------------------------------------------------- inference
    def _preprocess(
        self, image_bytes: bytes, return_image: bool = False
    ) -> Optional[Tuple["torch.Tensor", Optional[Image.Image]]]:
        """Convert raw bytes into a normalized tensor batch."""
        if not image_bytes:
            return None
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image = ImageOps.exif_transpose(image)
            image = image.convert("RGB")
            processed = image.resize(self.input_size, Image.BILINEAR)
            tensor = self.transform(processed)  # type: ignore[operator]
            batch = tensor.unsqueeze(0)
            if return_image:
                return batch, processed
            return batch, None
        except Exception as exc:
            self.logger.error("Failed to preprocess image: %s", exc)
            return None

    def _idx_to_label(self, idx: int) -> str:
        if idx < 0 or idx >= len(self.class_names):
            return f"class_{idx}"
        return self.class_names[idx]

    def predict(self, image_bytes: bytes, include_gradcam: bool = False) -> Dict[str, Any]:
        """Run inference on uploaded image bytes."""
        if not self.is_loaded or not self.model:
            return {
                "success": False,
                "error": self.load_error or "Model is not loaded",
            }

        preprocess_result = self._preprocess(image_bytes, return_image=include_gradcam)
        if preprocess_result is None:
            return {
                "success": False,
                "error": "Could not read image (unsupported or corrupt file)",
            }
        batch, reference_image = preprocess_result

        gradcam_image = None

        with self.lock:
            try:
                batch = batch.to(self.device)
                with torch.no_grad():
                    logits = self.model(batch)  # type: ignore[arg-type]
                    probabilities = F.softmax(logits, dim=1).squeeze(0)

                top_k = min(5, probabilities.shape[0])
                confidences, indices = torch.topk(probabilities, k=top_k)

                top_predictions = []
                for score, class_idx in zip(confidences.tolist(), indices.tolist()):
                    top_predictions.append(
                        {
                            "disease": self._idx_to_label(class_idx),
                            "confidence": round(float(score) * 100.0, 2),
                        }
                    )

                best = top_predictions[0]
                if include_gradcam and reference_image is not None:
                    gradcam_image = self._generate_gradcam(
                        batch, indices[0].item(), reference_image
                    )
                return {
                    "success": True,
                    "disease": best["disease"],
                    "confidence": best["confidence"],
                    "method": self.method_id,
                    "model_name": self.method_name,
                    "top_predictions": top_predictions,
                    "gradcam_image": gradcam_image,
                }
            except Exception as exc:
                self.logger.exception("Prediction failed: %s", exc)
                return {"success": False, "error": str(exc)}

    def _generate_gradcam(
        self, batch: "torch.Tensor", class_idx: int, reference_image: Image.Image
    ) -> Optional[str]:
        """Generate Grad-CAM overlay encoded as base64."""
        if not (TORCH_AVAILABLE and MATPLOTLIB_AVAILABLE):
            return None
        if not self.model or self.gradcam_layer is None:
            return None

        activations: List["torch.Tensor"] = []
        gradients: List["torch.Tensor"] = []

        def forward_hook(_module, _inp, output):
            activations.append(output.detach())

        def backward_hook(_module, _grad_input, grad_output):
            gradients.append(grad_output[0].detach())

        handle_fwd = self.gradcam_layer.register_forward_hook(forward_hook)
        handle_bwd = self.gradcam_layer.register_full_backward_hook(backward_hook)

        try:
            batch = batch.clone().requires_grad_(True)
            self.model.zero_grad(set_to_none=True)
            logits = self.model(batch)
            target = logits[:, class_idx]
            target.backward()

            if not activations or not gradients:
                return None

            activation = activations[-1]
            gradient = gradients[-1]

            weights = gradient.mean(dim=(2, 3), keepdim=True)
            cam = torch.sum(weights * activation, dim=1, keepdim=True)
            cam = torch.relu(cam)
            cam = F.interpolate(
                cam, size=batch.shape[2:], mode="bilinear", align_corners=False
            )
            cam = cam.squeeze().cpu().numpy()
            cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)

            heatmap = cm.get_cmap("jet")(cam)[..., :3]
            heatmap = (heatmap * 255).astype(np.uint8)

            base_image = reference_image.resize(self.input_size).convert("RGB")
            heatmap_img = Image.fromarray(heatmap).convert("RGB")
            overlay = Image.blend(base_image, heatmap_img, alpha=0.5)

            buffer = io.BytesIO()
            overlay.save(buffer, format="JPEG", quality=90)
            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
            return f"data:image/jpeg;base64,{encoded}"
        except Exception as exc:
            self.logger.error("Grad-CAM generation failed: %s", exc)
            return None
        finally:
            handle_fwd.remove()
            handle_bwd.remove()


_PREDICTOR_INSTANCE: Optional[SkinDiseasePredictor] = None
_PREDICTOR_LOCK = threading.Lock()


def get_predictor() -> SkinDiseasePredictor:
    """Return a singleton predictor instance so the model loads only once."""
    global _PREDICTOR_INSTANCE
    if _PREDICTOR_INSTANCE is not None:
        return _PREDICTOR_INSTANCE

    with _PREDICTOR_LOCK:
        if _PREDICTOR_INSTANCE is None:
            _PREDICTOR_INSTANCE = SkinDiseasePredictor()
    return _PREDICTOR_INSTANCE


__all__ = ["get_predictor", "SkinDiseasePredictor"]

