const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/dark:text-slate-500/g, 'dark:text-slate-200');
app = app.replace(/dark:text-slate-400/g, 'dark:text-slate-300');

// let's also remove bg-white dark:bg-slate-800 from App.tsx completely and use glass components.
app = app.replace(/bg-white dark:bg-slate-800/g, 'glass-card');
app = app.replace(/bg-slate-50 border border-slate-200 dark:bg-slate-900\/50 border border-slate-200 dark:border-slate-700/g, 'glass-panel');
app = app.replace(/bg-slate-50\/30 dark:bg-slate-800\/30 border border-slate-200 dark:border-slate-700/g, 'glass-panel');
app = app.replace(/bg-white\/90 backdrop-blur-sm border border-slate-200/g, 'glass-card');

fs.writeFileSync('src/App.tsx', app);
