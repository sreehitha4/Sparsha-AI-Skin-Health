import { useState } from 'react'
import Header from './components/Header'
import FaceUpload from './components/FaceUpload'
import UserInfoForm from './components/UserInfoForm'
import Results from './components/Results'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [step, setStep] = useState(1)
  const [imageFile, setImageFile] = useState(null)
  const [userInfo, setUserInfo] = useState({
    occupation: '',
    location: '',
    age: ''
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleImageUpload = (file) => {
    setImageFile(file)
    setStep(2)
  }

  const handleUserInfoSubmit = async (info) => {
    setUserInfo(info)
    setLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', imageFile)
      formData.append('occupation', info.occupation)
      formData.append('location', info.location)
      if (info.age) {
        formData.append('age', info.age)
      }

      const response = await fetch('/api/analyze-skin', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setResults(data)
      setStep(3)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to analyze skin. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setImageFile(null)
    setUserInfo({ occupation: '', location: '', age: '' })
    setResults(null)
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {loading && <LoadingSpinner />}
        
        {!loading && step === 1 && (
          <FaceUpload onImageUpload={handleImageUpload} />
        )}
        
        {!loading && step === 2 && (
          <UserInfoForm 
            onSubmit={handleUserInfoSubmit}
            onBack={() => setStep(1)}
          />
        )}
        
        {!loading && step === 3 && results && (
          <Results 
            results={results}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  )
}

export default App

