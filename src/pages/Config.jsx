// src/pages/Config.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App.jsx";
import { format } from "date-fns";
import {
  Moon,
  Sun,
  Bell,
  Trash2,
  LogOut,
  FileText,
  RefreshCw,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import RequireActivePlanBanner from "../components/RequireActivePlanBanner.jsx";
import PDFViewerModal from "../components/PDFViewerModal.jsx";

function Config() {
  const { user, toggleTheme, logout } = useApp();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") !== "false"
  );
  const [message, setMessage] = useState("");
  const [showPdfModal, setShowPdfModal] = useState(false);

  /* =========================
  TOGGLE NOTIFICATIONS
  ========================= */
  function toggleNotifications() {
    const newValue = !notifications;
    setNotifications(newValue);
    localStorage.setItem("notifications", newValue.toString());
    setMessage("Preferência de notificações salva.");
    setTimeout(() => setMessage(""), 2000);
  }

  /* =========================
  CLEAR LOCAL DATA
  ========================= */
  function clearLocal() {
    localStorage.clear();
    setMessage("Todos os dados locais foram removidos.");
    setTimeout(() => setMessage(""), 2000);
  }

  /* =========================
  HELPERS
  ========================= */
  const hasActivePlan = user?.plano && user?.expiresAt;
  const expiresDate = user?.expiresAt ? new Date(user.expiresAt) : null;
  const isExpired = expiresDate && expiresDate < new Date();
  const daysLeft = expiresDate
    ? Math.max(0, Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24)))
    : 0;

  const planDisplayName = {
    particular: "Aula Particular",
    pacote8: "Pacote Particular",
    mensal1: "Mensal 1x/semana",
    mensal2: "Mensal 2x/semana",
    semestral1: "Semestral 1x/semana",
    semestral2: "Semestral 2x/semana",
    anual1: "Anual 1x/semana",
    anual2: "Anual 2x/semana",
  }[user?.plano] || user?.plano || "Nenhum plano ativo";

  /* =========================
  RENDER
  ========================= */
  return (
    <div className="container" style={{ maxWidth: "800px", margin: "40px auto" }}>
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>Configurações</h2>

      {/* Banner de status da assinatura */}
      <RequireActivePlanBanner />

      {/* INFORMAÇÕES DA ASSINATURA */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CreditCard size={22} /> Minha Assinatura
        </h3>

        {hasActivePlan ? (
          <>
            <p>
              <strong>Plano atual:</strong> {planDisplayName}
            </p>
            <p>
              <strong>Vencimento:</strong>{" "}
              {format(expiresDate, "dd 'de' MMMM 'de' yyyy")} ({daysLeft} dias restantes)
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span style={{ color: isExpired ? "#ef4444" : daysLeft <= 7 ? "#f59e0b" : "#22c55e" }}>
                {isExpired ? "Expirado" : daysLeft <= 7 ? "Expirando em breve" : "Ativo"}
              </span>
            </p>

            <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
              <button
                className="btn btn-gold"
                onClick={() => navigate("/contract-sign")}
                style={{ flex: 1 }}
              >
                <RefreshCw size={18} style={{ marginRight: "8px" }} />
                Renovar Plano
              </button>

              <button
                className="btn btn-outline"
                onClick={() => navigate("/plan-change")}
                style={{ flex: 1 }}
              >
                <CreditCard size={18} style={{ marginRight: "8px" }} />
                Trocar Plano
              </button>

              {user?.contractPdfUrl && (
                <button
                  className="btn btn-outline"
                  onClick={() => setShowPdfModal(true)}
                  style={{ flex: 1 }}
                >
                  <FileText size={18} style={{ marginRight: "8px" }} />
                  Ver Meu Contrato
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <AlertCircle size={40} color="#f59e0b" style={{ marginBottom: "12px" }} />
            <p style={{ marginBottom: "16px" }}>
              Você ainda não possui um plano ativo.
            </p>
            <button
              className="btn btn-gold"
              onClick={() => navigate("/contract-sign")}
            >
              Assinar Agora
            </button>
          </div>
        )}
      </div>

      {/* TEMA */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          {document.body.classList.contains("light") ? <Sun size={22} /> : <Moon size={22} />} Tema
        </h3>
        <p style={{ marginBottom: "15px" }}>Alternar entre modo claro e escuro.</p>
        <button className="btn btn-gold" onClick={toggleTheme}>
          Alternar Tema
        </button>
      </div>

      {/* NOTIFICAÇÕES */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Bell size={22} /> Notificações
        </h3>
        <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            type="checkbox"
            checked={notifications}
            onChange={toggleNotifications}
          />
          Receber notificações do sistema
        </label>
      </div>

      {/* LIMPAR DADOS */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Trash2 size={22} /> Limpar dados locais
        </h3>
        <p style={{ marginBottom: "10px" }}>Remove preferências salvas no navegador.</p>
        <button className="btn btn-outline" onClick={clearLocal}>
          Limpar Dados
        </button>
      </div>

      {/* CONTA */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
          <LogOut size={22} /> Conta
        </h3>
        <button className="btn btn-outline" onClick={logout}>
          Sair da Conta
        </button>
      </div>

      {/* VERSÃO */}
      <div className="card">
        <h3>Sistema</h3>
        <p style={{ marginTop: "10px" }}>Barreto Exclusive SaaS</p>
        <p>Versão 1.0</p>
      </div>

      {/* MENSAGEM DE FEEDBACK */}
      {message && (
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            background: "#dcfce7",
            color: "#166534",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      {/* MODAL DO PDF */}
      <PDFViewerModal
        pdfUrl={user?.contractPdfUrl}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
}

export default Config;