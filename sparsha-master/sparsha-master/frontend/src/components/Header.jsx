function Header() {
  return (
    <header className="glass-effect sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sparsha
            </h1>
          </div>
          <p className="text-sm text-gray-600 hidden md:block">
            AI-Powered Skin Care Assistant
          </p>
        </div>
      </div>
    </header>
  )
}

export default Header

