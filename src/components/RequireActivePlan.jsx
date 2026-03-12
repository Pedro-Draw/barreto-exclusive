// src/components/RequireActivePlan.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { differenceInDays } from 'date-fns';

export default function RequireActivePlan({ children, redirectTo = '/contract-sign' }) {
  const { user } = useApp();

  // Se não estiver logado → vai pro login (já protegido por PrivateRoute, mas reforçando)
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Admins sempre têm acesso total
  if (user.role === 'admin') {
    return children || <Outlet />;
  }

  // Sem plano ou sem data de expiração → exige assinatura
  if (!user.plano || !user.expiresAt) {
    return <Navigate to={redirectTo} replace />;
  }

  const expirationDate = new Date(user.expiresAt);
  const today = new Date();

  // Plano expirado
  if (expirationDate < today) {
    return <Navigate to={redirectTo} replace />;
  }

  // Tudo ok → libera o conteúdo
  return children || <Outlet />;
}