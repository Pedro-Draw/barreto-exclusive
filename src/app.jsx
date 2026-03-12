
import React, { useState, useEffect, createContext, useContext } from "react";
import AppRoutes from "./rotas.jsx";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
} from "firebase/firestore";

import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";

import { generateContractPDF } from "./utils/generateContractPDF";

/* ===============================
GLOBAL CONTEXT
=============================== */
const AppContext = createContext();
export const useApp = () => useContext(AppContext);

/* ===============================
FIREBASE CONFIG
=============================== */
const firebaseConfig = {
  apiKey: "AIzaSyDzUKr7R8cbx4wCV96mgm7_Z_OzLgwzRFw",
  authDomain: "havk-d1abf.firebaseapp.com",
  projectId: "havk-d1abf",
  storageBucket: "havk-d1abf.firebasestorage.app",
  messagingSenderId: "586489470790",
  appId: "1:586489470790:web:a8f4ced65b0075609a4f47",
  measurementId: "G-2ZYFF0M9XK",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ===============================
COLLECTIONS
=============================== */
const usersRef = collection(db, "users");
const plansRef = collection(db, "plans");
const subsRef = collection(db, "subscriptions");
const activityRef = collection(db, "activity");
const notificationsRef = collection(db, "notifications");
const contractsRef = collection(db, "contracts");
const medicalRef = collection(db, "medicalForms");

/* ===============================
UTILS
=============================== */
function now() {
  return new Date().toISOString();
}

function toast(msg) {
  window.dispatchEvent(new CustomEvent("toast", { detail: msg }));
}

/* ===============================
WHATSAPP PAYMENT
=============================== */
function openWhatsApp(plan) {
  const phone = "5561981538330";
  const message = encodeURIComponent(
    `Olá! Quero assinar o plano ${plan.nome} da Barreto Exclusive.`
  );
  window.open(`https://wa.me/${phone}?text=${message}`);
}

/* ===============================
THEME
=============================== */
function loadTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) {
    document.body.className = saved;
  }
}

function toggleTheme() {
  const current = document.body.classList.contains("light");
  const next = current ? "dark" : "light";
  document.body.className = next;
  localStorage.setItem("theme", next);
}

/* ===============================
AUTH HELPERS
=============================== */
async function registerUser(email, password, nome) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", res.user.uid), {
    nome,
    email,
    role: "user",
    plano: null,
    expiresAt: null,
    createdAt: now(),
    blocked: false,
  });
  return res.user;
}

async function loginUser(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

async function loginGoogle() {
  const provider = new GoogleAuthProvider();
  const res = await signInWithPopup(auth, provider);
  const docSnap = await getDoc(doc(db, "users", res.user.uid));
  if (!docSnap.exists()) {
    await setDoc(doc(db, "users", res.user.uid), {
      nome: res.user.displayName,
      email: res.user.email,
      role: "user",
      plano: null,
      expiresAt: null,
      createdAt: now(),
      blocked: false,
    });
  }
  return res.user;
}

function logout() {
  localStorage.removeItem("authUser"); // remove login DEV
  signOut(auth);
}

/* ===============================
DATABASE - PLANOS E ASSINATURAS
=============================== */
async function getPlans() {
  const snap = await getDocs(plansRef);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

async function subscribePlan(userId, plan) {
  await addDoc(subsRef, {
    userId,
    planId: plan.id,
    status: "pending",
    createdAt: now(),
  });
  openWhatsApp(plan);
}

/* ===============================
ATUALIZAR ASSINATURA
=============================== */
async function updateSubscription(userId, plan, isRenewal = false) {
  const userRef = doc(db, "users", userId);
  const durationDays = plan.duracaoDias || 30;

  const start = new Date();
  const end = new Date(start.getTime() + durationDays * 86400000);

  await updateDoc(userRef, {
    plano: plan.id,
    expiresAt: end.toISOString(),
    updatedAt: now(),
  });

  await addDoc(subsRef, {
    userId,
    planId: plan.id,
    status: "active",
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    createdAt: now(),
  });

  addActivity(userId, "subscription_updated");
  toast("Assinatura atualizada com sucesso!");
}

/* ===============================
GERAR E SALVAR PDF DO CONTRATO
=============================== */
async function generateAndSaveContract(userId, userData, medicalData, signatureDataUrl, planInfo) {
  try {
    const pdfDataUri = await generateContractPDF(userData, medicalData, signatureDataUrl, planInfo);

    const base64 = pdfDataUri.split(",")[1];

    const storageRef = ref(storage, `contracts/${userId}/contrato-${now()}.pdf`);

    await uploadString(storageRef, base64, "base64", {
      contentType: "application/pdf",
    });

    const pdfUrl = await getDownloadURL(storageRef);

    await setDoc(doc(db, "contracts", userId), {
      userId,
      pdfUrl,
      planId: planInfo.id,
      accepted: true,
      acceptedAt: now(),
    });

    await updateDoc(doc(db, "users", userId), {
      contractPdfUrl: pdfUrl,
    });

    return pdfUrl;
  } catch (err) {
    console.error(err);
    toast("Erro ao gerar contrato");
    throw err;
  }
}

/* ===============================
FUNÇÕES AUXILIARES
=============================== */
async function saveContract(userId, data) {
  await setDoc(doc(db, "contracts", userId), {
    ...data,
    accepted: true,
    date: now(),
  });
}

async function saveMedical(userId, data) {
  await setDoc(doc(db, "medicalForms", userId), {
    ...data,
    date: now(),
  });
}

async function addActivity(userId, type) {
  await addDoc(activityRef, {
    userId,
    type,
    date: now(),
  });
}

async function sendNotification(userId, msg) {
  await addDoc(notificationsRef, {
    userId,
    msg,
    date: now(),
    read: false,
  });
}

/* ===============================
TOAST
=============================== */
function Toast() {
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      setMsg(e.detail);
      setTimeout(() => setMsg(null), 3000);
    };
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  if (!msg) return null;

  return <div className="toast">{msg}</div>;
}

/* ===============================
APP
=============================== */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();

    /* ===============================
    LOGIN DEV (ANTES DO FIREBASE)
    =============================== */
    const dev = localStorage.getItem("authUser");

    if (dev) {
      const parsed = JSON.parse(dev);

      if (parsed.uid === "dev-user") {
        setUser({
          id: "dev-user",
          nome: "Pedro Dev",
          email: "pedro@exemplo.com",
          role: "admin",
          plano: "dev",
          expiresAt: null,
        });

        setLoading(false);
        return;
      }
    }

    /* ===============================
    FIREBASE AUTH
    =============================== */
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setLoading(false);
        return;
      }

      const docSnap = await getDoc(doc(db, "users", u.uid));

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          id: u.uid,
          ...userData,
          expiresAt: userData.expiresAt || null,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: "80px" }}>
        <div className="card skeleton" style={{ height: 200 }}></div>
      </div>
    );
  }

  const value = {
    user,
    setUser,

    loginUser,
    registerUser,
    loginGoogle,
    logout,

    getPlans,
    subscribePlan,
    updateSubscription,
    generateAndSaveContract,

    saveContract,
    saveMedical,
    addActivity,
    sendNotification,

    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      <Toast />
      <AppRoutes />
    </AppContext.Provider>
  );
}

export default App;

export { db, storage, auth };

