import AuthForm from '../components/auth/AuthForm'
import { useEffect } from 'react'
import { useUser } from '../hooks/react-query/user/useUser'
import { useNavigate } from 'react-router-dom'

function AuthPage({ authMode = 'login' }) {
  const { data: user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <AuthForm viewMode={authMode} />
    </div>
  )
}

export default AuthPage
