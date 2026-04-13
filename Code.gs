// ============================================================
//  UX Research · Self-Checkout — Google Apps Script Backend
//  Cole este código em: script.google.com → novo projeto
//  Depois: Implantar → Nova implantação → App da Web
//  Executar como: Eu mesmo | Quem pode acessar: Qualquer pessoa
// ============================================================

const SHEET_NAME = 'Sessões';

// Colunas fixas — ordem importa para o CSV e o dashboard
const COLUMNS = [
  'session_id','data','horario','loja','pesquisador',
  'obs-age','obs-itens','obs-comp','obs-nota',
  'freq','exp-geral','motivo',
  'teve-prob','etapa','verbatim','resolucao',
  'clareza','reacao-erro','momento-perdido',
  'uma-mudanca','reuso','notas-pesq',
  'synced_at'
];

// ------------------------------------------------------------
//  GET — busca todas as sessões (para o dashboard carregar)
// ------------------------------------------------------------
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;

  if (action === 'ping') {
    return jsonResponse({ ok: true, message: 'API funcionando ✓' });
  }

  try {
    const sheet = getOrCreateSheet();
    const rows  = sheet.getDataRange().getValues();

    if (rows.length <= 1) {
      return jsonResponse({ ok: true, sessions: [] });
    }

    const headers = rows[0];
    const sessions = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? String(row[i]) : ''; });
      return obj;
    });

    return jsonResponse({ ok: true, sessions });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

// ------------------------------------------------------------
//  POST — recebe uma nova sessão e grava na planilha
// ------------------------------------------------------------
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);

    // Suporte a envio em lote (array) ou individual (objeto)
    const items = Array.isArray(payload) ? payload : [payload];

    const sheet     = getOrCreateSheet();
    const now       = new Date().toISOString();
    const newRows   = [];
    const duplicate = [];

    // Checa duplicatas pelo session_id
    const existing = getExistingIds(sheet);

    items.forEach(session => {
      if (existing.has(session.session_id)) {
        duplicate.push(session.session_id);
        return;
      }
      const row = COLUMNS.map(col => {
        if (col === 'synced_at') return now;
        return session[col] !== undefined ? session[col] : '';
      });
      newRows.push(row);
      existing.add(session.session_id);
    });

    if (newRows.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, newRows.length, COLUMNS.length).setValues(newRows);
    }

    return jsonResponse({
      ok: true,
      saved: newRows.length,
      duplicates: duplicate.length,
      duplicate_ids: duplicate
    });

  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

// ------------------------------------------------------------
//  Helpers
// ------------------------------------------------------------
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let sheet   = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Cria cabeçalho
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);

    // Formata cabeçalho
    const headerRange = sheet.getRange(1, 1, 1, COLUMNS.length);
    headerRange.setBackground('#00445B');
    headerRange.setFontColor('#AFF6FF');
    headerRange.setFontWeight('bold');
    headerRange.setFontFamily('DM Mono');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 100);  // session_id
    sheet.setColumnWidth(5, 120);  // pesquisador
    sheet.setColumnWidth(8, 250);  // obs-comp
    sheet.setColumnWidth(9, 300);  // obs-nota
    sheet.setColumnWidth(15, 400); // verbatim
    sheet.setColumnWidth(20, 400); // uma-mudanca
    sheet.setColumnWidth(22, 400); // notas-pesq
  }

  return sheet;
}

function getExistingIds(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return new Set();
  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
  return new Set(ids.map(String));
}

function jsonResponse(data, code) {
  const output = ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
