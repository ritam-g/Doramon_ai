import React, { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.route'
import { useAuth } from '../features/auth/hook/useAuth'


function App() {
  const { handleGetMe } = useAuth()

  useEffect(() => {
    handleGetMe()
  }, [])

  return (
    <RouterProvider router={router} />
  )
}

export default App

