
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Login from './pages/Login';
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

function App() {
  const { isSignedIn } = useAuth()

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={isSignedIn ? <Dashboard /> : <Navigate to="/sign-in" />} />
          <Route path="tasks" element={isSignedIn ? <Tasks /> : <Navigate to="/sign-in" />} />
          <Route path="notes" element={isSignedIn ? <Notes /> : <Navigate to="/sign-in" />} />
          <Route path="calendar" element={isSignedIn ? <Calendar /> : <Navigate to="/sign-in" />} />
          <Route path="sign-in/*" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
