// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, db } from "../App.jsx";

import { format, differenceInDays } from "date-fns";

import {
  User,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Clock,
  Dumbbell,
  Bell,
  RefreshCw,
} from "lucide-react";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import RequireActivePlanBanner from "../components/RequireActivePlanBanner.jsx";

function Dashboard() {
  const { user, addActivity } = useApp();
  const navigate = useNavigate();

  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Registrar atividade de login no dashboard
  useEffect(() => {
    if (user) {
      addActivity(user.id, "login_dashboard");
    }
  }, [user]);

  // Carregar atividades e notificações
  useEffect(() => {
    if (!user) return;

    async function loadData() {
      setLoading(true);

      try {
        const activitySnap = await getDocs(
          query(
            collection(db, "activity"),
            where("userId", "==", user.id),
            orderBy("date", "desc"),
            limit(5)
          )
        );

        const acts = activitySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: new Date(doc.data().date),
        }));

        setActivities(acts);

        const notifSnap = await getDocs(
          query(
            collection(db, "notifications"),
            where("userId", "==", user.id),
            where("read", "==", false),
            orderBy("date", "desc")
          )
        );

        const notifs = notifSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: new Date(doc.data().date),
        }));

        setNotifications(notifs);
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: "80px", textAlign: "center" }}>
        Carregando...
      </div>
    );
  }

  const hasPlan = !!user.plano && !!user.expiresAt;
  const expiresDate = user.expiresAt ? new Date(user.expiresAt) : null;

  const isExpired = expiresDate && expiresDate < new Date();

  const daysLeft = expiresDate
    ? differenceInDays(expiresDate, new Date())
    : 0;

  const planDisplay =
    {
      particular: "Aula Particular",
      pacote8: "Pacote 8 Aulas",
      mensal1: "Mensal 1x/semana",
      mensal2: "Mensal 2x/semana",
      semestral1: "Semestral 1x/semana",
      semestral2: "Semestral 2x/semana",
      anual1: "Anual 1x/semana",
      anual2: "Anual 2x/semana",
    }[user.plano] || user.plano || "Nenhum plano ativo";

  return (
    <div className="container">
      <h2 style={{ marginBottom: "30px", textAlign: "center" }}>
        Bem-vindo de volta, {user.nome?.split(" ")[0]}!
      </h2>

      <RequireActivePlanBanner />

      {/* STATUS */}
      <div className="grid grid-3" style={{ marginBottom: "40px" }}>
        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <User size={22} /> Aluno
          </h3>
          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{user.nome}</p>
          <p style={{ opacity: 0.8 }}>{user.email}</p>
        </div>

        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <CreditCard size={22} /> Plano Atual
          </h3>

          <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {planDisplay}
          </p>

          {hasPlan && (
            <p style={{ opacity: 0.8 }}>
              Vence em {format(expiresDate, "dd/MM/yyyy")}
            </p>
          )}
        </div>

        <div className="card">
          <h3 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Clock size={22} /> Status
          </h3>

          {hasPlan ? (
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: isExpired
                  ? "#ef4444"
                  : daysLeft <= 7
                  ? "#f59e0b"
                  : "#22c55e",
              }}
            >
              {isExpired
                ? "Expirado"
                : daysLeft <= 7
                ? `Expirando em ${daysLeft} dias`
                : "Ativo"}
            </p>
          ) : (
            <p style={{ fontSize: "1.2rem", color: "#ef4444" }}>
              Sem assinatura
            </p>
          )}
        </div>
      </div>

      {/* AÇÃO PRINCIPAL */}
      <div
        className="card"
        style={{
          textAlign: "center",
          padding: "40px 20px",
          marginBottom: "40px",
          background: hasPlan && !isExpired ? "#f0fdf4" : "#fef2f2",
        }}
      >
        {hasPlan && !isExpired ? (
          <>
            <CheckCircle size={60} color="#22c55e" style={{ marginBottom: "16px" }} />

            <h3 style={{ marginBottom: "16px" }}>
              Tudo pronto para treinar!
            </h3>

            <p style={{ marginBottom: "24px", fontSize: "1.1rem" }}>
              Seu plano está ativo. Acesse as técnicas.
            </p>

            <button
              className="btn btn-gold"
              onClick={() => navigate("/tecnicas")}
              style={{ minWidth: "220px" }}
            >
              <Dumbbell size={20} style={{ marginRight: "10px" }} />
              Ver Técnicas
            </button>
          </>
        ) : (
          <>
            <AlertCircle size={60} color="#ef4444" style={{ marginBottom: "16px" }} />

            <h3 style={{ marginBottom: "16px" }}>
              {isExpired
                ? "Seu plano expirou"
                : "Complete sua assinatura"}
            </h3>

            <button
              className="btn btn-gold"
              onClick={() => navigate("/contract-sign")}
              style={{ minWidth: "220px" }}
            >
              <RefreshCw size={20} style={{ marginRight: "10px" }} />
              {isExpired ? "Renovar Agora" : "Assinar Agora"}
            </button>
          </>
        )}
      </div>

      {/* ATIVIDADE */}
      <div className="card" style={{ marginBottom: "40px" }}>
        <h3 style={{ marginBottom: "20px" }}>
          <Clock size={22} /> Atividade Recente
        </h3>

        {loading ? (
          <p>Carregando...</p>
        ) : activities.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {activities.map((act) => (
              <li
                key={act.id}
                style={{
                  padding: "12px 0",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{act.type?.replace("_", " ")}</span>

                <span style={{ opacity: 0.7 }}>
                  {format(act.date, "dd/MM HH:mm")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma atividade.</p>
        )}
      </div>

      {/* NOTIFICAÇÕES */}
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>
          <Bell size={22} /> Notificações
        </h3>

        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                padding: "12px",
                background: "#fefce8",
                borderRadius: "8px",
                marginBottom: "12px",
              }}
            >
              {notif.msg}

              <br />

              <small style={{ opacity: 0.7 }}>
                {format(notif.date, "dd/MM HH:mm")}
              </small>
            </div>
          ))
        ) : (
          <p>Nenhuma notificação.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;