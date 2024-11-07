import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import { Button, ButtonGroup } from '@nextui-org/button'
import { account, ID } from './lib/appwrite'
import AuthForm from './components/auth/AuthForm'
import { useUser } from './hooks/react-query/user/useUser'
import { useLogout } from './hooks/react-query/user/useUser'

function App() {
  const { data: user } = useUser()
  const { mutateAsync: logoutUser } = useLogout()

  console.log(user)

  const handleLogout = async () => {
    await logoutUser()
  }

  return (
    <>
      <div>
        <AuthForm viewMode="login" />
        <Button onClick={handleLogout}>Logout</Button>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
