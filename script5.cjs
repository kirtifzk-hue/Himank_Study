const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/glass-card/g, 'editorial-card');
app = app.replace(/glass-panel/g, 'editorial-panel');
app = app.replace(/glass-button/g, 'editorial-button-secondary');

app = app.replace(/rounded-2xl md:rounded-2xl/g, 'rounded-none');
app = app.replace(/rounded-2xl/g, 'rounded-none');
app = app.replace(/rounded-\[.*?\]/g, 'rounded-none');
app = app.replace(/rounded-3xl/g, 'rounded-none');
app = app.replace(/rounded-xl/g, 'rounded-none');

// keep icons/circles full if needed, but the regex above doesn't match rounded-full
app = app.replace(/text-3xl md:text-5xl font-bold/g, 'text-3xl md:text-5xl font-bold font-serif tracking-tight');
app = app.replace(/text-xl md:text-3xl font-bold text-slate-900 border-b border-slate-200 dark:border-slate-600/g, 'text-xl md:text-3xl font-bold font-serif text-slate-900 border-b border-slate-200 dark:border-slate-600');
app = app.replace(/text-4xl md:text-6xl font-black/g, 'text-4xl md:text-6xl font-bold font-serif tracking-tight');
app = app.replace(/font-serif tracking-tight tracking-tight/g, 'font-serif tracking-tight');

// Main CTA 
app = app.replace(/w-full bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-semibold py-4 px-6 md:px-8 rounded-none text-lg md:text-xl border-none cursor-pointer flex items-center justify-center gap-3 shadow-\[.*?\] hover:scale-\[1.02\] hover:-translate-y-1 hover:shadow-\[.*?\] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:transform-none mt-4 disabled:cursor-not-allowed group/g, 'w-full editorial-button py-5 px-6 md:px-8 text-lg md:text-xl flex items-center justify-center gap-3 mt-4 group');

fs.writeFileSync('src/App.tsx', app);
