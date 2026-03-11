import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App.jsx";
import { ChevronDown, ShieldCheck, Zap, Award } from "lucide-react"; // ← assumindo que você usa lucide-react

function Landing() {
  const navigate = useNavigate();
  const { subscribePlan } = useApp();

  const [openFaq, setOpenFaq] = useState(null);

  /* ======================
  PLANOS
  ====================== */
  const planos = [
    {
      id: "particular",
      nome: "Aula Particular",
      descricao: "Treino individual personalizado.",
      preco: "R$250",
      info: "por aula",
    },
    {
      id: "pacote8",
      nome: "Pacote Particular",
      descricao: "Pacote com 8 aulas particulares.",
      preco: "R$1760",
      info: "8 aulas",
    },
    {
      id: "mensal1",
      nome: "Plano Mensal",
      descricao: "Treine 1x por semana.",
      preco: "R$400",
      info: "mensal",
    },
    {
      id: "mensal2",
      nome: "Plano Mensal",
      descricao: "Treine 2x por semana.",
      preco: "R$800",
      info: "mensal",
    },
    {
      id: "semestral1",
      nome: "Plano Semestral",
      descricao: "Treine 1x por semana.",
      preco: "R$320",
      info: "mensal",
    },
    {
      id: "semestral2",
      nome: "Plano Semestral",
      descricao: "Treine 2x por semana.",
      preco: "R$640",
      info: "mensal",
    },
    {
      id: "anual1",
      nome: "Plano Anual",
      descricao: "Treine 1x por semana.",
      preco: "R$280",
      info: "mensal",
    },
    {
      id: "anual2",
      nome: "Plano Anual",
      descricao: "Treine 2x por semana.",
      preco: "R$560",
      info: "mensal",
    },
  ];

  /* ======================
  FAQ (exemplo — adapte as perguntas/respostas conforme quiser)
  ====================== */
  const faq = [
    {
      q: "Preciso ter experiência prévia em Jiu-Jitsu?",
      a: "Não. Nosso método é 100% progressivo e foi pensado para receber iniciantes de forma segura e estruturada.",
    },
    {
      q: "Posso fazer uma aula experimental?",
      a: "Sim! Entre em contato conosco para agendar sua primeira aula experimental.",
    },
    {
      q: "Qual a idade mínima para treinar?",
      a: "Trabalhamos com jovens a partir de 14 anos e adultos de todas as idades.",
    },
    {
      q: "Os planos semestral e anual são parcelados?",
      a: "Sim. Ambos podem ser parcelados no cartão de crédito em até 12x (sujeito a análise).",
    },
  ];

  /* ======================
  RENDER
  ====================== */
  return (
    <div className="landing">
      {/* HERO */}
      <section className="hero container">
        <h1>Barreto Exclusive</h1>
        <p>
          Treinamento de Jiu-Jitsu e Defesa Pessoal baseado na Metodologia Barreto de Jiu-Jitsu Progressivo.
        </p>

        <div style={{ marginTop: "30px" }}>
          <button className="btn btn-gold" onClick={() => navigate("/register")}>
            Começar Agora
          </button>
          <button
            className="btn btn-outline"
            style={{ marginLeft: "10px" }}
            onClick={() => navigate("/login")}
          >
            Entrar
          </button>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="container grid grid-3" style={{ marginTop: "80px" }}>
        <div className="card">
          <h3>Metodologia Progressiva</h3>
          <p>Sistema estruturado para evolução técnica gradual e segura.</p>
        </div>

        <div className="card">
          <h3>Defesa Pessoal Real</h3>
          <p>Treinamento voltado para situações reais com segurança.</p>
        </div>

        <div className="card">
          <h3>Ambiente Premium</h3>
          <p>Treine em um ambiente exclusivo focado em performance.</p>
        </div>
      </section>

      {/* PLANOS */}
      <section className="container" style={{ marginTop: "100px" }}>
        <h2 style={{ marginBottom: "40px" }}>Planos</h2>

        <div className="grid grid-3">
          {planos.map((plan) => (
            <div key={plan.id} className="plan">
              <h3>{plan.nome}</h3>
              <p>{plan.descricao}</p>
              <div className="plan-price">{plan.preco}</div>
              <p style={{ marginBottom: "20px" }}>{plan.info}</p>
              <button
                className="btn btn-gold"
                onClick={() => subscribePlan("guest", plan)}
              >
                Assinar
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* METODOLOGIA */}
      <section className="container" style={{ marginTop: "100px" }}>
        <div className="card">
          <h2>Metodologia Barreto</h2>
          <p style={{ marginTop: "10px" }}>
            A Metodologia Barreto de Jiu-Jitsu Progressivo foi criada para proporcionar evolução consistente respeitando o ritmo do aluno.
            Cada técnica é ensinada com foco em segurança, controle e eficiência.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="hero container">
        <h2>Comece sua jornada hoje.</h2>
        <p>Entre para a Barreto Exclusive e evolua com segurança e excelência.</p>
        <button
          className="btn btn-gold"
          style={{ marginTop: "20px" }}
          onClick={() => navigate("/register")}
        >
          Criar Conta
        </button>
      </section>

      {/* FAQ */}
      <section className="container faq">
        <h2>FAQ</h2>

        {faq.map((item, index) => (
          <div key={index} className="faq-item">
            <button
              className="faq-question"
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
            >
              {item.q}
              <ChevronDown className={openFaq === index ? "rotate" : ""} />
            </button>

            {openFaq === index && (
              <p className="faq-answer">{item.a}</p>
            )}
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-icons">
          <div>
            <ShieldCheck size={16} />
            <span>Segurança empresarial</span>
          </div>

          <div>
            <Zap size={16} />
            <span>Alto desempenho</span>
          </div>

          <div>
            <Award size={16} />
            <span>Plataforma premium</span>
          </div>
        </div>

        <p>Barreto Exclusive © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default Landing;