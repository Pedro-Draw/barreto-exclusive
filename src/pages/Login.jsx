
import React from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../App.jsx"

import {
Eye,
EyeOff,
LogIn,
ShieldCheck,
Zap,
Award,
ArrowLeft,
Fingerprint,
ScanFace
} from "lucide-react"

import { FcGoogle } from "react-icons/fc"
import { motion } from "framer-motion"
import * as THREE from "three"

import "../../pages.css/Login.css"

function Login(){

const navigate = useNavigate()
const { loginUser, loginGoogle } = useApp()

/* CONTA DEV */
const DEV_EMAIL = "pedro@exemplo.com"
const DEV_PASSWORD = "Dev@1234"

const [email,setEmail] = React.useState(localStorage.getItem("rememberEmail") || "")
const [password,setPassword] = React.useState("")
const [showPassword,setShowPassword] = React.useState(false)
const [loading,setLoading] = React.useState(false)
const [error,setError] = React.useState("")
const [remember,setRemember] = React.useState(!!localStorage.getItem("rememberEmail"))

const canvasRef = React.useRef(null)

React.useEffect(()=>{
initThree()
},[])

/* THREE SPHERE */

function initThree(){

const canvas = canvasRef.current

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
60,
1,
0.1,
1000
)

const renderer = new THREE.WebGLRenderer({
canvas,
alpha:true,
antialias:true
})

renderer.setSize(260,260)
renderer.setPixelRatio(window.devicePixelRatio)

const geometry = new THREE.SphereGeometry(1,32,32)

const material = new THREE.MeshBasicMaterial({
color:0xd4af37,
wireframe:true
})

const sphere = new THREE.Mesh(geometry,material)

scene.add(sphere)

camera.position.z = 3

function animate(){

requestAnimationFrame(animate)

sphere.rotation.x += 0.003
sphere.rotation.y += 0.004

renderer.render(scene,camera)

}

animate()

}

/* LOGIN */

async function handleLogin(e){

e.preventDefault()

setError("")

if(!email || !password){
setError("Preencha email e senha.")
return
}

/* LOGIN DEV - executa antes do Firebase */

const emailNormalized = email.trim().toLowerCase()

if(emailNormalized === DEV_EMAIL && password === DEV_PASSWORD){

const devUser = {
uid:"dev-user",
email:DEV_EMAIL,
displayName:"Pedro Dev",
role:"admin",
plan:"dev"
}

/* salva usuário simulado */

localStorage.setItem("user", JSON.stringify(devUser))
localStorage.setItem("authUser", JSON.stringify(devUser))
localStorage.setItem("isAuthenticated","true")

if(remember){
localStorage.setItem("rememberEmail",email)
}else{
localStorage.removeItem("rememberEmail")
}

/* entra no sistema */

window.location.href = "/"

return
}

try{

setLoading(true)

/* LOGIN NORMAL FIREBASE */

await loginUser(email,password)

if(remember){
localStorage.setItem("rememberEmail",email)
}else{
localStorage.removeItem("rememberEmail")
}

}catch(err){

console.error(err)
setError("Email ou senha inválidos.")

}

setLoading(false)

}

/* GOOGLE */

async function handleGoogle(){

try{
await loginGoogle()
}catch{
setError("Erro Google")
}

}

/* BIOMETRIA */

async function loginBiometric(){

if(!window.PublicKeyCredential){
setError("Biometria não suportada.")
return
}

try{

await navigator.credentials.get({
publicKey:{
challenge:new Uint8Array(32),
timeout:60000,
userVerification:"preferred"
}
})

}catch{

setError("Falha biometria")

}

}

/* FACIAL */

async function loginFace(){

try{
await loginBiometric()
}catch{
setError("Facial não disponível.")
}

}

return(

<div className="login-page">

<canvas ref={canvasRef} className="sphere-canvas"/>

<div className="aurora"/>

<button
className="back-home"
onClick={()=>navigate("/")}
>

<ArrowLeft size={18}/>
Voltar

</button>

<div className="login-container">

<div className="login-brand">

<h1>Barreto Exclusive</h1>

<p>
Treinamento de Jiu-Jitsu de alto nível com aulas particulares,
evolução técnica acelerada e preparação para competição.
</p>

<div className="brand-features">

<div>
<ShieldCheck size={18}/>
Treinamento técnico de elite
</div>

<div>
<Zap size={18}/>
Evolução acelerada no Jiu-Jitsu
</div>

<div>
<Award size={18}/>
Metodologia focada em performance e competição
</div>

</div>

</div>

<motion.div
className="login-card"
initial={{opacity:0,y:40}}
animate={{opacity:1,y:0}}
transition={{duration:0.6}}
>

<h2>Entrar</h2>

<form onSubmit={handleLogin}>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
required
/>

<label className="remember">

<input
type="checkbox"
checked={remember}
onChange={()=>setRemember(!remember)}
/>

Lembrar email

</label>

<div className="password-wrapper">

<input
type={showPassword ? "text":"password"}
placeholder="Senha"
value={password}
onChange={(e)=>setPassword(e.target.value)}
required
/>

<button
type="button"
className="eye"
onClick={()=>setShowPassword(!showPassword)}
>
{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
</button>

</div>

<div className="forgot-wrapper">

<button
type="button"
className="forgot"
onClick={()=>alert("Enviar email recuperação")}
>
Esqueci minha senha
</button>

</div>

{error && (
<div className="login-error">
{error}
</div>
)}

<button
type="submit"
className="login-btn"
disabled={loading}
>

<LogIn size={18}/>
{loading ? "Entrando..." : "Entrar"}

</button>

</form>

<div className="divider">
<span>ou</span>
</div>

<button
className="google-btn"
onClick={handleGoogle}
>

<FcGoogle size={22}/>
Entrar com Google

</button>

<div className="biometric">

<button onClick={loginBiometric}>
<Fingerprint size={20}/>
Biometria
</button>

<button onClick={loginFace}>
<ScanFace size={20}/>
Facial
</button>

</div>

<div className="register">

Não tem conta?

<button onClick={()=>navigate("/register")}>
Criar conta
</button>

</div>

</motion.div>

</div>

</div>

)

}

export default Login
