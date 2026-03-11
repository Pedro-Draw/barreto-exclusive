import React from "react"
import { useApp } from "../App.jsx"

function Admin(){

const {sendNotification} = useApp()

const [users,setUsers] = React.useState([])
const [loading,setLoading] = React.useState(true)

const [message,setMessage] = React.useState("")
const [selectedUser,setSelectedUser] = React.useState(null)

/* =========================
LOAD USERS
========================= */

React.useEffect(()=>{

async function load(){

const snap = await firebase.firestore().collection("users").get()

const list = snap.docs.map(d=>({
id:d.id,
...d.data()
}))

setUsers(list)

setLoading(false)

}

load()

},[])

/* =========================
ALTERAR PLANO
========================= */

async function changePlan(userId,plan){

await firebase.firestore()
.collection("users")
.doc(userId)
.update({plano:plan})

setUsers(users.map(u =>
u.id === userId ? {...u,plano:plan} : u
))

}

/* =========================
BLOQUEAR
========================= */

async function toggleBlock(user){

await firebase.firestore()
.collection("users")
.doc(user.id)
.update({blocked:!user.blocked})

setUsers(users.map(u =>
u.id === user.id ? {...u,blocked:!u.blocked} : u
))

}

/* =========================
NOTIFICAR
========================= */

async function notify(){

if(!selectedUser || !message) return

await sendNotification(selectedUser,message)

setMessage("")
alert("Notificação enviada.")

}

/* =========================
RENDER
========================= */

if(loading){

return(

<div className="container">
Carregando usuários...
</div>

)

}

return(

<div className="container">

<h2 style={{marginBottom:"30px"}}>
Painel Admin
</h2>

{/* LISTA */}

<div className="card">

<h3>Alunos</h3>

<table style={{width:"100%",marginTop:"20px"}}>

<thead>

<tr>
<th>Nome</th>
<th>Email</th>
<th>Plano</th>
<th>Status</th>
<th>Ações</th>
</tr>

</thead>

<tbody>

{users.map(user=>(

<tr key={user.id}>

<td>{user.nome}</td>

<td>{user.email}</td>

<td>{user.plano || "Nenhum"}</td>

<td>
{user.blocked ? "Bloqueado" : "Ativo"}
</td>

<td>

<select
onChange={(e)=>changePlan(user.id,e.target.value)}
value={user.plano || ""}
>

<option value="">Sem plano</option>
<option value="Mensal 1x">Mensal 1x</option>
<option value="Mensal 2x">Mensal 2x</option>
<option value="Semestral 1x">Semestral 1x</option>
<option value="Semestral 2x">Semestral 2x</option>
<option value="Anual 1x">Anual 1x</option>
<option value="Anual 2x">Anual 2x</option>

</select>

<button
className="btn btn-outline"
style={{marginLeft:"10px"}}
onClick={()=>toggleBlock(user)}
>
{user.blocked ? "Desbloquear" : "Bloquear"}
</button>

<button
className="btn btn-gold"
style={{marginLeft:"10px"}}
onClick={()=>setSelectedUser(user.id)}
>
Notificar
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

{/* NOTIFICAÇÃO */}

{selectedUser && (

<div className="card" style={{marginTop:"40px"}}>

<h3>Enviar Notificação</h3>

<textarea
placeholder="Mensagem"
value={message}
onChange={e=>setMessage(e.target.value)}
style={{
width:"100%",
height:"100px",
marginTop:"10px"
}}
/>

<button
className="btn btn-gold"
style={{marginTop:"10px"}}
onClick={notify}
>
Enviar
</button>

</div>

)}

</div>

)

}

export default Admin