const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/<h1 className="text-\[22px\] md:text-\[28px\] font-semibold tracking-tight hidden sm:block text-slate-800">/g, '<h1 className="text-[28px] md:text-[36px] font-bold font-serif tracking-tight hidden sm:block text-slate-900 dark:text-white">');

app = app.replace(/<h1 className="text-\[22px\] md:hidden font-semibold tracking-tight text-slate-800">/g, '<h1 className="text-[26px] md:hidden font-bold font-serif tracking-tight text-slate-900 dark:text-white">');

app = app.replace(/text-xl md:text-2xl font-semibold text-center max-w-sm leading-snug/g, 'text-xl md:text-2xl font-serif text-center max-w-sm leading-snug text-slate-500');

app = app.replace(/text-2xl font-semibold text-center max-w-sm/g, 'text-2xl font-serif text-center max-w-sm text-slate-500');

app = app.replace(/bg-orange-100 text-orange-600 dark:bg-orange-500\/20 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-500\/30 font-semibold transition-colors shadow-sm/g, 'editorial-button-secondary');

// Let's remove bg-slate-100 and related from the theme toggle
app = app.replace(/bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-sm/g, 'editorial-button-secondary');
app = app.replace(/bg-slate-800 text-white p-2 rounded-none rotate-3 shadow-sm/g, 'editorial-panel p-2 rounded-none shadow-sm');
app = app.replace(/<Rocket className="w-20 h-20 text-indigo-300 dark:text-slate-900" \/>/g, '<Rocket className="w-20 h-20 text-slate-300 dark:text-slate-700" />');

fs.writeFileSync('src/App.tsx', app);
