// ============================================================
//  UX Research · Self-Checkout — Google Apps Script Backend
//
//  ATENÇÃO: ao editar, vá em
//  Implantar → Gerenciar implantações → editar → Nova versão → Implantar.
// ============================================================

const SHEET_NAME = 'Sessões';

const COLUMNS = [
  'session_id','data','horario','loja','segmento','pesquisador',
  'obs-age','obs-itens','obs-comp','obs-nota',
  'freq','exp-geral','motivo',
  'teve-prob','etapa','verbatim','resolucao',
  'clareza','reacao-erro','audio','audio-ajudou','momento-perdido',
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

    // Garante que todas as colunas do COLUMNS existem no cabeçalho
    ensureColumns(sheet);

    // Re-lê cabeçalho (pode ter sido atualizado por ensureColumns)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);

    items.forEach(session => {
      const id = String(session.session_id || '');
      if (!id) return;
      if (existing.has(id)) { dupes.push(id); return; }

      // Monta linha na ordem real do cabeçalho (aceita colunas extras)
      const row = headers.map(col =>
        col === 'synced_at' ? now : (session[col] !== undefined ? String(session[col]) : '')
      );
      toInsert.push(row);
      existing.add(id);
    });

    if (toInsert.length > 0) {
      sheet
        .getRange(sheet.getLastRow() + 1, 1, toInsert.length, headers.length)
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

    const widths = {1:110, 5:100, 6:100, 9:240, 10:300, 16:400, 21:300, 23:400, 25:400};
    Object.entries(widths).forEach(([col, w]) => sheet.setColumnWidth(Number(col), w));
  }

  return sheet;
}

// Adiciona colunas ausentes ao cabeçalho (não remove as existentes)
function ensureColumns(sheet) {
  const lastCol     = sheet.getLastColumn();
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  const existing    = headerRange.getValues()[0].map(String);
  const missing     = COLUMNS.filter(c => !existing.includes(c));

  if (missing.length === 0) return;

  const startCol = lastCol + 1;
  const newHeaders = sheet.getRange(1, startCol, 1, missing.length);
  newHeaders.setValues([missing]);
  newHeaders.setBackground('#00445B');
  newHeaders.setFontColor('#AFF6FF');
  newHeaders.setFontWeight('bold');
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
