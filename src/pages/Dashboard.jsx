import React from "react"
import { useApp } from "../App.jsx"

function Dashboard(){

const {user,addActivity,saveContract,saveMedical} = useApp()

const [contractAccepted,setContractAccepted] = React.useState(false)
const [medicalDone,setMedicalDone] = React.useState(false)

const [medical,setMedical] = React.useState({
idade:"",
peso:"",
lesoes:"",
objetivo:""
})

/* =========================
SIMULA STATUS
========================= */

React.useEffect(()=>{

if(!user) return

addActivity(user.id,"login")

},[user])

/* =========================
CONTRATO
========================= */

async function acceptContract(){

await saveContract(user.id,{
nome:user.nome
})

setContractAccepted(true)

}

/* =========================
ANAMNESE
========================= */

async function sendMedical(e){

e.preventDefault()

await saveMedical(user.id,medical)

setMedicalDone(true)

}

/* =========================
RENDER
========================= */

return(

<div className="container">

<h2 style={{marginBottom:"30px"}}>
Dashboard
</h2>

{/* STATUS */}

<div className="grid grid-3">

<div className="card">

<h3>Aluno</h3>

<p>{user?.nome}</p>

</div>

<div className="card">

<h3>Plano</h3>

<p>{user?.plano || "Nenhum ativo"}</p>

</div>

<div className="card">

<h3>Status</h3>

<p>
{user?.plano ? "Ativo" : "Sem assinatura"}
</p>

</div>

</div>

{/* CONTRATO */}

<div className="card" style={{marginTop:"40px"}}>

<h3>
Contrato de Treinamento
</h3>

<p style={{marginBottom:"20px"}}>
Para iniciar os treinos é necessário aceitar o contrato digital.
</p>

{contractAccepted ? (

<div>
Contrato aceito.
</div>

):(

<button
className="btn btn-gold"
onClick={acceptContract}
>
Aceitar Contrato
</button>

)}

</div>

{/* ANAMNESE */}

<div className="card" style={{marginTop:"40px"}}>

<h3>
Ficha de Anamnese
</h3>

{medicalDone ? (

<p>
Ficha enviada com sucesso.
</p>

):(

<form onSubmit={sendMedical}>

<input
type="number"
placeholder="Idade"
value={medical.idade}
onChange={e=>setMedical({...medical,idade:e.target.value})}
/>

<input
type="number"
placeholder="Peso"
value={medical.peso}
onChange={e=>setMedical({...medical,peso:e.target.value})}
/>

<input
type="text"
placeholder="Lesões ou limitações"
value={medical.lesoes}
onChange={e=>setMedical({...medical,lesoes:e.target.value})}
/>

<input
type="text"
placeholder="Objetivo com o treino"
value={medical.objetivo}
onChange={e=>setMedical({...medical,objetivo:e.target.value})}
/>

<button
className="btn btn-gold"
style={{marginTop:"10px"}}
>
Enviar Ficha
</button>

</form>

)}

</div>

{/* NOTIFICAÇÕES */}

<div className="card" style={{marginTop:"40px"}}>

<h3>
Notificações
</h3>

<ul style={{marginTop:"10px"}}>

<li>Bem-vindo à Barreto Exclusive.</li>
<li>Complete sua ficha de anamnese.</li>
<li>Assine um plano para iniciar os treinos.</li>

</ul>

</div>

{/* HISTÓRICO */}

<div className="card" style={{marginTop:"40px"}}>

<h3>
Atividade Recente
</h3>

<ul>

<li>Login realizado</li>
<li>Conta criada</li>

</ul>

</div>

</div>

)

}

export default Dashboard