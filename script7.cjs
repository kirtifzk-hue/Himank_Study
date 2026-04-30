const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/text-3xl md:text-5xl font-semibold/g, 'text-3xl md:text-5xl font-semibold font-serif');
app = app.replace(/text-xl md:text-3xl font-semibold/g, 'text-xl md:text-3xl font-semibold font-serif');
app = app.replace(/text-xl sm:text-2xl md:text-3xl font-extrabold/g, 'text-xl sm:text-2xl md:text-3xl font-bold font-serif');
app = app.replace(/text-[1-9]xl (sm|md|lg):text-[1-9]xl font-semibold/g,  (match) => match + ' font-serif');
app = app.replace(/text-4xl md:text-6xl font-[a-z]+/g, 'text-4xl md:text-6xl font-bold font-serif');
app = app.replace(/<h1 className="md:hidden text-2xl font-bold/g, '<h1 className="md:hidden text-2xl font-bold font-serif');

// specific to App.tsx h1
app = app.replace(/<h1 className="text-4xl md:text-6xl font-semibold text-slate-900 dark:text-white leading-tight tracking-tight/g, '<h1 className="text-4xl md:text-6xl font-bold font-serif text-slate-900 dark:text-white leading-tight tracking-tight');

fs.writeFileSync('src/App.tsx', app);
