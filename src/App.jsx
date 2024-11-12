import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useDarkMode } from './hooks/theme/useDarkMode.js'
import DashboardPage from './pages/Dashboard.jsx'
import ProtectedRoute from './components/nav/ProtectedRoute.jsx'
import LandingPage from './pages/Landing.jsx'
import AuthPage from './pages/Auth.jsx'
import NotFoundPage from './pages/404.jsx'
import { Toaster } from 'react-hot-toast'
import { Progress } from '@nextui-org/react'
import { useUser } from './hooks/react-query/user/useUser.js'

function App() {
  const { isLoading } = useUser()

  const [darkMode] = useDarkMode()
  const router = createBrowserRouter([
    {
      path: '/',
      element: <LandingPage />,
    },
    {
      path: '/login',
      element: <AuthPage authMode="login" />,
    },
    {
      path: '/signup',
      element: <AuthPage authMode="signup" />,
    },
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      ),
    },
    {
      path: '*',
      element: <NotFoundPage />,
    },
  ])

  return (
    <main className={`${darkMode ? 'dark' : ''} text-foreground bg-background`}>
      {isLoading && <Progress size="sm" isIndeterminate />}
      <RouterProvider router={router} />
      <Toaster />
    </main>
  )
}

export default App
