const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

// Header
app = app.replace(/bg-white\/80 dark:bg-slate-800\/80 backdrop-blur-md/g, 'glass-panel');

// Setup Container
app = app.replace(/bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-700/g, 'glass-card p-6 md:p-8 rounded-3xl');

// Inputs/Selects
app = app.replace(/bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/g, 'bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 backdrop-blur-sm');

// Display Container
app = app.replace(/bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8/g, 'glass-card rounded-[2rem] p-8');
app = app.replace(/bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8/g, 'glass-panel border-dashed rounded-[2rem] p-8');

// Action buttons
app = app.replace(/bg-slate-50 dark:bg-slate-500\/10 border border-slate-200 dark:border-slate-500\/30/g, 'glass-button');
app = app.replace(/bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600/g, 'glass-button');

// Empty cards
app = app.replace(/bg-white dark:bg-slate-800 p-5/g, 'glass-card p-5');

// Typography
app = app.replace(/font-bold/g, 'font-semibold');
app = app.replace(/font-black/g, 'font-bold');

fs.writeFileSync('src/App.tsx', app);
