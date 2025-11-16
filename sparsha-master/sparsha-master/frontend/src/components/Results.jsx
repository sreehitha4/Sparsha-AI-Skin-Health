function Results({ results, onReset }) {
  const { skin_type, weather_data, recommendations } = results

  const getSkinTypeColor = (type) => {
    const colors = {
      oily: 'bg-blue-100 text-blue-800 border-blue-300',
      dry: 'bg-orange-100 text-orange-800 border-orange-300',
      normal: 'bg-green-100 text-green-800 border-green-300'
    }
    return colors[type.toLowerCase()] || colors.normal
  }

  const formatRecommendations = (recs) => {
    if (typeof recs === 'string') {
      return recs.split('\n').filter(line => line.trim())
    }
    if (recs && typeof recs === 'object') {
      if (recs.recommendations) {
        return formatRecommendations(recs.recommendations)
      }
    }
    return []
  }
  
  const getRecommendationsContent = () => {
    if (!recommendations) return null
    
    // Handle string recommendations (from CrewAI)
    if (typeof recommendations === 'string') {
      return { type: 'string', content: recommendations }
    }
    
    // Handle object recommendations (fallback)
    if (typeof recommendations === 'object') {
      if (recommendations.recommendations && typeof recommendations.recommendations === 'string') {
        return { type: 'string', content: recommendations.recommendations }
      }
      return { type: 'object', content: recommendations }
    }
    
    return null
  }
  
  const recContent = getRecommendationsContent()

  return (
    <div className="space-y-6">
      {/* Skin Type Result */}
      <div className="glass-effect rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Your Skin Analysis
          </h2>
          <div className="inline-block">
            <span className={`px-6 py-3 rounded-full text-lg font-bold border-2 ${getSkinTypeColor(skin_type)}`}>
              {skin_type.charAt(0).toUpperCase() + skin_type.slice(1)} Skin
            </span>
          </div>
        </div>
      </div>

      {/* Weather Information */}
      {weather_data && (
        <div className="glass-effect rounded-2xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Weather Conditions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {weather_data.temperature && (
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-600">Temperature</p>
                <p className="text-2xl font-bold text-purple-600">{weather_data.temperature}°C</p>
              </div>
            )}
            {weather_data.humidity && (
              <div className="text-center p-4 bg-pink-50 rounded-xl">
                <p className="text-sm text-gray-600">Humidity</p>
                <p className="text-2xl font-bold text-pink-600">{weather_data.humidity}%</p>
              </div>
            )}
            {weather_data.uv_index && (
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-gray-600">UV Index</p>
                <p className="text-2xl font-bold text-blue-600">{weather_data.uv_index}</p>
              </div>
            )}
            {weather_data.condition && (
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-gray-600">Condition</p>
                <p className="text-lg font-bold text-green-600">{weather_data.condition}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="glass-effect rounded-2xl p-8 shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <svg className="w-7 h-7 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Personalized Recommendations
        </h3>
        
        {recContent && (
          <div className="prose max-w-none">
            {recContent.type === 'string' ? (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-l-4 border-purple-600">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {recContent.content}
                </div>
              </div>
            ) : recContent.type === 'object' && recContent.content.personalized === false ? (
              <div className="space-y-6">
                {recContent.content.daily_routine && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3">Daily Routine</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h5 className="font-semibold text-purple-800 mb-2">Morning</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {recContent.content.daily_routine.morning.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-pink-50 rounded-xl p-4">
                        <h5 className="font-semibold text-pink-800 mb-2">Evening</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {recContent.content.daily_routine.evening.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                {recContent.content.product_recommendations && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3">Product Recommendations</h4>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {recContent.content.product_recommendations.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {recContent.content.weather_tips && recContent.content.weather_tips.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-3">Weather Tips</h4>
                    <div className="bg-green-50 rounded-xl p-4">
                      <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {recContent.content.weather_tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6">
                <p className="text-gray-600">No recommendations available.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="btn-primary"
        >
          Analyze Another Photo
        </button>
      </div>
    </div>
  )
}

export default Results

