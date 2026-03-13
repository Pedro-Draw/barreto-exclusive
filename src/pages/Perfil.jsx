// src/pages/Perfil.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../App.jsx";
import { 
  doc, updateDoc 
} from "firebase/firestore";
import { 
  getAuth, updatePassword, reauthenticateWithCredential, 
  EmailAuthProvider 
} from "firebase/auth";
import { db } from "../App.jsx"; // ajuste se db não estiver exportado
import RequireActivePlanBanner from "../components/RequireActivePlanBanner.jsx";
import PDFViewerModal from "../components/PDFViewerModal.jsx";
import { format } from "date-fns";
import { Eye, EyeOff, Save, Key, FileText, RefreshCw, CreditCard } from "lucide-react";

function Perfil() {
  const { user, setUser } = useApp();
  const navigate = useNavigate();
  const auth = getAuth();

  const [nome, setNome] = useState(user?.nome || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState(""); // para reautenticação
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  /* =========================
  ATUALIZAR PERFIL (nome + email)
  ========================= */
  async function updateProfile(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!nome.trim() || !email.includes("@")) {
      setError("Preencha nome e email válidos.");
      return;
    }

    try {
      setLoading(true);

      await updateDoc(doc(db, "users", user.id), {
        nome,
        email,
        updatedAt: new Date().toISOString(),
      });

      setUser({
        ...user,
        nome,
        email,
      });

      setMessage("Perfil atualizado com sucesso!");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      setError("Erro ao atualizar perfil. Tente novamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
  ALTERAR SENHA (com reautenticação)
  ========================= */
  async function changePassword() {
    if (!newPassword || newPassword.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!currentPassword) {
      setError("Digite sua senha atual para confirmar.");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      await updatePassword(auth.currentUser, newPassword);

      setMessage("Senha alterada com sucesso!");
      setNewPassword("");
      setCurrentPassword("");
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      if (err.code === "auth/wrong-password") {
        setError("Senha atual incorreta.");
      } else if (err.code === "auth/requires-recent-login") {
        setError("Faça login novamente para alterar a senha.");
      } else {
        setError("Erro ao alterar senha. Tente novamente.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
  HELPERS PARA PLANO
  ========================= */
  const hasPlan = user?.plano && user?.expiresAt;
  const expiresDate = user?.expiresAt ? new Date(user.expiresAt) : null;
  const isExpired = expiresDate && expiresDate < new Date();
  const daysLeft = expiresDate ? Math.max(0, Math.ceil((expiresDate - new Date()) / (86400000))) : 0;

  const planDisplayName = {
    particular: "Aula Particular",
    pacote8: "Pacote 8 Aulas",
    mensal1: "Mensal 1x/semana",
    mensal2: "Mensal 2x/semana",
    semestral1: "Semestral 1x/semana",
    semestral2: "Semestral 2x/semana",
    anual1: "Anual 1x/semana",
    anual2: "Anual 2x/semana",
  }[user?.plano] || user?.plano || "Nenhum plano ativo";

  return (
    <div className="container" style={{ maxWidth: "700px", margin: "40px auto" }}>
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>Meu Perfil</h2>

      <RequireActivePlanBanner />

      {/* MENSAGENS */}
      {message && (
        <div
          style={{
            padding: "12px",
            background: "#dcfce7",
            color: "#166534",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}
      {error && (
        <div
          style={{
            padding: "12px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "20px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* INFORMAÇÕES PESSOAIS */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <User size={22} /> Informações Pessoais
        </h3>

        <form onSubmit={updateProfile}>
          <div style={{ marginBottom: "16px" }}>
            <label>Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-gold"
            disabled={loading}
            style={{ width: "100%" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ marginRight: "8px" }} />
                Salvando...
              </>
            ) : (
              <>
                <Save size={18} style={{ marginRight: "8px" }} />
                Salvar Alterações
              </>
            )}
          </button>
        </form>
      </div>

      {/* ALTERAR SENHA */}
      <div className="card" style={{ marginBottom: "30px" }}>
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Key size={22} /> Alterar Senha
        </h3>

        <div style={{ marginBottom: "16px" }}>
          <label>Senha atual (necessária para confirmar)</label>
          <div style={{ position: "relative" }}>
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              style={{ position: "absolute", right: "12px", top: "20px", background: "none", border: "none" }}
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>Nova senha</label>
          <div style={{ position: "relative" }}>
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              style={{ position: "absolute", right: "12px", top: "20px", background: "none", border: "none" }}
            >
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          className="btn btn-gold"
          onClick={changePassword}
          disabled={loading}
          style={{ width: "100%" }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" style={{ marginRight: "8px" }} />
              Alterando...
            </>
          ) : (
            "Alterar Senha"
          )}
        </button>
      </div>

      {/* PLANO ATUAL */}
      <div className="card">
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <CreditCard size={22} /> Plano Atual
        </h3>

        {hasPlan ? (
          <>
            <p style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "12px" }}>
              {planDisplayName}
            </p>
            <p>
              <strong>Vencimento:</strong> {format(expiresDate, "dd 'de' MMMM 'de' yyyy")}
            </p>
            <p style={{ marginBottom: "16px" }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: isExpired ? "#ef4444" : daysLeft <= 7 ? "#f59e0b" : "#22c55e" }}>
                {isExpired ? "Expirado" : daysLeft <= 7 ? `Expirando em ${daysLeft} dias` : "Ativo"}
              </span>
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px" }}>
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
                  Ver Contrato
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <AlertCircle size={40} color="#f59e0b" style={{ marginBottom: "12px" }} />
            <p style={{ marginBottom: "16px" }}>Você ainda não possui um plano ativo.</p>
            <button
              className="btn btn-gold"
              onClick={() => navigate("/contract-sign")}
            >
              Assinar Agora
            </button>
          </div>
        )}
      </div>

      {/* MODAL DO PDF */}
      <PDFViewerModal
        pdfUrl={user?.contractPdfUrl}
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
    
  );
}

export default Perfil;