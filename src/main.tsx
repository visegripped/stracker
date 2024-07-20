import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from "@react-oauth/google";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId='451536185848-p0c132ugq4jr7r08k4m6odds43qk6ipj.apps.googleusercontent.com'>
    <React.StrictMode></React.StrictMode>
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GoogleOAuthProvider>,
)
