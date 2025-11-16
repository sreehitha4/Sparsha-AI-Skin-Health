# Skin Type Detection Model

## Model Requirements

Place your trained PyTorch model file here as `skin_type_model.pth`.

### Model Specifications

- **Input Shape**: `(1, 3, 224, 224)` - RGB image, batch size 1
- **Output**: Logits for 3 classes: `[dry, normal, oily]`
- **Preprocessing**: 
  - Resize to 224x224
  - Normalize with ImageNet stats: mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]

### Example Model Loading

Update `skin_detector.py` with your model architecture:

```python
def _load_model(self):
    if os.path.exists(self.model_path):
        # Example: Load a ResNet-based model
        import torchvision.models as models
        self.model = models.resnet18(pretrained=False)
        self.model.fc = nn.Linear(self.model.fc.in_features, 3)
        self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()
```

### Testing Your Model

You can test the model integration by:

1. Placing a test image in the project root
2. Running a simple test script:

```python
from models.skin_detector import SkinTypeDetector

detector = SkinTypeDetector()
skin_type = detector.detect_skin_type("path/to/test/image.jpg")
print(f"Detected skin type: {skin_type}")
```

