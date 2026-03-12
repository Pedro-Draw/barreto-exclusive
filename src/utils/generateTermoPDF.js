import jsPDF from "jspdf"

export default async function generateTermoPDF(nome,assinatura){

const pdf = new jsPDF()

pdf.setFontSize(16)

pdf.text("TERMO DE CIÊNCIA DE RISCO",20,20)

pdf.setFontSize(12)

pdf.text(`Aluno: ${nome}`,20,40)

pdf.text(`Brasília/DF - 2026`,20,50)

pdf.text("Declaro estar ciente dos riscos do Jiu-Jitsu.",20,70)

pdf.addImage(assinatura,"PNG",20,90,120,40)

pdf.text("Assinatura do aluno",20,140)

pdf.save(`termo-${nome}.pdf`)

}