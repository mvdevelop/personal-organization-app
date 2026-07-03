
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
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
