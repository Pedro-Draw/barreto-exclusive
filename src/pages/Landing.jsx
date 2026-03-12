// src/pages/Landing.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App.jsx";

import {
  ChevronDown,
  ShieldCheck,
  Zap,
  Award,
  Star,
  ArrowRight,
} from "lucide-react";

import "../../pages.css/Landing.css";

function Landing() {
  const navigate = useNavigate();
  const { user } = useApp(); // ← para verificar se já está logado

  const [openFaq, setOpenFaq] = useState(null);
  const [openCompare, setOpenCompare] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // loading nos botões

  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 }
    );

    sectionsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const planos = [
    { id: "particular", nome: "Aula Particular", preco: "R$250", freq: "Individual", economia: "—", ideal: "Treino personalizado" },
    { id: "pacote8", nome: "Pacote 8 Aulas", preco: "R$1760", freq: "8 aulas", economia: "12%", ideal: "Treino intensivo" },
    { id: "mensal1", nome: "Mensal 1x", preco: "R$400", freq: "1x semana", economia: "—", ideal: "Iniciantes" },
    { id: "mensal2", nome: "Mensal 2x", preco: "R$800", freq: "2x semana", economia: "—", ideal: "Evolução rápida", popular: true },
    { id: "semestral1", nome: "Semestral 1x", preco: "R$320", freq: "1x semana", economia: "20%", ideal: "Treino consistente" },
    { id: "semestral2", nome: "Semestral 2x", preco: "R$640", freq: "2x semana", economia: "20%", ideal: "Performance" },
    { id: "anual1", nome: "Anual 1x", preco: "R$280", freq: "1x semana", economia: "30%", ideal: "Compromisso longo" },
    { id: "anual2", nome: "Anual 2x", preco: "R$560", freq: "2x semana", economia: "30%", ideal: "Alta evolução" },
  ];

  const faq = [
    { q: "Preciso ter experiência?", a: "Não. O método é progressivo e ideal para iniciantes." },
    { q: "Posso fazer aula experimental?", a: "Sim, entre em contato para agendar." },
    { q: "Qual idade mínima?", a: "A partir de 14 anos." },
    { q: "Planos parcelam?", a: "Sim, parcelamento disponível." },
  ];

  // Função auxiliar para navegar para assinatura (respeita login)
  const handleAssinar = (planId = null) => {
    setIsNavigating(true);
    
    // Se já logado → vai direto pro contract-sign
    if (user) {
      const planQuery = planId ? `?plan=${planId}` : "";
      navigate(`/contract-sign${planQuery}`);
    } else {
      // Senão → register com plano (ou sem, se for "Começar Agora")
      const planQuery = planId ? `?plan=${planId}` : "";
      navigate(`/register${planQuery}`);
    }

    // Simula delay para mostrar loading (opcional)
    setTimeout(() => setIsNavigating(false), 800);
  };

  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="container hero-content">
          <h1 className="hero-title">Barreto Exclusive</h1>
          <p className="hero-sub">
            Treinamento premium de Jiu-Jitsu e Defesa Pessoal.
          </p>

          <div className="hero-buttons">
            <button
              className="btn btn-gold"
              onClick={() => handleAssinar("mensal2")} // default: mensal 2x
              disabled={isNavigating}
            >
              {isNavigating ? "Redirecionando..." : "Começar Agora"}
            </button>

            <button
              className="btn btn-outline"
              onClick={() => navigate("/login")}
            >
              Entrar
            </button>
          </div>

          {user && (
            <p style={{ marginTop: "16px", fontSize: "0.95rem", opacity: 0.9 }}>
              Já está logado como {user.nome?.split(" ")[0]}? Clique acima para assinar direto.
            </p>
          )}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section
        ref={(el) => (sectionsRef.current[0] = el)}
        className="container benefits reveal"
      >
        <div className="benefit-card">
          <ShieldCheck size={30} />
          <h3>Metodologia Progressiva</h3>
          <p>Evolução estruturada.</p>
        </div>

        <div className="benefit-card">
          <Zap size={30} />
          <h3>Defesa Real</h3>
          <p>Técnicas aplicáveis.</p>
        </div>

        <div className="benefit-card">
          <Award size={30} />
          <h3>Ambiente Premium</h3>
          <p>Treine com excelência.</p>
        </div>
      </section>

      {/* PLANOS */}
      <section
        ref={(el) => (sectionsRef.current[1] = el)}
        className="container plans reveal"
      >
        <h2>Planos</h2>

        <div className="plans-grid">
          {planos.map((plan) => (
            <div key={plan.id} className="plan-card">
              {plan.popular && (
                <div className="badge">
                  <Star size={14} /> Mais popular
                </div>
              )}

              <h3>{plan.nome}</h3>
              <div className="price">{plan.preco}</div>
              <p className="plan-info">{plan.freq}</p>

              <button
                className="btn btn-gold plan-btn"
                onClick={() => handleAssinar(plan.id)}
                disabled={isNavigating}
              >
                {isNavigating ? "..." : "Assinar"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARAÇÃO */}
      <section className="container comparison reveal">
        <button
          className="compare-toggle"
          onClick={() => setOpenCompare(!openCompare)}
        >
          Comparar planos
          <ChevronDown className={openCompare ? "rotate" : ""} />
        </button>

        {openCompare && (
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Plano</th>
                  <th>Treino</th>
                  <th>Preço</th>
                  <th>Economia</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                {planos.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.nome}</td>
                    <td>{plan.freq}</td>
                    <td>{plan.preco}</td>
                    <td>{plan.economia}</td>
                    <td>{plan.ideal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="container faq">
        <h2>Perguntas Frequentes</h2>

        {faq.map((item, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              {item.q}
              <ChevronDown className={openFaq === index ? "rotate" : ""} />
            </button>

            {openFaq === index && <p className="faq-answer">{item.a}</p>}
          </div>
        ))}
      </section>

      <footer className="footer">
        <p>Barreto Exclusive © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default Landing;