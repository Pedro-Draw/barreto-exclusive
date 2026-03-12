// src/components/RequireActivePlanBanner.jsx
import React from 'react';
import { useApp } from '../App.jsx';
import { differenceInDays, format } from 'date-fns';
import { AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RequireActivePlanBanner() {
  const { user } = useApp();

  if (!user || user.role === 'admin') return null;

  if (!user.plano || !user.expiresAt) {
    return (
      <div className="banner warning" style={{ background: '#fef3c7', color: '#92400e', padding: '16px', borderRadius: '8px', margin: '16px 0', textAlign: 'center' }}>
        <AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        <strong>Atenção:</strong> Você ainda não possui um plano ativo. 
        <Link to="/contract-sign" style={{ marginLeft: '8px', color: '#c2410c', fontWeight: 'bold' }}>
          Assinar agora →
        </Link>
      </div>
    );
  }

  const expires = new Date(user.expiresAt);
  const daysLeft = differenceInDays(expires, new Date());

  if (daysLeft < 0) {
    return (
      <div className="banner danger" style={{ background: '#fee2e2', color: '#991b1b', padding: '16px', borderRadius: '8px', margin: '16px 0', textAlign: 'center' }}>
        <AlertCircle size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        Seu plano expirou em {format(expires, 'dd/MM/yyyy')}. 
        <Link to="/contract-sign" style={{ marginLeft: '8px', color: '#b91c1c', fontWeight: 'bold' }}>
          Renovar agora →
        </Link>
      </div>
    );
  }

  if (daysLeft <= 7) {
    return (
      <div className="banner alert" style={{ background: '#fefce8', color: '#854d0e', padding: '16px', borderRadius: '8px', margin: '16px 0', textAlign: 'center' }}>
        <Calendar size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
        Seu plano vence em <strong>{daysLeft} dias</strong> ({format(expires, 'dd/MM/yyyy')}).
        <Link to="/contract-sign" style={{ marginLeft: '12px', color: '#ca8a04', fontWeight: 'bold' }}>
          <RefreshCw size={16} style={{ marginRight: '6px' }} /> Renovar agora
        </Link>
      </div>
    );
  }

  return null;
}