import React from "react"
import { useApp } from "../App.jsx"

function Config(){

const {toggleTheme,logout} = useApp()

const [notifications,setNotifications] = React.useState(
localStorage.getItem("notifications") !== "false"
)

const [message,setMessage] = React.useState("")

/* =========================
TOGGLE NOTIFICATIONS
========================= */

function toggleNotifications(){

const newValue = !notifications

setNotifications(newValue)

localStorage.setItem("notifications",newValue)

setMessage("Preferência salva.")

setTimeout(()=>setMessage(""),2000)

}

/* =========================
CLEAR LOCAL DATA
========================= */

function clearLocal(){

localStorage.clear()

setMessage("Dados locais removidos.")

setTimeout(()=>setMessage(""),2000)

}

/* =========================
RENDER
========================= */

return(

<div className="container">

<h2 style={{marginBottom:"30px"}}>
Configurações
</h2>

{/* TEMA */}

<div className="card">

<h3 style={{marginBottom:"15px"}}>
Tema
</h3>

<p style={{marginBottom:"15px"}}>
Alternar entre modo claro e escuro.
</p>

<button
className="btn btn-gold"
onClick={toggleTheme}
>
Alternar Tema
</button>

</div>

{/* NOTIFICAÇÕES */}

<div className="card" style={{marginTop:"30px"}}>

<h3 style={{marginBottom:"15px"}}>
Notificações
</h3>

<label style={{
display:"flex",
alignItems:"center",
gap:"10px"
}}>

<input
type="checkbox"
checked={notifications}
onChange={toggleNotifications}
/>

Receber notificações do sistema

</label>

</div>

{/* LIMPAR DADOS */}

<div className="card" style={{marginTop:"30px"}}>

<h3 style={{marginBottom:"15px"}}>
Limpar dados locais
</h3>

<p style={{marginBottom:"10px"}}>
Remove preferências salvas no navegador.
</p>

<button
className="btn btn-outline"
onClick={clearLocal}
>
Limpar Dados
</button>

</div>

{/* LOGOUT */}

<div className="card" style={{marginTop:"30px"}}>

<h3 style={{marginBottom:"15px"}}>
Conta
</h3>

<button
className="btn btn-outline"
onClick={logout}
>
Sair da Conta
</button>

</div>

{/* VERSÃO */}

<div className="card" style={{marginTop:"30px"}}>

<h3>
Sistema
</h3>

<p style={{marginTop:"10px"}}>
Barreto Exclusive SaaS
</p>

<p>
Versão 1.0
</p>

</div>

{/* MENSAGEM */}

{message && (

<div style={{
marginTop:"20px",
color:"green"
}}>

{message}

</div>

)}

</div>

)

}

export default Config