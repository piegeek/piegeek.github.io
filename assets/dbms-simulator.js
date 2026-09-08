// Interactive Simple DBMS simulator — extracted from the old React bundle into plain, debuggable JS.
// Markup lives in the #tpl-dbms-simulator <template> in index.html; call initDbmsSimulator() after cloning it.
const DB = {};
let deleteStep = 0;

const EXAMPLES = [
  "CREATE TABLE users (id INT NOT NULL, name CHAR(50), PRIMARY KEY (id));",
  "INSERT INTO users VALUES (1, 'Alice', null);",
  "INSERT INTO users VALUES (2, 'Bob', null);",
  "SELECT * FROM users;",
  "SELECT * FROM users WHERE id = 1;",
  "DELETE FROM users WHERE id = 1;",
  "SELECT * FROM users;",
  "DROP TABLE users;",
];

const DELETE_STEPS = [
  {
    label:"Initial state — two records in store",
    dot:"step-dot-blue",
    rows:[
      {k:"schema",v:"id|INT|true,name|CHAR(50)|false"},
      {k:"1",v:"1|Alice"},
      {k:"2",v:"2|Bob"},
      {k:"deleted",v:""},
    ]
  },
  {
    label:"DELETE FROM users WHERE id = 1 — parser populates buffers",
    dot:"step-dot-amber",
    rows:[
      {k:"schema",v:"id|INT|true,name|CHAR(50)|false"},
      {k:"1",v:"1|Alice"},
      {k:"2",v:"2|Bob"},
      {k:"deleted",v:""},
    ],
    highlight:"Parser fills tableNameBuffer='users', booleanValueExpressionBuffer=['false','c','id','=','1']"
  },
  {
    label:"Handler reads WHERE condition — id = 1 matches",
    dot:"step-dot-amber",
    rows:[
      {k:"schema",v:"id|INT|true,name|CHAR(50)|false"},
      {k:"1",v:"1|Alice",active:true},
      {k:"2",v:"2|Bob"},
      {k:"deleted",v:""},
    ],
    highlight:"selection() evaluates predicate: row 1 passes"
  },
  {
    label:"Sentinel written — value overwritten with ^@",
    dot:"step-dot-red",
    rows:[
      {k:"schema",v:"id|INT|true,name|CHAR(50)|false"},
      {k:"1",v:"^@",sentinel:true},
      {k:"2",v:"2|Bob"},
      {k:"deleted",v:"1"},
    ],
    highlight:"updateKeyValue(txn, 'users', '1', '^@') — physical key retained"
  },
  {
    label:"Buffers flushed — ready for next query",
    dot:"step-dot-gray",
    rows:[
      {k:"schema",v:"id|INT|true,name|CHAR(50)|false"},
      {k:"1",v:"^@",sentinel:true,deleted:true},
      {k:"2",v:"2|Bob"},
      {k:"deleted",v:"1"},
    ],
    highlight:"All global buffers reset. SELECT now skips key '1' by checking the 'deleted' list."
  },
];

function renderDeleteDB(stepIdx) {
  const s = DELETE_STEPS[stepIdx];
  const box = document.getElementById('delete-db');
  let html = '';
  for (const r of s.rows) {
    const kCls = 'kv-cell kv-cell-key';
    let vCls = 'kv-cell kv-cell-val';
    if (r.sentinel) vCls = 'kv-cell kv-cell-sentinel';
    if (r.deleted) vCls = 'kv-cell kv-cell-deleted';
    const active = r.active ? 'style="background:var(--color-background-warning)"' : '';
    html += `<div class="kv-row" ${active}><div class="${kCls}">${r.k}</div><div class="${vCls}">${r.v || '(empty)'}</div></div>`;
  }
  box.innerHTML = html;
}

function buildDeleteSteps() {
  const c = document.getElementById('delete-steps');
  DELETE_STEPS.forEach((s, i) => {
    const d = document.createElement('div');
    d.className = 'step';
    d.style.cursor = 'pointer';
    d.style.padding = '8px';
    d.style.borderRadius = 'var(--border-radius-md)';
    d.style.transition = 'background .15s';
    d.id = 'dstep-'+i;
    d.innerHTML = `<div class="step-dot ${s.dot}" style="margin-top:4px;flex-shrink:0"></div><div><div style="font-size:12px;font-weight:500;color:var(--color-text-primary)">${s.label}</div>${s.highlight?`<div style="font-size:11px;font-family:var(--font-mono);color:var(--color-text-tertiary);margin-top:3px">${s.highlight}</div>`:''}</div>`;
    d.onclick = () => { selectDeleteStep(i); };
    c.appendChild(d);
  });
  selectDeleteStep(0);
}

function selectDeleteStep(i) {
  DELETE_STEPS.forEach((_,j) => {
    const el = document.getElementById('dstep-'+j);
    if (el) el.style.background = j===i ? 'var(--color-background-secondary)' : '';
  });
  renderDeleteDB(i);
}

function switchTab(name) {
  ['sim','arch','delete'].forEach(n => {
    document.getElementById('pane-'+n).style.display = n===name?'':'none';
    document.getElementById('tab-'+n).classList.toggle('on', n===name);
  });
}

function buildExamples() {
  const row = document.getElementById('examples-row');
  EXAMPLES.forEach(e => {
    const b = document.createElement('button');
    b.className = 'ex-btn';
    b.textContent = e.length>45?e.slice(0,45)+'…':e;
    b.onclick = () => { document.getElementById('sql-in').value=e; runSim(); };
    row.appendChild(b);
  });
}

function renderDB() {
  const box = document.getElementById('db-box');
  if (Object.keys(DB).length === 0) {
    box.innerHTML = '<div style="padding:8px 10px;font-size:12px;color:var(--color-text-tertiary);font-style:italic">Empty</div>';
    return;
  }
  let html = '';
  for (const [k, v] of Object.entries(DB)) {
    const isDeleted = v === '^@';
    const kCls = 'kv-cell kv-cell-key' + (isDeleted?' kv-cell-deleted':'');
    const vCls = 'kv-cell' + (isDeleted?' kv-cell-sentinel':' kv-cell-val');
    html += `<div class="kv-row"><div class="${kCls}">${k}</div><div class="${vCls}">${v||'(empty)'}</div></div>`;
  }
  box.innerHTML = html;
}

function addStep(icon, color, text, mono) {
  return `<div class="step"><div class="step-dot ${color}"></div><div><span style="font-size:13px;color:var(--color-text-primary)">${text}</span>${mono?`<div style="font-size:11px;font-family:var(--font-mono);color:var(--color-text-tertiary);margin-top:2px">${mono}</div>`:''}</div></div>`;
}

function runSim() {
  const raw = document.getElementById('sql-in').value.trim().replace(/;?\s*$/,'');
  if (!raw) return;
  const sql = raw.toUpperCase();
  let pipe = '';
  let result = '';

  if (/^CREATE\s+TABLE\s+(\w+)\s*\(/.test(raw)) {
    const name = raw.match(/CREATE\s+TABLE\s+(\w+)/i)[1].toLowerCase();
    pipe += addStep('','step-dot-blue','Parser tokenizes CREATE TABLE','tableNameBuffer = "'+name+'"');
    pipe += addStep('','step-dot-blue','Schema parsed into tableSchemaBuffer','columnDefs + constraints buffered');
    pipe += addStep('','step-dot-teal','handleCreateTable() reads buffers','Opens new Berkeley DB database');
    pipe += addStep('','step-dot-teal','Schema stored as key-value','storeKeyValue(txn, "'+name+'", "schema", ...)');
    pipe += addStep('','step-dot-gray','Buffers flushed','Ready for next statement');
    DB[name+'::schema'] = 'id|INT|NOT NULL, ...';
    DB[name+'::deleted'] = '';
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-success);background:var(--color-background-success);border-radius:var(--border-radius-md);padding:8px 12px">'CREATE TABLE' requested</div>`;
  } else if (/^INSERT\s+INTO\s+(\w+)/i.test(raw)) {
    const name = raw.match(/INSERT\s+INTO\s+(\w+)/i)[1].toLowerCase();
    const vals = (raw.match(/VALUES\s*\(([^)]+)\)/i)||['','?'])[1];
    const key = vals.split(',')[0].trim().replace(/'/g,'');
    pipe += addStep('','step-dot-blue','Parser tokenizes INSERT INTO','tableNameBuffer = "'+name+'"');
    pipe += addStep('','step-dot-blue','Values parsed into insertQueryBuffer','"val": ['+vals+']');
    pipe += addStep('','step-dot-teal','handleInsert() drives disk write','Schema validated, types checked');
    pipe += addStep('','step-dot-teal','Record stored','storeKeyValue(txn, "'+name+'", "'+key+'", "'+vals+'")');
    pipe += addStep('','step-dot-gray','Buffers flushed','');
    DB[name+'::'+key] = vals;
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-success);background:var(--color-background-success);border-radius:var(--border-radius-md);padding:8px 12px">'INSERT' requested</div>`;
  } else if (/^SELECT/i.test(raw)) {
    const from = (raw.match(/FROM\s+(\w+)/i)||['','?'])[1].toLowerCase();
    const hasWhere = /WHERE/i.test(raw);
    const isStar = /SELECT\s+\*/i.test(raw);
    pipe += addStep('','step-dot-blue','Parser tokenizes SELECT','selectQueryBuffer populated');
    if (!isStar) pipe += addStep('','step-dot-blue','Column list parsed','columnNameWithTableNameList buffered');
    if (hasWhere) pipe += addStep('','step-dot-blue','WHERE parsed','booleanValueExpressionBuffer = predicate tokens');
    pipe += addStep('','step-dot-teal','handleSelect() reads buffers','');
    pipe += addStep('','step-dot-amber','cartesianProduct() on table list','Full cross-product of matching rows');
    if (hasWhere) pipe += addStep('','step-dot-amber','selection() filters rows','Evaluates boolean predicate per row');
    if (!isStar) pipe += addStep('','step-dot-amber','projection() drops columns','Only requested columns retained');
    pipe += addStep('','step-dot-teal','rename() applies aliases','aliasMapBuffer used');
    pipe += addStep('','step-dot-gray','Result printed, buffers flushed','');
    const keys = Object.entries(DB).filter(([k]) => k.startsWith(from+'::') && !k.includes('schema') && !k.includes('deleted'));
    const live = keys.filter(([_,v]) => v !== '^@');
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-info);background:var(--color-background-info);border-radius:var(--border-radius-md);padding:8px 12px">'SELECT' requested — ${live.length} row(s) found (${keys.length - live.length} soft-deleted)</div>`;
  } else if (/^DELETE\s+FROM\s+(\w+)/i.test(raw)) {
    const name = raw.match(/DELETE\s+FROM\s+(\w+)/i)[1].toLowerCase();
    const hasWhere = /WHERE/i.test(raw);
    pipe += addStep('','step-dot-blue','Parser tokenizes DELETE FROM','tableNameBuffer = "'+name+'"');
    if (hasWhere) pipe += addStep('','step-dot-blue','WHERE parsed','booleanValueExpressionBuffer filled');
    pipe += addStep('','step-dot-teal','handleDelete() reads buffers','');
    pipe += addStep('','step-dot-amber','selection() finds matching rows','Rows passing WHERE predicate collected');
    pipe += addStep('','step-dot-red','Soft-delete: value overwritten','updateKeyValue(txn, key, "^@")');
    pipe += addStep('','step-dot-red','"deleted" key updated','Deleted PK appended to deleted list');
    pipe += addStep('','step-dot-gray','Buffers flushed','');
    const keys = Object.entries(DB).filter(([k,v]) => k.startsWith(name+'::') && !k.includes('schema') && !k.includes('deleted') && v !== '^@');
    const delKey = hasWhere ? (keys[0]?.[0] || null) : null;
    if (delKey) { DB[delKey] = '^@'; }
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-danger);background:var(--color-background-danger);border-radius:var(--border-radius-md);padding:8px 12px">'DELETE' requested — record soft-deleted (sentinel ^@ written)</div>`;
  } else if (/^DROP\s+TABLE\s+(\w+)/i.test(raw)) {
    const name = raw.match(/DROP\s+TABLE\s+(\w+)/i)[1].toLowerCase();
    pipe += addStep('','step-dot-blue','Parser tokenizes DROP TABLE','tableNameBuffer = "'+name+'"');
    pipe += addStep('','step-dot-teal','handleDropTable() reads buffer','');
    pipe += addStep('','step-dot-red','Database removed from environment','myDbEnvironment.removeDatabase(txn, "'+name+'")');
    pipe += addStep('','step-dot-red','startupDB updated','Table name removed from databaseNames key');
    pipe += addStep('','step-dot-gray','Buffers flushed','');
    for (const k of Object.keys(DB)) { if (k.startsWith(name+'::')) delete DB[k]; }
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-danger);background:var(--color-background-danger);border-radius:var(--border-radius-md);padding:8px 12px">'DROP TABLE' requested</div>`;
  } else if (/^SHOW\s+TABLES/i.test(raw)) {
    pipe += addStep('','step-dot-blue','Parser tokenizes SHOW TABLES','');
    pipe += addStep('','step-dot-teal','handleShowTables() called','Reads databaseNames from startupDB');
    pipe += addStep('','step-dot-gray','Table list printed','');
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-success);background:var(--color-background-success);border-radius:var(--border-radius-md);padding:8px 12px">'SHOW TABLES' requested</div>`;
  } else if (/^DESC\s+\w+/i.test(raw)) {
    pipe += addStep('','step-dot-blue','Parser tokenizes DESC','tableNameBuffer set');
    pipe += addStep('','step-dot-teal','handleDesc() reads schema key','findKeyValue(tableName, "schema")');
    pipe += addStep('','step-dot-gray','Schema printed, buffers flushed','');
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-success);background:var(--color-background-success);border-radius:var(--border-radius-md);padding:8px 12px">'DESC' requested</div>`;
  } else {
    pipe = `<p style="font-size:13px;color:var(--color-text-danger)">Syntax error — could not parse statement</p>`;
    result = `<div style="font-size:13px;font-weight:500;color:var(--color-text-danger);background:var(--color-background-danger);border-radius:var(--border-radius-md);padding:8px 12px">Syntax error</div>`;
  }

  document.getElementById('pipeline-box').innerHTML = pipe;
  document.getElementById('result-box').innerHTML = result;
  renderDB();
}


function initDbmsSimulator() {
  buildExamples();
  buildDeleteSteps();
}
