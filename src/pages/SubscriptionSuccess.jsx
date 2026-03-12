// src/pages/SubscriptionSuccess.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useApp } from '../App.jsx';
import RequireActivePlan from '../components/RequireActivePlan';

export default function SubscriptionSuccess() {
  const { user } = useApp();
  const navigate = useNavigate();

  const contractUrl = user?.contractPdfUrl || null; // supondo que você salva isso no user ou em contracts

  const handleDownload = () => {
    if (contractUrl) {
      const link = document.createElement('a');
      link.href = contractUrl;
      link.download = `contrato-barreto-exclusive-${user.nome}.pdf`;
      link.click();
    } else {
      alert('Contrato ainda não disponível. Tente novamente mais tarde.');
    }
  };

  return (
    <RequireActivePlan>
      <div className="container" style={{ maxWidth: '700px', margin: '60px auto', textAlign: 'center' }}>
        <CheckCircle size={80} color="#22c55e" style={{ marginBottom: '24px' }} />
        
        <h1 style={{ color: '#22c55e', marginBottom: '16px' }}>Assinatura Confirmada!</h1>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '32px' }}>
          Bem-vindo(a) ao Barreto Exclusive, {user?.nome?.split(' ')[0] || 'Aluno(a)'}!<br />
          Seu plano já está ativo e você agora tem acesso a todo o conteúdo premium.
        </p>

        <div style={{ 
          background: '#f0fdf4', 
          border: '1px solid #86efac', 
          borderRadius: '12px', 
          padding: '24px', 
          marginBottom: '32px' 
        }}>
          <h3 style={{ marginBottom: '16px' }}>Próximos passos</h3>
          <ul style={{ textAlign: 'left', paddingLeft: '24px', lineHeight: '1.8' }}>
            <li>Acesse suas técnicas e materiais em <strong>/tecnicas</strong></li>
            <li>Confira o feed diário em <strong>/home</strong></li>
            <li>Monitore seu progresso em <strong>/data</strong></li>
            <li>Qualquer dúvida, fale conosco pelo WhatsApp</li>
          </ul>
        </div>

        {contractUrl && (
          <div style={{ marginBottom: '32px' }}>
            <button 
              onClick={handleDownload}
              className="btn btn-gold"
              style={{ marginRight: '16px', minWidth: '220px' }}
            >
              <Download size={18} /> Baixar Contrato PDF
            </button>
          </div>
        )}

        <button 
          onClick={() => navigate('/dashboard')}
          className="btn btn-outline"
          style={{ minWidth: '220px' }}
        >
          Ir para o Dashboard <ArrowRight size={18} />
        </button>
      </div>
    </RequireActivePlan>
  );
}