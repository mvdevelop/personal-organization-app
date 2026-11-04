import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

// Lazy load route components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Tasks = lazy(() => import('./pages/Tasks'));
const Notes = lazy(() => import('./pages/Notes'));
const Habits = lazy(() => import('./pages/Habits'));
const Goals = lazy(() => import('./pages/Goals'));
const Studies = lazy(() => import('./pages/Studies'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const Settings = lazy(() => import('./pages/Settings'));

const Calendar = () => (
  <div className="text-center py-12">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Calendário</h1>
    <p className="text-gray-600 dark:text-gray-400 mt-2">Em breve...</p>
  </div>
)

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
  </div>
)

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return <LoadingFallback />
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/sign-in" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Suspense fallback={<LoadingFallback />}><Dashboard /></Suspense>} />
          <Route path="tasks" element={<Suspense fallback={<LoadingFallback />}><Tasks /></Suspense>} />
          <Route path="notes" element={<Suspense fallback={<LoadingFallback />}><Notes /></Suspense>} />
          <Route path="habits" element={<Suspense fallback={<LoadingFallback />}><Habits /></Suspense>} />
          <Route path="goals" element={<Suspense fallback={<LoadingFallback />}><Goals /></Suspense>} />
          <Route path="studies" element={<Suspense fallback={<LoadingFallback />}><Studies /></Suspense>} />
          <Route path="ai" element={<Suspense fallback={<LoadingFallback />}><AIAssistantPage /></Suspense>} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><Settings /></Suspense>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
