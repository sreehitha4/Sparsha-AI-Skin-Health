import { useState, useRef } from 'react'

function FaceUpload({ onImageUpload }) {
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)
      onImageUpload(file)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div className="glass-effect rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Upload Your Face Photo
        </h2>
        <p className="text-gray-600">
          Take a clear photo of your face for accurate skin type analysis
        </p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          dragActive
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-300 hover:border-purple-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-w-xs max-h-96 rounded-lg shadow-lg mx-auto"
              />
              <button
                onClick={() => {
                  setPreview(null)
                  fileInputRef.current.value = ''
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
            <p className="text-green-600 font-semibold">
              ✓ Image uploaded successfully
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-700 font-medium mb-2">
                Drag and drop your photo here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Browse Files
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, WEBP (Max 10MB)
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600 space-y-1">
        <p className="font-semibold">Tips for best results:</p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Use natural lighting</li>
          <li>Remove makeup if possible</li>
          <li>Keep face centered and clearly visible</li>
          <li>Avoid shadows on your face</li>
        </ul>
      </div>
    </div>
  )
}

export default FaceUpload

