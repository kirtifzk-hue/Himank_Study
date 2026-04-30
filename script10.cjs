const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/focus:border-rose-[0-9]+/g, 'focus:border-slate-900 dark:focus:border-white');
app = app.replace(/focus:border-purple-[0-9]+/g, 'focus:border-slate-900 dark:focus:border-white');
app = app.replace(/focus:border-emerald-[0-9]+/g, 'focus:border-slate-900 dark:focus:border-white');
app = app.replace(/focus:border-amber-[0-9]+/g, 'focus:border-slate-900 dark:focus:border-white');
app = app.replace(/focus:bg-rose-50/g, 'focus:bg-slate-50');
app = app.replace(/focus:bg-purple-50/g, 'focus:bg-slate-50');
app = app.replace(/focus:bg-emerald-50/g, 'focus:bg-slate-50');
app = app.replace(/focus:bg-amber-50/g, 'focus:bg-slate-50');

app = app.replace(/dark:focus:bg-rose-900\/20/g, 'dark:focus:bg-[#151515]');
app = app.replace(/dark:focus:bg-purple-900\/20/g, 'dark:focus:bg-[#151515]');
app = app.replace(/dark:focus:bg-emerald-900\/20/g, 'dark:focus:bg-[#151515]');
app = app.replace(/dark:focus:bg-amber-900\/20/g, 'dark:focus:bg-[#151515]');

app = app.replace(/hover:border-rose-[0-9]+/g, 'hover:border-slate-900 dark:hover:border-white');
app = app.replace(/hover:border-purple-[0-9]+/g, 'hover:border-slate-900 dark:hover:border-white');
app = app.replace(/hover:border-emerald-[0-9]+/g, 'hover:border-slate-900 dark:hover:border-white');
app = app.replace(/hover:border-amber-[0-9]+/g, 'hover:border-slate-900 dark:hover:border-white');

fs.writeFileSync('src/App.tsx', app);
