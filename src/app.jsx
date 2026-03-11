import React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import AppRoutes from "./rotas.jsx"

import { initializeApp } from "firebase/app"
import {
getAuth,
createUserWithEmailAndPassword,
signInWithEmailAndPassword,
GoogleAuthProvider,
signInWithPopup,
onAuthStateChanged,
signOut
} from "firebase/auth"

import {
getFirestore,
doc,
setDoc,
getDoc,
collection,
getDocs,
addDoc
} from "firebase/firestore"

/* ===============================
GLOBAL CONTEXT
=============================== */

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

/* ===============================
FIREBASE CONFIG
=============================== */

const firebaseConfig = {

apiKey:"demo-key",
authDomain:"barreto-exclusive.firebaseapp.com",
projectId:"barreto-exclusive",
storageBucket:"barreto-exclusive.appspot.com",
messagingSenderId:"000000000",
appId:"1:000000:web:000000"

}

const app = initializeApp(firebaseConfig)

const auth = getAuth(app)
const db = getFirestore(app)

/* ===============================
COLLECTIONS
=============================== */

const usersRef = collection(db,"users")
const plansRef = collection(db,"plans")
const subsRef = collection(db,"subscriptions")
const activityRef = collection(db,"activity")
const notificationsRef = collection(db,"notifications")
const contractsRef = collection(db,"contracts")
const medicalRef = collection(db,"medicalForms")

/* ===============================
UTILS
=============================== */

function now(){
return new Date().toISOString()
}

function toast(msg){
window.dispatchEvent(new CustomEvent("toast",{detail:msg}))
}

/* ===============================
WHATSAPP PAYMENT
=============================== */

function openWhatsApp(plan){

const phone = "5561981538330"

const message = encodeURIComponent(
`Olá! Quero assinar o plano ${plan.nome} da Barreto Exclusive.`
)

window.open(`https://wa.me/${phone}?text=${message}`)

}

/* ===============================
THEME
=============================== */

function loadTheme(){

const saved = localStorage.getItem("theme")

if(saved){
document.body.className = saved
}

}

function toggleTheme(){

const current = document.body.classList.contains("light")

const next = current ? "dark" : "light"

document.body.className = next

localStorage.setItem("theme",next)

}

/* ===============================
AUTH HELPERS
=============================== */

async function registerUser(email,password,nome){

const res = await createUserWithEmailAndPassword(auth,email,password)

await setDoc(doc(db,"users",res.user.uid),{

nome,
email,
role:"user",
plano:null,
createdAt:now(),
blocked:false

})

return res.user

}

async function loginUser(email,password){
return signInWithEmailAndPassword(auth,email,password)
}

async function loginGoogle(){

const provider = new GoogleAuthProvider()

const res = await signInWithPopup(auth,provider)

const docSnap = await getDoc(doc(db,"users",res.user.uid))

if(!docSnap.exists()){

await setDoc(doc(db,"users",res.user.uid),{

nome:res.user.displayName,
email:res.user.email,
role:"user",
plano:null,
createdAt:now(),
blocked:false

})

}

return res.user

}

function logout(){
signOut(auth)
}

/* ===============================
DATABASE
=============================== */

async function getPlans(){

const snap = await getDocs(plansRef)

return snap.docs.map(d=>({
id:d.id,
...d.data()
}))

}

async function subscribePlan(userId,plan){

await addDoc(subsRef,{

userId,
planId:plan.id,
status:"pending",
createdAt:now()

})

openWhatsApp(plan)

}

async function saveContract(userId,data){

await setDoc(doc(db,"contracts",userId),{

...data,
accepted:true,
date:now()

})

}

async function saveMedical(userId,data){

await setDoc(doc(db,"medicalForms",userId),{

...data,
date:now()

})

}

async function addActivity(userId,type){

await addDoc(activityRef,{

userId,
type,
date:now()

})

}

async function sendNotification(userId,msg){

await addDoc(notificationsRef,{

userId,
msg,
date:now(),
read:false

})

}

/* ===============================
TOAST
=============================== */

function Toast(){

const [msg,setMsg] = useState(null)

useEffect(()=>{

const handler = e=>{

setMsg(e.detail)

setTimeout(()=>setMsg(null),3000)

}

window.addEventListener("toast",handler)

return ()=>window.removeEventListener("toast",handler)

},[])

if(!msg) return null

return(
<div className="toast">
{msg}
</div>
)

}

/* ===============================
APP
=============================== */

function App(){

const [user,setUser] = useState(null)
const [loading,setLoading] = useState(true)

useEffect(()=>{

loadTheme()

const unsub = onAuthStateChanged(auth,async u=>{

if(!u){

setUser(null)
setLoading(false)
return

}

const docSnap = await getDoc(doc(db,"users",u.uid))

if(docSnap.exists()){

setUser({
id:u.uid,
...docSnap.data()
})

}

setLoading(false)

})

return ()=>unsub()

},[])

if(loading){

return(

<div className="container" style={{padding:"80px"}}>

<div className="card skeleton" style={{height:200}}></div>

</div>

)

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

saveContract,
saveMedical,

addActivity,

sendNotification,

toggleTheme

}

return(

<AppContext.Provider value={value}>

<Toast/>

<AppRoutes/>

</AppContext.Provider>

)

}

export default App