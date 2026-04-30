const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/bg-white dark:bg-slate-800/g, 'glass-card');
app = app.replace(/bg-slate-50 dark:bg-slate-900/g, 'glass-panel');
app = app.replace(/bg-slate-50 dark:bg-slate-600\/10 border border-slate-200 dark:border-slate-500\/30/g, 'glass-button');
app = app.replace(/bg-slate-100 dark:bg-slate-500\/20/g, 'bg-white/50 dark:bg-white/10');
app = app.replace(/bg-slate-50 border border-slate-[0-9]+ dark:bg-slate-[0-9]+\/50 border border-slate-[0-9]+ dark:border-slate-[0-9]+/g, 'glass-card');
app = app.replace(/bg-white\/90 backdrop-blur-sm border border-slate-200/g, 'glass-card');
app = app.replace(/bg-slate-50 border border-slate-200 dark:bg-slate-900\/50/g, 'glass-panel');
app = app.replace(/bg-slate-800 dark:bg-slate-500 text-white/g, 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white');

fs.writeFileSync('src/App.tsx', app);
