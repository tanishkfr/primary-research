import ExcelJS from 'exceljs';
import { fields } from './_shared.mjs';

const colors = {
  ink: '10221D',
  muted: '64736D',
  paper: 'F5F7F2',
  white: 'FFFFFF',
  line: 'DBE3DC',
  accent: 'FF704D',
  sage: 'DCEADE',
  blue: 'C1E2F0',
};

const questionMap = [
  [1, 'The Persona', 'Which age range describes you best?', 'Age range'],
  [2, 'The Persona', 'What are you studying, and what major or field are you in?', 'Major or field'],
  [3, 'The Persona', 'How do you use digital media for learning? Which apps or software do you use, and what do you use each one for?', 'Digital media for learning'],
  [4, 'Your Toolkit', 'Which learning tools do you use most often? For each one, what do you value about it and what would you change?', 'Most-used learning tools'],
  [5, 'Your Toolkit', 'Describe any self-learning apps or resources you use, such as Coursera. What part of your learning do they support, and how useful are they in practice?', 'Self-learning apps and resources'],
  [6, 'Your Toolkit', 'How do you find your way through the resources given in class and the independent sources you discover? Describe how you keep track of them.', 'Resource organisation'],
  [7, 'Memory & Momentum', 'How would you describe your ability to retain information from digital tools and from classes over a semester?', 'Information retention'],
  [8, 'Memory & Momentum', 'Which tool feels so essential to your learning that you struggle to remember or learn without it? What does it make possible?', 'Essential learning tool'],
  [9, 'Memory & Momentum', 'How would you describe your typical learning style? Which formats challenge you most?', 'Learning style'],
  [10, 'Memory & Momentum', 'How does switching between different online tools and platforms affect your ability to begin a study task or stay focused?', 'Platform switching and focus'],
  [11, 'Struggle vs. Instant Answers', 'When you meet a difficult concept, walk us through what you usually do first, next, and last. Include the role of instructors or AI tools.', 'Difficult concepts'],
  [12, 'Struggle vs. Instant Answers', 'Describe a time an AI summary or video explanation made a concept feel clear, but you later struggled to reproduce the solution independently. What did you learn from that experience?', 'AI explanations and independent reproduction'],
  [13, 'Knowing What You Don’t Know', 'How do you identify knowledge gaps when preparing for an exam?', 'Identifying knowledge gaps'],
  [14, 'Knowing What You Don’t Know', 'How do you track what you have mastered versus what needs review? Describe a system you use, or the system you wish you had.', 'Tracking mastery and review'],
  [15, 'Knowing What You Don’t Know', 'What role do notifications or habit-building tools play in your learning routine? Describe what helps you stay consistent and when reminders become annoying.', 'Notifications and consistency'],
];

function styleMergedBand(sheet, rowNumber, columnCount, value, fill, font) {
  for (let column = 1; column <= columnCount; column += 1) {
    const cell = sheet.getCell(rowNumber, column);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fill } };
    cell.font = font;
    cell.alignment = { vertical: 'middle', wrapText: true };
  }
  sheet.mergeCells(rowNumber, 1, rowNumber, columnCount);
  sheet.getCell(rowNumber, 1).value = value;
}

function styleHeader(row, columnCount) {
  row.height = 34;
  for (let column = 1; column <= columnCount; column += 1) {
    const cell = row.getCell(column);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.accent } };
    cell.font = { name: 'Aptos', size: 9, bold: true, color: { argb: colors.white } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: colors.ink } } };
  }
}

function styleDataRow(row, columnCount, index) {
  row.height = 88;
  row.font = { name: 'Aptos', size: 10, color: { argb: colors.ink } };
  row.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
  for (let column = 1; column <= columnCount; column += 1) {
    const cell = row.getCell(column);
    if (index % 2 === 0) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.blue } };
    cell.border = { bottom: { style: 'thin', color: { argb: colors.line } } };
  }
}

function formatSheetBase(sheet) {
  sheet.properties.showGridLines = false;
  sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
  sheet.pageSetup.paperSize = 9;
}

export async function buildResponseWorkbook(records) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'How We Learn Now';
  workbook.subject = 'Anonymous college student learning questionnaire responses';
  workbook.title = 'How We Learn Now — Response Log';
  workbook.created = new Date();

  const responseSheet = workbook.addWorksheet('Response Log', {
    views: [{ state: 'frozen', xSplit: 2, ySplit: 4, topLeftCell: 'C5' }],
  });
  formatSheetBase(responseSheet);

  const responseHeaders = ['Response ID', 'Submitted (UTC)', ...fields.map(([, label]) => label)];
  const responseColumnWidths = [38, 22, 17, 28, 43, 42, 42, 38, 36, 36, 34, 40, 38, 44, 38, 38, 38];
  responseSheet.columns = responseHeaders.map((header, index) => ({ header, key: `column${index + 1}`, width: responseColumnWidths[index] || 36 }));
  const responseColumnCount = responseHeaders.length;

  styleMergedBand(responseSheet, 1, responseColumnCount, 'HOW WE LEARN NOW — ANONYMOUS RESPONSE LOG', colors.ink, { name: 'Aptos Display', size: 14, bold: true, color: { argb: colors.white } });
  responseSheet.getRow(1).height = 30;
  styleMergedBand(responseSheet, 2, responseColumnCount, 'Live submissions from the web questionnaire. No names, emails, IP addresses, or user agents are collected.', colors.sage, { name: 'Aptos', size: 9, italic: true, color: { argb: colors.muted } });
  responseSheet.getRow(2).height = 24;
  responseSheet.getRow(4).values = responseHeaders;
  styleHeader(responseSheet.getRow(4), responseColumnCount);

  records.forEach((record, index) => {
    const submittedAt = new Date(record.submittedAt);
    const row = responseSheet.addRow([
      record.responseId || '',
      Number.isNaN(submittedAt.getTime()) ? (record.submittedAt || '') : submittedAt,
      ...fields.map(([key]) => record.answers?.[key] || ''),
    ]);
    styleDataRow(row, responseColumnCount, index);
    row.getCell(2).numFmt = 'yyyy-mm-dd hh:mm';
  });

  const lastResponseRow = Math.max(4, responseSheet.rowCount);
  responseSheet.autoFilter = { from: 'A4', to: `Q${lastResponseRow}` };

  const mapSheet = workbook.addWorksheet('Question Map', {
    views: [{ state: 'frozen', ySplit: 4, topLeftCell: 'A5' }],
  });
  formatSheetBase(mapSheet);
  mapSheet.columns = [
    { header: 'Form #', key: 'number', width: 12 },
    { header: 'Section', key: 'section', width: 30 },
    { header: 'Open-ended form prompt', key: 'prompt', width: 90 },
    { header: 'Response-log column', key: 'column', width: 42 },
  ];
  styleMergedBand(mapSheet, 1, 4, 'QUESTION MAP — SOURCE TO FORM', colors.ink, { name: 'Aptos Display', size: 14, bold: true, color: { argb: colors.white } });
  mapSheet.getRow(1).height = 30;
  styleMergedBand(mapSheet, 2, 4, 'The source image skips from question 14 to 16. The final prompt is labelled 15 here for a continuous sequence.', colors.sage, { name: 'Aptos', size: 9, italic: true, color: { argb: colors.muted } });
  mapSheet.getRow(2).height = 24;
  mapSheet.getRow(4).values = ['Form #', 'Section', 'Open-ended form prompt', 'Response-log column'];
  styleHeader(mapSheet.getRow(4), 4);

  questionMap.forEach((item, index) => {
    const row = mapSheet.addRow(item);
    row.height = 58;
    row.font = { name: 'Aptos', size: 10, color: { argb: colors.ink } };
    row.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
    row.getCell(1).alignment = { vertical: 'top', horizontal: 'center' };
    if (index % 2 === 0) {
      for (let column = 1; column <= 4; column += 1) {
        row.getCell(column).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colors.blue } };
      }
    }
    for (let column = 1; column <= 4; column += 1) {
      row.getCell(column).border = { bottom: { style: 'thin', color: { argb: colors.line } } };
    }
  });
  mapSheet.autoFilter = { from: 'A4', to: 'D19' };

  return workbook;
}
