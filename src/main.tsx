import { GoogleOAuthProvider } from '@react-oauth/google'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './ui/styles/site.css'

const GOOGLE_CLIENT_ID = "979114722520-tjqun0r94ebgck7jbbtlup4p5upp14t4.apps.googleusercontent.com"

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
)
