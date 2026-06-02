import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { ChallengesProvider } from './contexts/ChallengesContext.tsx'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ChallengesProvider>
        <App />
      </ChallengesProvider>
    </AuthProvider>
  </StrictMode>,
)
