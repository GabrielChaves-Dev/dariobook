import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Usuario, Livro, Editora, Emprestimo, LogEstoque } from '../types';

// Helper to draw Government of Ceará / DarioBook SIB standard header
const drawHeader = (doc: jsPDF, title: string) => {
  // Flag / Colored accents
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(14, 10, 182, 3, 'F');
  
  doc.setFillColor(250, 204, 21); // Yellow-400
  doc.rect(14, 13, 182, 1, 'F');

  doc.setFillColor(22, 163, 74); // Green-600
  doc.rect(14, 14, 182, 1, 'F');

  // Institution title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('GOVERNO DO ESTADO DO CEARÁ', 14, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text('SECRETARIA DA EDUCAÇÃO DO CEARÁ - SEDUC', 14, 26);
  doc.text('SISTEMA INTEGRADO DE BIBLIOTECAS (SIB) - DARIOBOOK', 14, 30);

  // Divider
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(14, 33, 196, 33);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 118, 110); // Teal-700
  doc.text(title.toUpperCase(), 14, 42);

  // Date of Generation
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate-400
  const dateStr = new Date().toLocaleString('pt-BR');
  doc.text(`Gerado em: ${dateStr} | DarioBook SIB v4.8.2`, 14, 46);
  
  // Outer frame borders (optional decorative)
  doc.setDrawColor(241, 245, 249); // Slate-100
  doc.setLineWidth(1);
  doc.rect(10, 6, 190, 285);
};

// Helper to draw standardized footer with spacing
const drawFooter = (doc: jsPDF, pageCount: number) => {
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    
    // Page count
    doc.text(
      `Página ${i} de ${pageCount}`,
      196 - doc.getTextWidth(`Página ${i} de ${pageCount}`),
      285
    );
    
    // Footer notes
    doc.text(
      'DarioBook SIB - Sistema de Controle Integrado de Educação Integral do Ceará',
      14,
      285
    );
  }
};

/**
 * 1. Export Comprovante de Empréstimo (Loan Receipt Ticket)
 */
export const exportComprovanteEmprestimo = (
  loan: Emprestimo,
  user: Usuario,
  book: Livro,
  publisher?: Editora
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawHeader(doc, 'Comprovante de Saída de Livro (Empréstimo)');

  // Ticket frame
  doc.setFillColor(248, 250, 252); // Slate-50 backend
  doc.rect(14, 52, 182, 45, 'F');
  doc.setDrawColor(226, 232, 240); // Slate-200 border
  doc.rect(14, 52, 182, 45);

  // Ticket Header details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110);
  doc.text(`NÚMERO DO EMPRÉSTIMO: ${loan.id}`, 18, 58);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Status:`, 18, 64);
  
  doc.setFont('helvetica', 'bold');
  if (loan.status === 'Devolvido') {
    doc.setTextColor(16, 185, 129); // Green
    doc.text('DEVOLVIDO E ARQUIVADO', 32, 64);
  } else {
    // Check if overdue
    const isOverdue = new Date(loan.dataDevolucao) < new Date();
    if (isOverdue) {
      doc.setTextColor(239, 68, 68); // Red
      doc.text('ATIVO COM ATRASO PENDENTE', 32, 64);
    } else {
      doc.setTextColor(245, 158, 11); // Amber
      doc.text('ATIVO EM ANDAMENTO', 32, 64);
    }
  }

  // Set standard text color for properties
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Data de Retirada (Estoque):`, 18, 72);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${new Date(loan.dataEmprestimo + 'T00:00:00').toLocaleDateString('pt-BR')}`, 63, 72);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Data de Devolução Limite:`, 18, 78);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${new Date(loan.dataDevolucao + 'T00:00:00').toLocaleDateString('pt-BR')}`, 63, 78);

  if (loan.dataDevolucaoReal) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Data de Entrega Real:`, 18, 84);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`${new Date(loan.dataDevolucaoReal + 'T00:00:00').toLocaleDateString('pt-BR')}`, 63, 84);
  }

  // 1. Reader Details Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('DADOS DO RETIRANTE (BENEFICIÁRIO)', 14, 108);

  autoTable(doc, {
    startY: 112,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Campo', 'Informação Detalhada']],
    body: [
      ['Nome do Estudante/Docente', user ? user.nome : 'Usuário Removido'],
      ['Tipo de Função', user ? user.funcao : 'N/A'],
      ['Número do Registro Acadêmico / Matrícula', user ? user.matricula : 'N/A'],
      ['Documento de CPF', user ? user.cpf : 'N/A'],
      ['Curso / Eixo Tecnológico', user ? user.curso : 'N/A'],
      ['Série / Turma Escolar', user ? user.serie : 'N/A'],
      ['E-mail Escolar', user ? user.email : 'N/A'],
      ['Telefone de Contato', user ? user.telefone : 'N/A'],
      ['Endereço Registrado', user ? `${user.endereco.rua}, Nº ${user.endereco.numero} - ${user.endereco.bairro}, ${user.endereco.cidade} - ${user.endereco.uf}` : 'N/A'],
    ],
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 127 }
    }
  });

  // 2. Book Details Section (using previous autoTable's final Y position)
  const currentY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 118, 110);
  doc.text('DADOS DA OBRA LITERÁRIA ALUGADA', 14, currentY);

  autoTable(doc, {
    startY: currentY + 4,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    head: [['Atributo do Livro', 'Informação no Acervo']],
    body: [
      ['Código do Livro (ID)', book ? book.id : 'N/A'],
      ['Título da Obra', book ? book.nomeLivro : 'Livro Removido'],
      ['Autor Principal', book ? book.autor : 'N/A'],
      ['Editora Associada', publisher ? `${publisher.nomeEditora} (${publisher.id})` : 'N/A'],
      ['Ano de Publicação', book ? book.anoPublicacao : 'N/A'],
      ['Código de Barras / ISBN', book ? book.isbn : 'N/A'],
      ['Gênero / Categoria Temática', book ? book.categoria : 'N/A'],
    ],
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
      1: { cellWidth: 127 }
    }
  });

  // 3. Signature Blocks
  const signatureY = (doc as any).lastAutoTable.finalY + 22;

  // Librarian Signature Line
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(20, signatureY, 90, signatureY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Assinatura do Bibliotecário / Seduc', 23, signatureY + 4);
  doc.setFont('helvetica', 'italic');
  doc.text('Secretaria Escolar de Apoio Integral', 23, signatureY + 8);

  // Student Signature Line
  doc.line(110, signatureY, 180, signatureY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Assinatura do Recebedor', 123, signatureY + 4);
  doc.setFont('helvetica', 'bold');
  doc.text(user ? user.nome.slice(0, 30) : 'Beneficiário', 110, signatureY + 8);

  // Guidelines warning at footer
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    '* De acordo com o regimento escolar, a não devolução da obra literária na data correspondente acarretará na suspensão temporária de novos empréstimos.',
    14,
    signatureY + 18
  );

  drawFooter(doc, 1);
  doc.save(`Recibo_Emprestimo_${loan.id}.pdf`);
};

/**
 * 2. Export Relatório de Empréstimos (Active and Completed Loans Report)
 */
export const exportRelatorioEmprestimos = (
  loans: Emprestimo[],
  users: Usuario[],
  books: Livro[]
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Since landscape, A4 width is 297mm, margin 14 on left, 14 on right (width for tables is 269mm)
  // Custom drawHeader for landscape
  const drawLandscapeHeader = (title: string) => {
    doc.setFillColor(16, 185, 129); // Emerald-500
    doc.rect(14, 10, 269, 3, 'F');
    doc.setFillColor(250, 204, 21);
    doc.rect(14, 13, 269, 1, 'F');
    doc.setFillColor(22, 163, 74);
    doc.rect(14, 14, 269, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('GOVERNO DO ESTADO DO CEARÁ | SECRETARIA DA EDUCAÇÃO DO CEARÁ - SEDUC', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('SISTEMA INTEGRADO DE BIBLIOTECAS (SIB) | DARIOBOOK PORTAL AMBIENTE', 14, 26);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 29, 283, 29);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 118, 110);
    doc.text(title.toUpperCase(), 14, 37);

    // Metadata
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const dateStr = new Date().toLocaleString('pt-BR');
    doc.text(`Data do Relatório: ${dateStr} | DarioBook SIB | Banco de Dados Off-line (Sincronizado)`, 14, 41);
  };

  drawLandscapeHeader('Relatório Consolidado de Empréstimos e Controle de Prazos');

  // Summary box
  const totalLoans = loans.length;
  const activeCount = loans.filter(l => l.status === 'Ativo').length;
  const overdueCount = loans.filter(l => l.status === 'Ativo' && new Date(l.dataDevolucao) < new Date()).length;
  const compCount = loans.filter(l => l.status === 'Devolvido').length;

  doc.setFillColor(248, 250, 252);
  doc.rect(14, 46, 269, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 46, 269, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('MÉTRICAS DO PERÍODO:', 18, 51);

  doc.setFont('helvetica', 'normal');
  doc.text(`Total de Registros: `, 18, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${totalLoans}`, 45, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Pendentes Ativos: `, 65, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text(`${activeCount}`, 90, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Atrasados (Prazo Vencido): `, 115, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text(`${overdueCount}`, 155, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Devolvidos/Arquivados: `, 180, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${compCount}`, 215, 56);

  // Table rows map
  const tableRows = loans.map((l) => {
    const user = users.find((u) => u.id === l.usuarioId);
    const book = books.find((b) => b.id === l.livroId);
    
    const isOverdue = l.status === 'Ativo' && new Date(l.dataDevolucao) < new Date();
    
    let statusLabel = 'Devolvido';
    if (l.status === 'Ativo') {
      statusLabel = isOverdue ? 'Atrasado ⚠️' : 'Em Aberto ⏳';
    }

    return [
      l.id,
      user ? `${user.nome} (${user.matricula})` : `ID Sem Nome: ${l.usuarioId}`,
      user ? user.funcao : 'N/A',
      book ? `${book.nomeLivro} (${book.id})` : `ID Sem Obra: ${l.livroId}`,
      new Date(l.dataEmprestimo + 'T00:00:00').toLocaleDateString('pt-BR'),
      new Date(l.dataDevolucao + 'T00:00:00').toLocaleDateString('pt-BR'),
      l.dataDevolucaoReal ? new Date(l.dataDevolucaoReal + 'T00:00:00').toLocaleDateString('pt-BR') : '-',
      statusLabel
    ];
  });

  autoTable(doc, {
    startY: 65,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['CÓD.', 'REQUISITANTE / MATRÍCULA', 'FUNÇÃO', 'TITULO DA OBRA (CÓD)', 'RETIRADA', 'PREV. DEV.', 'ENTREGA', 'ESTADO']],
    body: tableRows,
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 62 },
      2: { cellWidth: 22 },
      3: { cellWidth: 62 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' },
      7: { cellWidth: 31, fontStyle: 'bold', halign: 'center' }
    }
  });

  // Footer for landscape
  const footerCount = (doc as any).internal.getNumberOfPages();
  for (let idx = 1; idx <= footerCount; idx++) {
    doc.setPage(idx);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    
    doc.text(`Página ${idx} de ${footerCount}`, 283 - doc.getTextWidth(`Página ${idx} de ${footerCount}`), 200);
    doc.text('DarioBook SIB - Sistema Estadual de Bibliotecas de Ensino Integral', 14, 200);
  }

  doc.save('Relatorio_Emprestimos_DarioBook.pdf');
};

/**
 * 3. Export Relatório de Livros (Books and Catalog Report)
 */
export const exportRelatorioLivros = (
  books: Livro[],
  publishers: Editora[]
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const drawLandscapeHeader = (title: string) => {
    doc.setFillColor(16, 185, 129);
    doc.rect(14, 10, 269, 3, 'F');
    doc.setFillColor(250, 204, 21);
    doc.rect(14, 13, 269, 1, 'F');
    doc.setFillColor(22, 163, 74);
    doc.rect(14, 14, 269, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('GOVERNO DO ESTADO DO CEARÁ | SECRETARIA DA EDUCAÇÃO DO CEARÁ - SEDUC', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('SISTEMA INTEGRADO DE BIBLIOTECAS (SIB) | DARIOBOOK PORTAL ACERVO', 14, 26);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 29, 283, 29);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 118, 110);
    doc.text(title.toUpperCase(), 14, 37);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const dateStr = new Date().toLocaleString('pt-BR');
    doc.text(`Catálogo Geral do Inventário | Sincronizado: ${dateStr}`, 14, 41);
  };

  drawLandscapeHeader('Relatório Analítico do Acervo Bibliográfico');

  // Compute stats
  const totalTitles = books.length;
  const totalVolume = books.reduce((sum, b) => sum + b.estoqueTotal, 0);
  const rentedVolume = books.reduce((sum, b) => sum + b.alugados, 0);
  const availVolume = books.reduce((sum, b) => sum + b.disponiveis, 0);

  doc.setFillColor(248, 250, 252);
  doc.rect(14, 46, 269, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 46, 269, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('CONSOLIDADO DE ESTOQUE:', 18, 51);

  doc.setFont('helvetica', 'normal');
  doc.text(`Títulos Diversos no Acervo: `, 18, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${totalTitles}`, 58, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Exemplares Totais: `, 82, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text(`${totalVolume}`, 110, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Emprestados no Momento: `, 130, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(245, 158, 11);
  doc.text(`${rentedVolume}`, 168, 56);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Disponíveis nas Prateleiras: `, 190, 56);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text(`${availVolume}`, 228, 56);

  // Table rows map
  const tableRows = books.map((b) => {
    const pub = publishers.find((p) => p.id === b.editoraId);
    return [
      b.id,
      b.nomeLivro,
      b.autor,
      pub ? pub.nomeEditora : b.editoraId,
      b.anoPublicacao,
      b.isbn,
      b.categoria,
      b.estoqueTotal,
      b.alugados,
      b.disponiveis
    ];
  });

  autoTable(doc, {
    startY: 65,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['CÓDIGO', 'TÍTULO DA OBRA', 'AUTOR', 'EDITORA', 'ANO', 'ISBN', 'CATEGORIA', 'TOTAL', 'ALUG.', 'DISP.']],
    body: tableRows,
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 55 },
      2: { cellWidth: 42 },
      3: { cellWidth: 38 },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 36 },
      7: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 12, halign: 'center' },
      9: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }
    }
  });

  // Landscape footers
  const footerCount = (doc as any).internal.getNumberOfPages();
  for (let idx = 1; idx <= footerCount; idx++) {
    doc.setPage(idx);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    
    doc.text(`Página ${idx} de ${footerCount}`, 283 - doc.getTextWidth(`Página ${idx} de ${footerCount}`), 200);
    doc.text('DarioBook SIB - Inventário Patrimonial de Livros Escolares do Ceará', 14, 200);
  }

  doc.save('Relatorio_Inventario_Livros_DarioBook.pdf');
};

/**
 * 4. Export Relatório de Usuários (Users Directory)
 */
export const exportRelatorioUsuarios = (
  users: Usuario[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawHeader(doc, 'Diretório de Leitores Frequentes (Alunos e Servidores)');

  const tableRows = users.map((u) => {
    return [
      u.id,
      u.nome,
      u.matricula,
      u.funcao,
      u.curso,
      u.serie,
      u.email,
      u.telefone
    ];
  });

  autoTable(doc, {
    startY: 55,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['CÓD.', 'NOME DO BENFICIÁRIO', 'MATRÍCULA', 'FUNÇÃO', 'CURSO / EIXO', 'SÉRIE', 'E-MAIL', 'CONTATO']],
    body: tableRows,
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 14, fontStyle: 'bold' },
      1: { cellWidth: 44, fontStyle: 'bold' },
      2: { cellWidth: 23 },
      3: { cellWidth: 18 },
      4: { cellWidth: 24 },
      5: { cellWidth: 14, halign: 'center' },
      6: { cellWidth: 25 },
      7: { cellWidth: 20 }
    }
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  drawFooter(doc, pageCount);

  doc.save('Relatorio_Diretorio_Usuarios_DarioBook.pdf');
};

/**
 * 5. Export Relatório de Editoras (Publishers Directory)
 */
export const exportRelatorioEditoras = (
  publishers: Editora[],
  books: Livro[]
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  drawHeader(doc, 'Relatório de Editoras Paralelas e Acordo de Parceria');

  const tableRows = publishers.map((p) => {
    // Count associated active books
    const activeBooksCount = books.filter(b => b.editoraId === p.id).length;
    const copiesCount = books.filter(b => b.editoraId === p.id).reduce((sum, b) => sum + b.estoqueTotal, 0);

    return [
      p.id,
      p.nomeEditora,
      p.email,
      p.telefone,
      `${activeBooksCount} títulos do acervo`,
      `${copiesCount} exemplares`
    ];
  });

  autoTable(doc, {
    startY: 55,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['ID CÓD.', 'NOME DA EDITORA DO CEARÁ', 'E-MAIL CORPORATIVO', 'TELEFONE COMERCIAL', 'CATÁLOGO ESCOLAR', 'VOLUME TOTAL']],
    body: tableRows,
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 45 },
      3: { cellWidth: 32 },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 16 }
    }
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  drawFooter(doc, pageCount);

  doc.save('Relatorio_Editoras_DarioBook.pdf');
};

/**
 * 6. Export Relatório de Estoque e Logs de Movimentação (Stock Control History)
 */
export const exportRelatorioEstoque = (
  logs: LogEstoque[],
  books: Livro[]
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const drawLandscapeHeader = (title: string) => {
    doc.setFillColor(16, 185, 129);
    doc.rect(14, 10, 269, 3, 'F');
    doc.setFillColor(250, 204, 21);
    doc.rect(14, 13, 269, 1, 'F');
    doc.setFillColor(22, 163, 74);
    doc.rect(14, 14, 269, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    doc.text('GOVERNO DO ESTADO DO CEARÁ | SECRETARIA DA EDUCAÇÃO DO CEARÁ - SEDUC', 14, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('SISTEMA INTEGRADO DE BIBLIOTECAS (SIB) | DARIOBOOK PORTAL ESTOQUE', 14, 26);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 29, 283, 29);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 118, 110);
    doc.text(title.toUpperCase(), 14, 37);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const dateStr = new Date().toLocaleString('pt-BR');
    doc.text(`Controle Analítico de Transações | Data da Sincronização: ${dateStr}`, 14, 41);
  };

  drawLandscapeHeader('Livro de Registro de Movimentações (Logs de Estoque)');

  const tableRows = logs.map((log) => {
    const book = books.find((b) => b.id === log.livroId);
    return [
      log.id,
      book ? `${book.nomeLivro} (${book.id})` : log.livroId,
      log.editoraId,
      log.tipo === 'Entrada' ? `+ ${log.quantidade} exemplares` : `- ${log.quantidade} exemplares`,
      log.tipo,
      log.motivo,
      new Date(log.data).toLocaleString('pt-BR')
    ];
  });

  autoTable(doc, {
    startY: 48,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    head: [['CÓD. REG.', 'TÍTULO DO LIVRO (CÓD)', 'EDITORA', 'VALOR QUANT.', 'TIPO', 'MOTIVO DA OPERAÇÃO / JUSTIFICATIVA', 'ESTREIA NO SISTEMA']],
    body: tableRows,
    headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 65 },
      2: { cellWidth: 22 },
      3: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      4: { cellWidth: 18, fontStyle: 'bold', halign: 'center' },
      5: { cellWidth: 80 },
      6: { cellWidth: 38, halign: 'center' }
    }
  });

  const footerCount = (doc as any).internal.getNumberOfPages();
  for (let idx = 1; idx <= footerCount; idx++) {
    doc.setPage(idx);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    
    doc.text(`Página ${idx} de ${footerCount}`, 283 - doc.getTextWidth(`Página ${idx} de ${footerCount}`), 200);
    doc.text('DarioBook SIB - Livro de Tombo e Auditoria de Estoques de Material Didático', 14, 200);
  }

  doc.save('Relatorio_Log_Estoque_DarioBook.pdf');
};
