function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="glass-effect rounded-2xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Analyzing Your Skin
        </h3>
        <p className="text-gray-600">
          Our AI is processing your image and generating personalized recommendations...
        </p>
      </div>
    </div>
  )
}

export default LoadingSpinner

