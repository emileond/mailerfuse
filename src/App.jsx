import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthForm from './components/auth/AuthForm'
import { useUser } from './hooks/react-query/user/useUser'

function App() {
  const { data: user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <AuthForm viewMode="login" />
    </div>
  )
}

export default App
