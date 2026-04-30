const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/glass-card p-5 md:p-8 rounded-2xl md:rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm shadow-slate-200\/50 dark:shadow-none/g, 'glass-card p-5 md:p-8 rounded-3xl');
app = app.replace(/glass-card rounded-\[2rem\] p-8 md:p-12 h-full min-h-\[500px\] flex flex-col items-center justify-center text-slate-800 dark:text-slate-500 gap-6 shadow-sm shadow-slate-200\/50 dark:shadow-none/g, 'glass-card rounded-[2rem] p-8 md:p-12 h-full min-h-[500px] flex flex-col items-center justify-center text-slate-800 dark:text-slate-200 gap-6');
app = app.replace(/glass-card p-6 md:p-8 rounded-3xl flex flex-col gap-5 h-auto shadow-sm shadow-slate-200\/50 dark:shadow-none/g, 'glass-card p-6 md:p-8 rounded-[2rem] flex flex-col gap-5 h-auto');

fs.writeFileSync('src/App.tsx', app);
