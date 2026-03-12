import jsPDF from "jspdf"

export async function generatePDF({nome, email, assinatura}) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text("Ficha Médica e Contrato", 20, 20)
  doc.setFontSize(12)
  doc.text(`Nome: ${nome}`, 20, 40)
  doc.text(`Email: ${email}`, 20, 50)

  // Informações contratuais e validações médicas
  doc.text("Contrato e validações médicas completas aqui...", 20, 70)

  if(assinatura){
    doc.addImage(assinatura, "PNG", 20, 120, 180, 50)
  }

  const pdfUrl = doc.output("dataurlstring")
  return pdfUrl
}