import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx'
import Login from './Login.jsx'
import Registration from './Registration.jsx'
import AdminLogin from './AdminLogin.jsx'
import HospitalDashboard from './pages/HospitalDashboard.jsx'
import AmbulanceDashboard from './pages/AmbulanceDashboard.jsx'
import HospitalMapDashboard from './pages/HospitalMapDashboard.jsx'
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/dashboard",
    element: <App />,
  },
  {
    path: "/register",
    element: <Registration />,
  },
  {
    path: "/secret-admin-override",
    element: <AdminLogin />,
  },
  {
    path: "/hospital",
    element: <HospitalDashboard />,
  },
  {
    path: "/ambulance",
    element: <AmbulanceDashboard />,
  },
  {
    path: "/hospital-map",
    element: <HospitalMapDashboard />,
  },
  {
    path: "/admin-dashboard",
    element: <SuperAdminDashboard />,
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
