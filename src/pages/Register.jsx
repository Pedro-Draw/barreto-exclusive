// Register.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../App.jsx";
import SignatureCanvas from "react-signature-canvas";
import { Eye, EyeOff } from "lucide-react";
import { sha256 } from "js-sha256";
import "../../pages.css/Register.css";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // ← novo: lê ?plan= da URL
  const { registerUser, user } = useApp();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [terms, setTerms] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Força da senha
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [strengthText, setStrengthText] = useState("");
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Assinatura persistente
  const sigRef = useRef(null);
  const [signaturePoints, setSignaturePoints] = useState([]);
  const [isSigned, setIsSigned] = useState(false);

  // Captura o plano selecionado na Landing (ex: ?plan=mensal2)
  useEffect(() => {
    const selectedPlan = searchParams.get("plan");
    if (selectedPlan) {
      localStorage.setItem("pendingPlan", selectedPlan);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      // Se já logado, vai direto pro dashboard (ou pro contract-sign se tiver pendingPlan)
      const pending = localStorage.getItem("pendingPlan");
      if (pending) {
        navigate(`/contract-sign?plan=${pending}`);
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  // Avalia força da senha em tempo real
  useEffect(() => {
    const evaluatePassword = () => {
      const newReq = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[^A-Za-z0-9]/.test(password),
      };

      const score = Object.values(newReq).filter(Boolean).length;

      setRequirements(newReq);
      setPasswordStrength(score);

      if (score === 0) setStrengthText("Muito fraca");
      else if (score <= 2) setStrengthText("Fraca");
      else if (score === 3) setStrengthText("Média");
      else if (score === 4) setStrengthText("Forte");
      else setStrengthText("Muito forte");
    };

    evaluatePassword();
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "#ff4d4f";
    if (passwordStrength === 2) return "#ffa940";
    if (passwordStrength === 3) return "#fadb14";
    if (passwordStrength === 4) return "#73d13d";
    return "#52c41a";
  };

  // Quando o modal abre → carrega assinatura salva
  useEffect(() => {
    if (openTerms && sigRef.current) {
      if (signaturePoints.length > 0) {
        sigRef.current.clear();
        sigRef.current.fromData(signaturePoints);
        setIsSigned(true);
      } else {
        sigRef.current.clear();
        setIsSigned(false);
      }
    }
  }, [openTerms, signaturePoints]);

  const handleSignatureEnd = () => {
    if (sigRef.current) {
      const currentPoints = sigRef.current.toData();
      setSignaturePoints(currentPoints);
      setIsSigned(currentPoints.length > 0 && !sigRef.current.isEmpty());
    }
  };

  const handleUndo = () => {
    if (sigRef.current && signaturePoints.length > 0) {
      const newPoints = signaturePoints.slice(0, -1);
      sigRef.current.clear();
      sigRef.current.fromData(newPoints);
      setSignaturePoints(newPoints);
      setIsSigned(newPoints.length > 0);
    }
  };

  const handleClear = () => {
    if (sigRef.current) {
      sigRef.current.clear();
      setSignaturePoints([]);
      setIsSigned(false);
    }
  };

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!nome || !email || !password || !confirm) {
      setError("Preencha todos os campos.");
      return;
    }

    if (passwordStrength < 3) {
      setError("A senha precisa ser no mínimo média.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    if (!terms) {
      setError("Você precisa aceitar o termo.");
      return;
    }

    if (!isSigned) {
      setError("Você precisa assinar o termo.");
      setOpenTerms(true);
      return;
    }

    try {
      setLoading(true);

      // Salva a assinatura temporariamente no localStorage para o ContractSign usar
      const assinaturaDataURL = sigRef.current?.toDataURL("image/png") || "";
      if (assinaturaDataURL) {
        localStorage.setItem("tempSignature", assinaturaDataURL);
      }

      // Cria a conta
      await registerUser(email, password, nome);

      // Mensagem de sucesso
      setSuccess("Conta criada com sucesso! Agora complete sua assinatura.");
      
      // Redireciona para contract-sign com o plano pendente (se existir)
      const pendingPlan = localStorage.getItem("pendingPlan");
      setTimeout(() => {
        if (pendingPlan) {
          navigate(`/contract-sign?plan=${pendingPlan}`);
        } else {
          navigate("/contract-sign"); // sem plano específico
        }
      }, 2200);
    } catch (err) {
      setError("Erro ao criar conta. Verifique conexão ou dados.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="register-page">
      <canvas id="bg-canvas" />

      <button className="back-home" onClick={() => navigate(-1)}>
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Voltar
      </button>

      <div className="register-card">
        <h1>Barreto Exclusive</h1>
        <h2>Criar Conta</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className={nome ? "valid" : ""}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={email.includes("@") ? "valid" : ""}
          />

          <div className="input-password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={passwordStrength >= 3 ? "valid" : password ? "invalid" : ""}
            />
            <button
              type="button"
              className={`eye ${showPassword ? "active" : ""}`}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {password && (
            <>
              <div className="password-strength">
                <div
                  className="strength-bar"
                  style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    background: getStrengthColor(),
                  }}
                />
                <span className="strength-text">{strengthText}</span>
              </div>

              <ul className="password-requirements">
                <li className={requirements.length ? "met" : ""}>Mínimo 8 caracteres</li>
                <li className={requirements.uppercase ? "met" : ""}>Uma letra maiúscula</li>
                <li className={requirements.lowercase ? "met" : ""}>Uma letra minúscula</li>
                <li className={requirements.number ? "met" : ""}>Um número</li>
                <li className={requirements.special ? "met" : ""}>Um caractere especial (!@#$% etc)</li>
              </ul>
            </>
          )}

          <div className="input-password">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirmar senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={confirm && confirm === password ? "valid" : confirm ? "invalid" : ""}
            />
            <button
              type="button"
              className={`eye ${showConfirm ? "active" : ""}`}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <label className="register-terms">
            <input
              type="checkbox"
              checked={terms}
              onChange={() => setTerms(!terms)}
            />
            <span>
              Aceito os{" "}
              <button
                type="button"
                className="link"
                onClick={() => setOpenTerms(true)}
              >
                Termos de Uso
              </button>
            </span>
          </label>

          {error && <div className="error">{error}</div>}
          {success && <div className="success">{success}</div>}

          <button 
            className="btn-gold" 
            disabled={loading || !terms || !isSigned}
          >
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <div className="login-link">
          Já possui conta?{" "}
          <button onClick={() => navigate("/login")}>Entrar</button>
        </div>
      </div>

      {/* Modal Termo + Assinatura */}
      {openTerms && (
        <div className="terms-modal" onClick={() => setOpenTerms(false)}>
          <div className="terms-card" onClick={(e) => e.stopPropagation()}>
            <h2>Termo de Ciência de Risco e Responsabilidade</h2>

            <div className="terms-content">
              <p>
                <strong>DECLARAÇÃO DE CIÊNCIA DE RISCO</strong>
              </p>
              <p>
                Eu, <strong>{nome || "[Nome do Aluno]"}</strong>, declaro, para os devidos fins, que estou ciente dos riscos inerentes à prática de Jiu-Jitsu Brasileiro, Defesa Pessoal e atividades correlatas, incluindo, mas não se limitando a: lesões musculares, articulares, contusões, fraturas, traumatismos cranianos e, em casos extremos, risco de morte.
              </p>
              <p>
                Declaro ainda que me encontro em plenas condições físicas e de saúde para a prática das referidas atividades, não possuindo qualquer impedimento médico ou físico que me contraindique.
              </p>
              <p>
                Isento a academia, professores, staff e demais alunos de qualquer responsabilidade civil ou penal decorrente de acidentes ou lesões sofridas durante as aulas ou eventos relacionados.
              </p>
              <p>Data: {new Date().toLocaleDateString("pt-BR")}</p>
            </div>

            <h3>Assinatura Digital (use dedo ou mouse)</h3>
            <SignatureCanvas
              ref={sigRef}
              penColor="black"
              velocityFilterWeight={0.85}
              minWidth={1.8}
              maxWidth={2.8}
              throttle={10}
              dotSize={1.6}
              onEnd={handleSignatureEnd}
              canvasProps={{
                width: window.innerWidth < 600 ? 320 : 500,
                height: 220,
                className: "signature-canvas",
              }}
            />

            <div className="signature-actions">
              <button onClick={handleClear}>Limpar assinatura</button>
              <button onClick={handleUndo} disabled={signaturePoints.length === 0}>
                Desfazer último traço
              </button>
              <button
                className="btn-gold"
                onClick={() => {
                  if (isSigned) {
                    setOpenTerms(false);
                  } else {
                    alert("Faça sua assinatura antes de confirmar.");
                  }
                }}
              >
                Confirmar assinatura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;