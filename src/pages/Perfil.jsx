import React from "react"
import { useApp } from "../App.jsx"
import firebase from "firebase/compat/app"
import "firebase/compat/auth"
import "firebase/compat/firestore"

function Perfil(){

const {user,setUser} = useApp()

const [nome,setNome] = React.useState(user?.nome || "")
const [email,setEmail] = React.useState(user?.email || "")
const [password,setPassword] = React.useState("")

const [message,setMessage] = React.useState("")
const [error,setError] = React.useState("")
const [loading,setLoading] = React.useState(false)

/* =========================
ATUALIZAR PERFIL
========================= */

async function updateProfile(e){

e.preventDefault()

setError("")
setMessage("")

try{

setLoading(true)

await firebase.firestore()
.collection("users")
.doc(user.id)
.update({
nome:nome,
email:email
})

setUser({
...user,
nome:nome,
email:email
})

setMessage("Perfil atualizado com sucesso.")

}catch(err){

setError("Erro ao atualizar perfil.")

}

setLoading(false)

}

/* =========================
ALTERAR SENHA
========================= */

async function changePassword(){

if(!password){

setError("Digite uma nova senha.")

return

}

try{

setLoading(true)

const currentUser = firebase.auth().currentUser

await currentUser.updatePassword(password)

setMessage("Senha alterada com sucesso.")

setPassword("")

}catch(err){

setError("Erro ao alterar senha. Faça login novamente.")

}

setLoading(false)

}

/* =========================
RENDER
========================= */

return(

<div className="container">

<h2 style={{marginBottom:"30px"}}>

Perfil

</h2>

<div className="card">

<h3 style={{marginBottom:"20px"}}>

Informações Pessoais

</h3>

<form onSubmit={updateProfile}>

<input
type="text"
placeholder="Nome"
value={nome}
onChange={e=>setNome(e.target.value)}
/>

<input
type="email"
placeholder="Email"
value={email}
onChange={e=>setEmail(e.target.value)}
/>

<button
className="btn btn-gold"
disabled={loading}
>

{loading ? "Salvando..." : "Salvar Alterações"}

</button>

</form>

</div>

{/* ALTERAR SENHA */}

<div className="card" style={{marginTop:"30px"}}>

<h3 style={{marginBottom:"20px"}}>

Alterar Senha

</h3>

<input
type="password"
placeholder="Nova senha"
value={password}
onChange={e=>setPassword(e.target.value)}
/>

<button
className="btn btn-gold"
style={{marginTop:"10px"}}
onClick={changePassword}
disabled={loading}
>

Alterar Senha

</button>

</div>

{/* INFO DO PLANO */}

<div className="card" style={{marginTop:"30px"}}>

<h3>

Plano Atual

</h3>

<p style={{marginTop:"10px"}}>

{user?.plano || "Nenhum plano ativo"}

</p>

</div>

{/* MENSAGENS */}

{message && (

<div style={{
marginTop:"20px",
color:"green"
}}>

{message}

</div>

)}

{error && (

<div style={{
marginTop:"20px",
color:"red"
}}>

{error}

</div>

)}

</div>

)

}

export default Perfil