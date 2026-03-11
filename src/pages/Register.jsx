import React from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../App.jsx"

function Register(){

const navigate = useNavigate()

const {registerUser,user} = useApp()

const [nome,setNome] = React.useState("")
const [email,setEmail] = React.useState("")
const [password,setPassword] = React.useState("")
const [confirm,setConfirm] = React.useState("")
const [terms,setTerms] = React.useState(false)

const [loading,setLoading] = React.useState(false)
const [error,setError] = React.useState("")

/* ======================
REDIRECT SE LOGADO
====================== */

React.useEffect(()=>{

if(user){

navigate("/dashboard")

}

},[user])

/* ======================
REGISTER
====================== */

async function handleRegister(e){

e.preventDefault()

setError("")

if(!nome || !email || !password || !confirm){

setError("Preencha todos os campos.")

return

}

if(password.length < 6){

setError("A senha precisa ter pelo menos 6 caracteres.")

return

}

if(password !== confirm){

setError("As senhas não coincidem.")

return

}

if(!terms){

setError("Você precisa aceitar os termos.")

return

}

try{

setLoading(true)

await registerUser(email,password,nome)

navigate("/dashboard")

}catch(err){

setError("Erro ao criar conta. Tente outro email.")

}

setLoading(false)

}

/* ======================
RENDER
====================== */

return(

<div className="container" style={{maxWidth:"500px"}}>

<div className="card">

<h2 style={{marginBottom:"20px"}}>

Criar Conta

</h2>

<form onSubmit={handleRegister}>

<input
type="text"
placeholder="Nome completo"
value={nome}
onChange={e=>setNome(e.target.value)}
/>

<input
type="email"
placeholder="Email"
value={email}
onChange={e=>setEmail(e.target.value)}
/>

<input
type="password"
placeholder="Senha"
value={password}
onChange={e=>setPassword(e.target.value)}
/>

<input
type="password"
placeholder="Confirmar senha"
value={confirm}
onChange={e=>setConfirm(e.target.value)}
/>

<label style={{
display:"flex",
gap:"10px",
marginBottom:"15px",
fontSize:"14px"
}}>

<input
type="checkbox"
checked={terms}
onChange={()=>setTerms(!terms)}
/>

<span>

Aceito os <a
style={{color:"#f5c542",cursor:"pointer"}}
onClick={()=>alert(`
TERMOS DE USO

1. Respeito no ambiente de treino
2. Compromisso com a evolução
3. Uso responsável da plataforma
`)}
>

Termos de Uso

</a>

</span>

</label>

{error && (

<div style={{
color:"red",
marginBottom:"10px"
}}>

{error}

</div>

)}

<button
className="btn btn-gold"
style={{width:"100%"}}
disabled={loading}
>

{loading ? "Criando conta..." : "Criar conta"}

</button>

</form>

<div style={{
marginTop:"20px",
textAlign:"center"
}}>

<span>

Já possui conta?

</span>

<button
className="btn btn-outline"
style={{marginLeft:"10px"}}
onClick={()=>navigate("/login")}
>

Entrar

</button>

</div>

</div>

</div>

)

}

export default Register