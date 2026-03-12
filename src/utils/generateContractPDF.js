// src/utils/generateContractPDF.js
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ← import explícito + nome da função

export async function generateContractPDF(userData, medicalData, signatureDataUrl, planInfo, contractDate = new Date()) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;

  // Cabeçalho
  doc.setFontSize(22);
  doc.setTextColor(212, 175, 55); // gold
  doc.text('Barreto Exclusive', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Contrato de Prestação de Serviços + Ficha Médica', pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`Data: ${contractDate.toLocaleDateString('pt-BR')}`, pageWidth - margin, 45, { align: 'right' });

  doc.line(margin, 50, pageWidth - margin, 50);

  // Informações do aluno
  doc.setFontSize(12);
  doc.text('Dados do Aluno:', margin, 65);

  doc.setFontSize(11);
  const userTable = [
    ['Nome completo', userData.nome || '—'],
    ['E-mail', userData.email || '—'],
    ['Plano contratado', planInfo.nome || '—'],
    ['Valor', planInfo.preco || '—'],
    ['Vigência até', planInfo.expiresAt ? new Date(planInfo.expiresAt).toLocaleDateString('pt-BR') : '—']
  ];

  // Usa autoTable importado explicitamente
  autoTable(doc, {
    startY: 70,
    head: [['Campo', 'Informação']],
    body: userTable,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [212, 175, 55], textColor: [0, 0, 0] },
    margin: { left: margin, right: margin }
  });

  let finalY = doc.lastAutoTable.finalY + 15;

  // Ficha médica resumida
  doc.setFontSize(12);
  doc.text('Resumo da Ficha Médica:', margin, finalY);

  finalY += 8;

  doc.setFontSize(10);
  doc.text(`Alergias: ${medicalData.alergias || 'Nenhuma informada'}`, margin, finalY);
  finalY += 7;
  doc.text(`Problemas cardíacos: ${medicalData.cardiaco === 'sim' ? 'Sim - ' + (medicalData.cardiacoDetalhe || '') : 'Não'}`, margin, finalY);
  finalY += 7;
  doc.text(`Lesões recentes: ${medicalData.lesoes || 'Nenhuma'}`, margin, finalY);
  finalY += 7;
  doc.text(`Medicamentos em uso: ${medicalData.medicamentos || 'Nenhum'}`, margin, finalY);

  finalY += 15;

  // Declaração de aceite
  doc.setFontSize(11);
  doc.text('Eu, ' + (userData.nome || '[Nome]') + ', declaro que li, compreendi e aceito integralmente os termos do contrato,', margin, finalY);
  finalY += 7;
  doc.text('bem como forneci informações verdadeiras na ficha médica.', margin, finalY);

  finalY += 15;

  // Assinatura
  if (signatureDataUrl) {
    doc.addImage(signatureDataUrl, 'PNG', margin, finalY, 80, 30);
    doc.text('__________________________________', margin, finalY + 35);
    doc.text(userData.nome || 'Assinatura digital', margin, finalY + 42);
  }

  doc.setFontSize(9);
  doc.text('Documento gerado automaticamente pelo sistema Barreto Exclusive', margin, 280);

  return doc.output('datauristring');
}