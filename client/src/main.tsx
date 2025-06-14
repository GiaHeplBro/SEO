import React from 'react'; // Thêm import React
import { createRoot } from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from '@react-oauth/google'; // Thêm import Provider
import "./index.css";

// 1. Lấy Client ID từ file .env của bạn
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Lấy thẻ root từ HTML
const container = document.getElementById("root")!;
const root = createRoot(container);

// 2. Bọc component <App /> của bạn trong <GoogleOAuthProvider>
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);