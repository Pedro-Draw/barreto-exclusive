// src/pages/ContractSign.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../App.jsx";
import { motion } from "framer-motion";
import { PenTool, FileText, CreditCard, Check, Loader2 } from "lucide-react";

function ContractSign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    user, 
    saveMedical, 
    saveContract, 
    updateSubscription, 
    generateAndSaveContract, 
    addActivity 
  } = useApp();

  const [medicalData, setMedicalData] = useState({
    alergias: "",
    cardiaco: "nao",
    cardiacoDetalhe: "",
    lesoes: "nao",
    medicamentos: "",
    condicoes: "",
    medico: ""
  });

  const [accepted, setAccepted] = useState(false);
  const [signature, setSignature] = useState(null);
  const [paymentStep, setPaymentStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  // Pega plano da URL / localStorage / user
  const pendingPlanId = searchParams.get("plan") || 
                        localStorage.getItem("pendingPlan") || 
                        user?.plano || 
                        "mensal2";

  const planNames = {
    particular: "Aula Particular",
    pacote8: "Pacote Particular",
    mensal1: "Plano Mensal 1x/semana",
    mensal2: "Plano Mensal 2x/semana",
    semestral1: "Plano Semestral 1x/semana",
    semestral2: "Plano Semestral 2x/semana",
    anual1: "Plano Anual 1x/semana",
    anual2: "Plano Anual 2x/semana",
  };
  const planName = planNames[pendingPlanId] || "Plano Selecionado";

  const phone = "5561981538330";

  // Carrega assinatura temporária do Register (se existir)
  useEffect(() => {
    const tempSig = localStorage.getItem("tempSignature");
    if (tempSig && canvasRef.current) {
      const img = new Image();
      img.src = tempSig;
      img.onload = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
        setSignature(tempSig);
        console.log("Assinatura carregada do localStorage");
      };
      img.onerror = () => console.error("Erro ao carregar assinatura do localStorage");
    }
  }, []);

  // Configuração do canvas de assinatura
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX ? e.clientX - rect.left : e.touches[0]?.clientX - rect.left,
        y: e.clientY ? e.clientY - rect.top : e.touches[0]?.clientY - rect.top,
      };
    };

    const start = (e) => {
      isDrawing.current = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!isDrawing.current) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const end = () => {
      isDrawing.current = false;
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        setSignature(dataUrl);
        console.log("Assinatura atualizada no canvas");
      }
    };

    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseout", end);

    canvas.addEventListener("touchstart", (e) => { e.preventDefault(); start(e); });
    canvas.addEventListener("touchmove", (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener("touchend", end);

    return () => {
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", end);
      canvas.removeEventListener("mouseout", end);
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", end);
    };
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignature(null);
      localStorage.removeItem("tempSignature");
      console.log("Assinatura limpa");
    }
  };

  const handleMedicalChange = (e) => {
    const { name, value } = e.target;
    setMedicalData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAndProceed = async () => {
    if (!signature || !accepted) {
      setError("Complete a assinatura e aceite o contrato.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log("1. Salvando ficha médica...");
      await saveMedical(user.id, medicalData);

      console.log("2. Salvando contrato básico...");
      await saveContract(user.id, {
        accepted: true,
        signature,
        plan: pendingPlanId,
      });

      addActivity(user.id, "contract_signed");

      console.log("3. Gerando e salvando PDF completo...");
      const pdfUrl = await generateAndSaveContract(
        user.id,
        { nome: user.nome, email: user.email },
        medicalData,
        signature,
        { id: pendingPlanId, nome: planName }
      );

      console.log("PDF gerado com sucesso! URL:", pdfUrl);

      setSuccess("Ficha, contrato e PDF gerados! Agora confirme o pagamento.");
      setPaymentStep(true);
    } catch (err) {
      console.error("ERRO COMPLETO NO PROCESSO DE SALVAMENTO:", err);
      setError(`Erro ao salvar: ${err.message || "Tente novamente"}`);
    } finally {
      console.log("Finalizando loading...");
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(
      `Olá! Acabei de assinar o contrato + ficha médica para o plano ${planName}. Usuário: ${user.email}.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`);
  };

  const handlePaymentConfirm = async () => {
    setLoading(true);
    try {
      console.log("Confirmando pagamento e ativando assinatura...");
      await updateSubscription(user.id, { id: pendingPlanId, duracaoDias: 30 });

      localStorage.removeItem("pendingPlan");
      localStorage.removeItem("tempSignature");

      setSuccess("Pagamento confirmado! Assinatura ativada.");
      navigate("/subscription-success");
    } catch (err) {
      console.error("Erro ao confirmar pagamento:", err);
      setError("Erro ao ativar assinatura.");
    } finally {
      setLoading(false);
    }
  };

  const copyPix = () => {
    navigator.clipboard.writeText("barretoexclusive@pix.com.br");
    alert("Código Pix copiado!");
  };

  if (!user) return <div className="container" style={{ padding: "80px" }}>Carregando usuário...</div>;

  return (
    <div className="contract-sign container">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="contract-card glass-premium card-premium"
      >
        <h1 className="contract-title gold-gradient">Contrato + Ficha Médica Barreto Exclusive</h1>

        {error && <div className="error" style={{ marginBottom: "16px", color: "red" }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: "16px", color: "green" }}>{success}</div>}

        {/* FICHA MÉDICA */}
        <div className="contract-section">
          <h3><FileText size={22} /> Ficha Médica</h3>
          <input name="alergias" placeholder="Alergias ou intolerâncias" value={medicalData.alergias} onChange={handleMedicalChange} className="input" />
          
          <div style={{display:"flex",gap:"15px",alignItems:"center"}}>
            <label>Problemas cardíacos?</label>
            <select name="cardiaco" value={medicalData.cardiaco} onChange={handleMedicalChange} className="input" style={{width:"auto"}}>
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
            </select>
          </div>
          {medicalData.cardiaco === "sim" && <input name="cardiacoDetalhe" placeholder="Detalhes" value={medicalData.cardiacoDetalhe} onChange={handleMedicalChange} className="input" />}

          <input name="lesoes" placeholder="Lesões recentes (sim/não + detalhes)" value={medicalData.lesoes} onChange={handleMedicalChange} className="input" />
          <textarea name="medicamentos" placeholder="Medicamentos em uso" value={medicalData.medicamentos} onChange={handleMedicalChange} className="input" />
          <textarea name="condicoes" placeholder="Outras condições médicas" value={medicalData.condicoes} onChange={handleMedicalChange} className="input" />
          <input name="medico" placeholder="Médico de referência" value={medicalData.medico} onChange={handleMedicalChange} className="input" />
        </div>

        {/* CONTRATO */}
        <div className="contract-section">
          <h3>Contrato de Assinatura</h3>
          <div className="contract-text">
            1. Respeito total ao ambiente, instrutores e colegas.<br />
            2. Plano válido pelo período contratado com renovação automática.<br />
            3. Cancelamento com 30 dias de aviso prévio.<br />
            4. Não nos responsabilizamos por lesões fora das aulas supervisionadas.<br />
            5. Pagamento obrigatório para liberação de acesso.<br />
            6. Autorizo uso de imagens para divulgação.<br />
            7. Declaro estar apto fisicamente para praticar Jiu-Jitsu.
          </div>
          <label style={{display:"flex",gap:"10px",marginTop:"15px",fontSize:"15px"}}>
            <input type="checkbox" checked={accepted} onChange={() => setAccepted(!accepted)} />
            Li e aceito integralmente o contrato
          </label>
        </div>

        {/* ASSINATURA DIGITAL */}
        <div className="contract-section">
          <h3><PenTool size={22} /> Assinatura Digital</h3>
          <canvas ref={canvasRef} className="signature-pad" width="560" height="220" />
          <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"10px"}}>
            <button className="btn btn-outline" onClick={clearSignature}>Limpar</button>
            <button className="btn btn-gold" onClick={() => setSignature(canvasRef.current?.toDataURL("image/png"))}>Confirmar Assinatura</button>
          </div>
          {signature && <p style={{color:"#22c55e",textAlign:"center",marginTop:"10px"}}>✓ Assinatura confirmada</p>}
        </div>

        {!paymentStep ? (
          <button 
            className="btn btn-gold" 
            style={{width:"100%",marginTop:"30px",fontSize:"1.1rem"}}
            onClick={handleSaveAndProceed}
            disabled={loading || !signature || !accepted}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" style={{ marginRight: "8px" }} />
                Salvando... (aguarde)
              </>
            ) : (
              "Salvar Ficha e Contrato"
            )}
          </button>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="payment-section"
            style={{ marginTop: "32px" }}
          >
            <div className="payment-option card" style={{ marginBottom: "20px" }}>
              <button onClick={handleWhatsApp} className="btn btn-gold" style={{ width: "100%" }}>
                Enviar Comprovante via WhatsApp
              </button>
            </div>

            <div className="payment-option pix-box">
              <h3>Pagar agora (Pix)</h3>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=BARRETO-EXCLUSIVE-${pendingPlanId}`}
                alt="QR Pix"
                style={{ margin: "16px auto", display: "block" }}
              />
              <p style={{ textAlign: "center", marginBottom: "12px" }}>
                Código Pix: <strong>barretoexclusive@pix.com.br</strong>
              </p>
              <button onClick={copyPix} className="btn btn-outline" style={{ marginBottom: "12px", width: "100%" }}>
                Copiar código
              </button>
              <button
                onClick={handlePaymentConfirm}
                className="btn btn-gold"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" style={{ marginRight: "8px" }} />
                    Confirmando...
                  </>
                ) : (
                  "Confirmar Pagamento"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default ContractSign;