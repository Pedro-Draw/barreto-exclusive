// rotas.jsx (ou AppRoutes.jsx)
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Admin from "./pages/Admin.jsx";
import Perfil from "./pages/Perfil.jsx";
import Config from "./pages/Config.jsx";
import ContractSign from "./pages/ContractSign.jsx";

// Novas páginas de conteúdo protegido
import Home from "./pages/Home.jsx";
import Tecnicas from "./pages/Tecnicas.jsx";
import Notas from "./pages/Notas.jsx";
import Data from "./pages/Data.jsx";

// Novas páginas do fluxo de assinatura
import PlanChange from "./pages/PlanChange.jsx";
import SubscriptionSuccess from "./pages/SubscriptionSuccess.jsx";

import FloatingMenu from "./components/FloatingMenu.jsx";

// Componente de proteção de assinatura ativa
import RequireActivePlan from "./components/RequireActivePlan.jsx";

import NovoPost from "./pages/NovoPost.jsx";

import { useApp } from "./App.jsx";

/* =========================
PROTECTED ROUTE (apenas login necessário)
========================= */
function PrivateRoute({ children }) {
  const { user } = useApp();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/* =========================
ADMIN ROUTE
========================= */
function AdminRoute({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

/* =========================
LAYOUT PROTEGIDO (FloatingMenu + Topbar simples)
========================= */
function ProtectedLayout({ children }) {
  const { user, toggleTheme } = useApp();

  return (
    <>
      <FloatingMenu />

      <header className="topbar">
        <div className="topbar-title">
          {user?.role === "admin" ? "Admin Panel" : "Área do Aluno"}
        </div>

        <div className="topbar-actions">
          <button className="theme-btn" onClick={toggleTheme}>
            {document.body.classList.contains("light") ? "🌙 Dark" : "☀️ Light"}
          </button>

          <span className="user-name">{user?.nome || "Aluno"}</span>
        </div>
      </header>

      <main className="main-content">{children}</main>
    </>
  );
}

/* =========================
ROTAS COMPLETAS
========================= */
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas - sem login necessário */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Fluxo de assinatura */}
        <Route
          path="/contract-sign"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <ContractSign />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Confirmação após pagamento/ativação */}
        <Route
          path="/subscription-success"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <SubscriptionSuccess />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Troca de plano */}
        <Route
          path="/plan-change"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <PlanChange />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Protegidas - apenas login */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <Perfil />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/configuracoes"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <Config />
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Páginas de CONTEÚDO PREMIUM - exigem assinatura ativa */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <RequireActivePlan>
                  <Home />
                </RequireActivePlan>
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/tecnicas"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <RequireActivePlan>
                  <Tecnicas />
                </RequireActivePlan>
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/notas"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <RequireActivePlan>
                  <Notas />
                </RequireActivePlan>
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        <Route
          path="/data"
          element={
            <PrivateRoute>
              <ProtectedLayout>
                <RequireActivePlan>
                  <Data />
                </RequireActivePlan>
              </ProtectedLayout>
            </PrivateRoute>
          }
        />

        {/* Admin - apenas role admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <ProtectedLayout>
                <Admin />
              </ProtectedLayout>
            </AdminRoute>
          }
        />

          <Route path="/novo-post" element={<NovoPost />} />

        {/* 404 - redireciona para home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;