import React from 'react'
import { createRoot } from 'react-dom/client'
import PublicPortfolio from './pages/PublicPortfolio'
import AdminPage from './pages/AdminPage'
import './style.css'

const isAdminPage = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdminPage ? <AdminPage /> : <PublicPortfolio />}
  </React.StrictMode>
)
