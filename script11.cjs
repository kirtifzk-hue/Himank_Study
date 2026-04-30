const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf-8');

app = app.replace(/font-serif font-serif/g, 'font-serif');

fs.writeFileSync('src/App.tsx', app);
