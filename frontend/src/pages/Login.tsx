
import React from 'react'
import { SignIn } from '@clerk/clerk-react'

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <SignIn routing="path" path="/sign-in" />
    </div>
  )
}

export default Login;
