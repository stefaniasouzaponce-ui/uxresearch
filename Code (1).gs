// ============================================================
//  UX Research · Self-Checkout — Google Apps Script Backend
//
//  INSTALAÇÃO:
//  1. Abra script.google.com → novo projeto
//  2. Cole este código, salve (Ctrl+S)
//  3. Implantar → Nova implantação → App da Web
//     · Executar como: Eu mesmo
//     · Quem pode acessar: Qualquer pessoa
//  4. Copie a URL gerada e cole no app (Dashboard → ⚙ Reconfigurar)
//
//  ATENÇÃO: ao editar e querer publicar mudanças, vá em
//  Implantar → Gerenciar implantações → editar → Nova versão → Implantar.
// ============================================================

const SHEET_NAME = 'Sessões';

const COLUMNS = [
  'session_id','data','horario','loja','pesquisador',
  'obs-age','obs-itens','obs-comp','obs-nota',
  'freq','exp-geral','motivo',
  'teve-prob','etapa','verbatim','resolucao',
  'clareza','reacao-erro','momento-perdido',
  'uma-mudanca','reuso','notas-pesq',
  'synced_at'
];

// ── GET ────────────────────────────────────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'get';

  if (action === 'ping') {
    return respond({ ok: true, message: 'API funcionando' });
  }

  try {
    const sheet = getOrCreateSheet();
    const rows  = sheet.getDataRange().getValues();

    if (rows.length <= 1) return respond({ ok: true, sessions: [] });

    const headers  = rows[0].map(String);
    const sessions = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = (row[i] !== null && row[i] !== undefined) ? String(row[i]) : '';
      });
      return obj;
    });

    return respond({ ok: true, sessions });

  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── POST ───────────────────────────────────────────────────
// Body chega como texto puro (sem Content-Type: application/json)
// para evitar preflight CORS que o Apps Script não suporta.
function doPost(e) {
  try {
    const raw     = e.postData ? e.postData.contents : '[]';
    const payload = JSON.parse(raw);
    const items   = Array.isArray(payload) ? payload : [payload];

    const sheet    = getOrCreateSheet();
    const existing = getExistingIds(sheet);
    const now      = new Date().toISOString();
    const toInsert = [];
    const dupes    = [];

    items.forEach(session => {
      const id = String(session.session_id || '');
      if (!id) return;
      if (existing.has(id)) { dupes.push(id); return; }
      const row = COLUMNS.map(col =>
        col === 'synced_at' ? now : (session[col] !== undefined ? String(session[col]) : '')
      );
      toInsert.push(row);
      existing.add(id);
    });

    if (toInsert.length > 0) {
      sheet
        .getRange(sheet.getLastRow() + 1, 1, toInsert.length, COLUMNS.length)
        .setValues(toInsert);
    }

    return respond({
      ok: true,
      saved: toInsert.length,
      duplicates: dupes.length,
      duplicate_ids: dupes
    });

  } catch (err) {
    return respond({ ok: false, error: err.message });
  }
}

// ── Helpers ────────────────────────────────────────────────
function getOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);

    const hdr = sheet.getRange(1, 1, 1, COLUMNS.length);
    hdr.setBackground('#00445B');
    hdr.setFontColor('#AFF6FF');
    hdr.setFontWeight('bold');
    sheet.setFrozenRows(1);

    const widths = {1:110, 5:100, 8:240, 9:300, 15:400, 20:400, 22:400};
    Object.entries(widths).forEach(([col, w]) => sheet.setColumnWidth(Number(col), w));
  }

  return sheet;
}

function getExistingIds(sheet) {
  const last = sheet.getLastRow();
  if (last <= 1) return new Set();
  return new Set(
    sheet.getRange(2, 1, last - 1, 1).getValues().flat().map(String)
  );
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
