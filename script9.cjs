const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/blue: \{[\s\S]*?\},[\s\S]*?purple: \{[\s\S]*?\},[\s\S]*?green: \{[\s\S]*?\},[\s\S]*?rose: \{[\s\S]*?\}/, `
    blue: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    },
    purple: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    },
    green: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    },
    rose: {
      bg: "bg-slate-100 dark:bg-slate-800",
      text: "text-slate-900 dark:text-slate-100",
      border: "hover:border-slate-900 dark:hover:border-slate-100",
      bloom: "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200",
    }`);

app = app.replace(/bg-blue-500/g, 'bg-slate-900');
app = app.replace(/bg-purple-500/g, 'bg-slate-900');
app = app.replace(/bg-green-500/g, 'bg-slate-900');
app = app.replace(/bg-rose-500/g, 'bg-slate-900');

fs.writeFileSync('src/App.tsx', app);
