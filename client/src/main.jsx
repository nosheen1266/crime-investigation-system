import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: { background: '#0f1328', color: '#e0e8ff', border: '1px solid rgba(0,180,255,0.2)' },
          duration: 3000,
        }} />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)