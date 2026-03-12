// src/pages/PlanChange.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App.jsx';
import { differenceInDays } from 'date-fns';
import { ArrowLeft, RefreshCw } from 'lucide-react';

export default function PlanChange() {
  const { user, getPlans, subscribePlan } = useApp();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [difference, setDifference] = useState(0);

  useEffect(() => {
    async function load() {
      const allPlans = await getPlans();
      setPlans(allPlans);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!selectedPlan || !user?.expiresAt) return;

    const daysLeft = differenceInDays(new Date(user.expiresAt), new Date());
    if (daysLeft <= 0) {
      setDifference(0);
      return;
    }

    // Cálculo aproximado pro-rata (simplificado)
    const currentDaily = 800 / 30; // exemplo: R$800 mensal → ~R$26,67/dia
    const credit = daysLeft * currentDaily;
    const toPay = selectedPlan.preco - credit;
    setDifference(Math.max(0, Math.round(toPay)));
  }, [selectedPlan, user]);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleConfirmChange = () => {
    if (!selectedPlan) return;
    // Aqui você pode chamar subscribePlan ou uma função específica de upgrade
    subscribePlan(user.id, selectedPlan);
    navigate('/subscription-success');
  };

  if (loading) return <div className="container">Carregando planos...</div>;

  return (
    <div className="container" style={{ maxWidth: '900px', margin: '40px auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '24px' }}>
        <ArrowLeft /> Voltar
      </button>

      <h1>Trocar de Plano</h1>
      <p>Escolha o novo plano. Será calculado o valor proporcional dos dias restantes.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', margin: '32px 0' }}>
        {plans.map(plan => (
          <div 
            key={plan.id}
            onClick={() => handleSelectPlan(plan)}
            style={{
              border: selectedPlan?.id === plan.id ? '2px solid #d4af37' : '1px solid #ddd',
              borderRadius: '12px',
              padding: '20px',
              cursor: 'pointer',
              background: selectedPlan?.id === plan.id ? '#fffbeb' : 'white'
            }}
          >
            <h3>{plan.nome}</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#d4af37' }}>
              R$ {plan.preco}
            </div>
            <p>{plan.freq || plan.descricao}</p>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div style={{ 
          background: '#f0f9ff', 
          padding: '24px', 
          borderRadius: '12px', 
          marginTop: '32px' 
        }}>
          <h3>Resumo da troca</h3>
          <p>Novo plano: <strong>{selectedPlan.nome}</strong></p>
          <p>Valor cheio: R$ {selectedPlan.preco}</p>
          
          {difference > 0 ? (
            <p style={{ color: '#16a34a', fontWeight: 'bold' }}>
              Valor a pagar (pro-rata): R$ {difference}
            </p>
          ) : (
            <p style={{ color: '#16a34a' }}>Sem custo adicional (crédito cobre o período)</p>
          )}

          <button 
            onClick={handleConfirmChange}
            className="btn btn-gold"
            style={{ marginTop: '20px', width: '100%' }}
          >
            <RefreshCw size={18} /> Confirmar Troca de Plano
          </button>
        </div>
      )}
    </div>
  );
}