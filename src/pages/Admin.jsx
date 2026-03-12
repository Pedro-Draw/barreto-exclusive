// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { useApp } from "../App.jsx";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../App.jsx"; // ajuste se db/storage não estiver exportado
import {
  Users,
  UserCheck,
  UserX,
  Bell,
  Edit,
  Upload,
  Plus,
  Loader2,
} from "lucide-react";

function Admin() {
  const { sendNotification, updateSubscription } = useApp();

  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);

  // Novo: form para criar/editar plano
  const [newPlan, setNewPlan] = useState({
    nome: "",
    preco: "",
    duracaoDias: 30,
    aulasPorSemana: "",
    descricao: "",
  });
  const [uploadingContent, setUploadingContent] = useState(false);

  /* =========================
  CARREGAR DADOS
  ========================= */
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        // Usuários
        const usersSnap = await getDocs(collection(db, "users"));
        const userList = usersSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setUsers(userList);

        // Planos
        const plansSnap = await getDocs(collection(db, "plans"));
        const planList = plansSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setPlans(planList);
      } catch (err) {
        console.error("Erro ao carregar dados admin:", err);
        setMessage("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* =========================
  ALTERAR PLANO
  ========================= */
  async function changePlan(userId, planId) {
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    try {
      // Atualiza user com plano e recalcula expiresAt
      await updateSubscription(userId, selectedPlan);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, plano: planId } : u
        )
      );

      setMessage("Plano atualizado com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Erro ao atualizar plano.");
      console.error(err);
    }
  }

  /* =========================
  BLOQUEAR/DESBLOQUEAR
  ========================= */
  async function toggleBlock(user) {
    try {
      await updateDoc(doc(db, "users", user.id), {
        blocked: !user.blocked,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, blocked: !user.blocked } : u
        )
      );

      setMessage(`Usuário ${user.blocked ? "desbloqueado" : "bloqueado"}.`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Erro ao alterar bloqueio.");
    }
  }

  /* =========================
  ENVIAR NOTIFICAÇÃO
  ========================= */
  async function notify() {
    if (!selectedUser || !message.trim()) return;

    try {
      await sendNotification(selectedUser, message);
      setMessage("");
      alert("Notificação enviada com sucesso!");
    } catch (err) {
      alert("Erro ao enviar notificação.");
    }
  }

  /* =========================
  CRIAR/EDITAR PLANO (simples)
  ========================= */
  async function handleCreatePlan(e) {
    e.preventDefault();
    if (!newPlan.nome || !newPlan.preco) return;

    try {
      await addDoc(collection(db, "plans"), {
        ...newPlan,
        preco: Number(newPlan.preco),
        duracaoDias: Number(newPlan.duracaoDias),
        createdAt: new Date().toISOString(),
      });

      // Recarrega planos
      const plansSnap = await getDocs(collection(db, "plans"));
      setPlans(plansSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      setNewPlan({
        nome: "",
        preco: "",
        duracaoDias: 30,
        aulasPorSemana: "",
        descricao: "",
      });

      setMessage("Plano criado com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Erro ao criar plano.");
    }
  }

  /* =========================
  UPLOAD DE CONTEÚDO (ex: vídeo para técnicas)
  ========================= */
  async function handleContentUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingContent(true);

    try {
      const storageRef = ref(storage, `conteudo/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Aqui você pode salvar metadados no Firestore
      await addDoc(collection(db, "conteudo"), {
        nome: file.name,
        url,
        tipo: file.type.includes("video") ? "video" : "imagem",
        uploadedAt: new Date().toISOString(),
      });

      alert("Conteúdo enviado com sucesso! URL: " + url);
    } catch (err) {
      alert("Erro ao enviar arquivo.");
      console.error(err);
    } finally {
      setUploadingContent(false);
    }
  }

  /* =========================
  VER DETALHES DO USUÁRIO
  ========================= */
  function viewUserDetails(user) {
    setSelectedUserDetails(user);
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px", textAlign: "center" }}>
        <Loader2 size={40} className="animate-spin" />
        <p style={{ marginTop: "16px" }}>Carregando painel admin...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>
        Painel Administrativo
      </h2>

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

      {/* LISTA DE USUÁRIOS */}
      <div className="card" style={{ marginBottom: "40px", overflowX: "auto" }}>
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Users size={22} /> Alunos Cadastrados
        </h3>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>Nome</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Plano</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Vencimento</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              <th style={{ padding: "12px", textAlign: "center" }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const expires = u.expiresAt ? new Date(u.expiresAt) : null;
              const expired = expires && expires < new Date();
              const daysLeft = expires ? differenceInDays(expires, new Date()) : null;

              return (
                <tr key={u.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{u.nome}</td>
                  <td style={{ padding: "12px" }}>{u.email}</td>
                  <td style={{ padding: "12px" }}>
                    {u.plano || "Nenhum"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {expires ? format(expires, "dd/MM/yyyy") : "—"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        color: u.blocked
                          ? "#ef4444"
                          : expired
                          ? "#f59e0b"
                          : "#22c55e",
                        fontWeight: "bold",
                      }}
                    >
                      {u.blocked
                        ? "Bloqueado"
                        : expired
                        ? "Expirado"
                        : "Ativo"}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <select
                      onChange={(e) => changePlan(u.id, e.target.value)}
                      value={u.plano || ""}
                      style={{ marginRight: "8px", padding: "6px" }}
                    >
                      <option value="">Sem plano</option>
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>

                    <button
                      className="btn btn-outline"
                      style={{ margin: "0 4px" }}
                      onClick={() => toggleBlock(u)}
                    >
                      {u.blocked ? "Desbloquear" : "Bloquear"}
                    </button>

                    <button
                      className="btn btn-gold"
                      style={{ margin: "0 4px" }}
                      onClick={() => setSelectedUser(u.id)}
                    >
                      Notificar
                    </button>

                    <button
                      className="btn btn-outline"
                      onClick={() => viewUserDetails(u)}
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ENVIAR NOTIFICAÇÃO */}
      {selectedUser && (
        <div className="card" style={{ marginBottom: "40px" }}>
          <h3 style={{ marginBottom: "16px" }}>
            Enviar Notificação para Usuário
          </h3>
          <textarea
            placeholder="Digite a mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              height: "100px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              marginBottom: "12px",
            }}
          />
          <button className="btn btn-gold" onClick={notify}>
            <Bell size={18} style={{ marginRight: "8px" }} />
            Enviar Notificação
          </button>
        </div>
      )}

      {/* DETALHES DO USUÁRIO (MODAL SIMPLES) */}
      {selectedUserDetails && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedUserDetails(null)}
        >
          <div
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Detalhes do Usuário</h3>
            <pre style={{ background: "#f8f9fa", padding: "16px", borderRadius: "8px" }}>
              {JSON.stringify(selectedUserDetails, null, 2)}
            </pre>
            <button
              className="btn btn-outline"
              onClick={() => setSelectedUserDetails(null)}
              style={{ marginTop: "16px" }}
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* GERENCIAMENTO DE PLANOS */}
      <div className="card" style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Edit size={22} /> Gerenciar Planos
        </h3>

        {/* Lista de planos atuais */}
        <div style={{ marginBottom: "24px" }}>
          <h4>Planos Existentes</h4>
          {plans.length === 0 ? (
            <p>Nenhum plano cadastrado ainda.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {plans.map((p) => (
                <li
                  key={p.id}
                  style={{
                    padding: "12px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <strong>{p.nome}</strong> - R${p.preco} - {p.duracaoDias} dias
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Form criar novo plano */}
        <form onSubmit={handleCreatePlan}>
          <h4>Criar Novo Plano</h4>
          <input
            type="text"
            placeholder="Nome do plano"
            value={newPlan.nome}
            onChange={(e) => setNewPlan({ ...newPlan, nome: e.target.value })}
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
            required
          />
          <input
            type="number"
            placeholder="Preço (R$)"
            value={newPlan.preco}
            onChange={(e) => setNewPlan({ ...newPlan, preco: e.target.value })}
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
            required
          />
          <input
            type="number"
            placeholder="Duração em dias"
            value={newPlan.duracaoDias}
            onChange={(e) => setNewPlan({ ...newPlan, duracaoDias: e.target.value })}
            style={{ width: "100%", padding: "10px", marginBottom: "12px" }}
          />
          <button type="submit" className="btn btn-gold">
            <Plus size={18} style={{ marginRight: "8px" }} />
            Criar Plano
          </button>
        </form>
      </div>

      {/* UPLOAD DE CONTEÚDO */}
      <div className="card">
        <h3 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
          <Upload size={22} /> Upload de Conteúdo (Vídeos/Técnicas)
        </h3>
        <input
          type="file"
          accept="video/*,image/*"
          onChange={handleContentUpload}
          disabled={uploadingContent}
          style={{ marginBottom: "12px" }}
        />
        {uploadingContent && (
          <p style={{ color: "#21201b" }}>
            <Loader2 size={16} className="animate-spin" style={{ marginRight: "8px" }} />
            Enviando arquivo...
          </p>
        )}
      </div>
    </div>
  );
}

export default Admin;