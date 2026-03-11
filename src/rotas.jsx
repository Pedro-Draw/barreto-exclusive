import React from "react"
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom"

import Landing from "./pages/Landing.jsx"
import Login from "./pages/Login.jsx"
import Register from "./pages/Register.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Admin from "./pages/Admin.jsx"
import Perfil from "./pages/Perfil.jsx"
import Config from "./pages/Config.jsx"

import { useApp } from "./app.jsx"

/* =========================
PROTECTED ROUTE
========================= */

function PrivateRoute({ children }) {

  const { user } = useApp()

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}

/* =========================
ADMIN ROUTE
========================= */

function AdminRoute({ children }) {

  const { user } = useApp()

  if (!user) return <Navigate to="/login" />

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" />
  }

  return children
}

/* =========================
SIDEBAR
========================= */

function Sidebar() {

  const { logout, user } = useApp()

  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        Barreto
      </div>

      <Link to="/dashboard">
        🏠 Dashboard
      </Link>

      <Link to="/perfil">
        👤 Perfil
      </Link>

      <Link to="/config">
        ⚙ Config
      </Link>

      {user?.role === "admin" && (
        <Link to="/admin">
          🛠 Admin
        </Link>
      )}

      <button className="btn btn-outline" onClick={logout}>
        Sair
      </button>

    </div>
  )
}

/* =========================
TOPBAR
========================= */

function Topbar() {

  const { user, toggleTheme } = useApp()

  return (
    <div className="topbar">

      <div>
        Student Dashboard
      </div>

      <div className="topbar-user">

        <button
          className="btn btn-outline"
          onClick={toggleTheme}
        >
          🌙
        </button>

        <span>
          {user?.nome}
        </span>

      </div>

    </div>
  )
}

/* =========================
LAYOUT
========================= */

function Layout({ children }) {

  return (
    <>
      <Sidebar />

      <div className="main">

        <Topbar />

        {children}

      </div>
    </>
  )
}

/* =========================
ROUTES
========================= */

function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}

        <Route path="/" element={<Landing />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* PRIVATE */}

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Layout>
                <Perfil />
              </Layout>
            </PrivateRoute>
          }
        />

        <Route
          path="/config"
          element={
            <PrivateRoute>
              <Layout>
                <Config />
              </Layout>
            </PrivateRoute>
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <Admin />
              </Layout>
            </AdminRoute>
          }
        />

        {/* 404 */}

        <Route path="*" element={<Navigate to="/" />} />

      </Routes>

    </BrowserRouter>
  )
}

export default AppRoutes