
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, SignIn, SignUp } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Tasks from './pages/Tasks';
import { Toaster } from 'react-hot-toast';

const Dashboard = () => (
  <div className="text-center py-12">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bem-vindo ao Organizador Pessoal</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">Gerencie suas tarefas e notas de forma eficiente</p>
  </div>
)

const Notes = () => (
  <div className="text-center py-12">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notas</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">Em breve...</p>
  </div>
)

const Calendar = () => (
  <div className="text-center py-12">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendário</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">Em breve...</p>
  </div>
)

// Componente para proteger rotas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth()
  
  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }
  
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/sign-in/*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <SignIn 
              routing="path" 
              path="/sign-in"
              signUpUrl="/sign-up"
              redirectUrl="/"
            />
          </div>
        } />
        
        <Route path="/sign-up/*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <SignUp 
              routing="path" 
              path="/sign-up"
              signInUrl="/sign-in"
              redirectUrl="/"
            />
          </div>
        } />
        
        {/* Rotas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="notes" element={<Notes />} />
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
