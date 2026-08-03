import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminOperations from './admin/AdminOperations.jsx'
import AdminLogin from './admin/AdminLogin.jsx'

const rootEl = document.getElementById('root')

const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
const isAdminLogin = pathname === '/admin/login' || pathname.startsWith('/admin/login')
const isAdminPage = pathname.startsWith('/admin') && !isAdminLogin

createRoot(rootEl).render(
  <StrictMode>
    {isAdminLogin ? <AdminLogin /> : isAdminPage ? <AdminOperations /> : <App />}
  </StrictMode>,
)
