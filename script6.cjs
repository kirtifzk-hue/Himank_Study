const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-none text-base font-semibold shadow-sm shadow-indigo-600\/30 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 transition-all whitespace-nowrap/g, 'editorial-button whitespace-nowrap');

app = app.replace(/text-xl md:text-3xl font-bold text-slate-900/g, 'text-xl md:text-3xl font-bold font-serif text-slate-900');

fs.writeFileSync('src/App.tsx', app);
