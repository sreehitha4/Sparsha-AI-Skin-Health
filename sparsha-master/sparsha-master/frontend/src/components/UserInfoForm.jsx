import { useState } from 'react'

function UserInfoForm({ onSubmit, onBack }) {
  const [formData, setFormData] = useState({
    occupation: '',
    location: '',
    age: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="glass-effect rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Tell Us About Yourself
        </h2>
        <p className="text-gray-600">
          Help us personalize your skincare recommendations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="occupation" className="block text-sm font-semibold text-gray-700 mb-2">
            Occupation <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            required
            placeholder="e.g., Software Engineer, Teacher, Doctor"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your occupation helps us understand your daily environment
          </p>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            placeholder="e.g., New York, USA or Mumbai, India"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            We'll check weather conditions for personalized recommendations
          </p>
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
            Age (Optional)
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="1"
            max="120"
            placeholder="e.g., 25"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">
            Age helps us recommend age-appropriate skincare
          </p>
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="btn-secondary flex-1"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            Get Recommendations →
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserInfoForm

