const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
    // Header special overrides
    [/<div className="min-h-screen bg-\[\#0F172A\] text-\[\#F8FAFC\] antialiased flex flex-col"/g, 
    '<div className={`min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] transition-colors duration-300 antialiased flex flex-col`}'],
    
    // Toggle Button
    [/<button \n            onClick=\{\(\) => setTheme\('dark'\)\}\n            className="p-3 rounded-full text-\[\#94A3B8\]"\n          >\n            <Moon className="w-6 h-6" \/>\n          <\/button>/g,
    `<button \n            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}\n            className="p-3 rounded-full text-slate-500 dark:text-[#94A3B8] hover:bg-slate-200 dark:hover:bg-[#1E293B] transition-colors"\n          >\n            {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}\n          </button>`],

    // Color mappings
    [/bg-\[\#0F172A\]/g, 'bg-slate-50 dark:bg-[#0F172A]'],
    [/bg-\[\#1E293B\]/g, 'bg-white dark:bg-[#1E293B]'],
    [/text-\[\#F8FAFC\]/g, 'text-slate-900 dark:text-[#F8FAFC]'],
    [/text-\[\#94A3B8\]/g, 'text-slate-500 dark:text-[#94A3B8]'],
    [/border-\[\#334155\]/g, 'border-slate-200 dark:border-[#334155]'],
    [/text-\[\#38BDF8\]/g, 'text-blue-600 dark:text-[#38BDF8]'],
    [/focus:border-\[\#38BDF8\]/g, 'focus:border-blue-500 dark:focus:border-[#38BDF8]'],
    [/bg-\[\#22C55E\]/g, 'bg-green-600 dark:bg-[#22C55E]'],
    [/border-\[\#38BDF8\]/g, 'border-blue-500 dark:border-[#38BDF8]'],
    [/bg-\[\#38BDF8\]\/10/g, 'bg-blue-50 dark:bg-[#38BDF8]/10'],
    [/hover:bg-\[\#38BDF8\]\/20/g, 'hover:bg-blue-100 dark:hover:bg-[#38BDF8]/20'],
    [/bg-\[\#22C55E\]\/10/g, 'bg-green-50 dark:bg-[#22C55E]/10'],
    [/border-\[\#22C55E\]/g, 'border-green-500 dark:border-[#22C55E]'],
    [/text-\[\#22C55E\]/g, 'text-green-700 dark:text-[#22C55E]'],
    [/bg-red-500\/10/g, 'bg-red-50 dark:bg-red-500/10'],
    [/border-red-500/g, 'border-red-500 dark:border-red-600'], 
    [/text-red-400/g, 'text-red-600 dark:text-red-400'],
    [/hover:border-\[\#38BDF8\]/g, 'hover:border-blue-500 dark:hover:border-[#38BDF8]'],
    [/hover:text-\[\#38BDF8\]/g, 'hover:text-blue-600 dark:hover:text-[#38BDF8]'],
    [/hover:bg-\[\#38BDF8\]\/5/g, 'hover:bg-blue-50 dark:hover:bg-[#38BDF8]/5'],
    [/border-b border-slate-200 dark:border-\[\#334155\] bg-slate-50 dark:bg-\[\#0F172A\]\/80/g, 'border-b border-slate-200 dark:border-[#334155] bg-white/80 dark:bg-[#0F172A]/80'], // Fix for header bg that gets clobbered above
    [/bg-red-900\/30/g, 'bg-red-50 dark:bg-red-900/30'],
    [/border-red-500\/50/g, 'border-red-200 dark:border-red-500/50'],
    [/text-white/g, 'text-white dark:text-[#F8FAFC]']
];

for (const [regex, replacement] of replacements) {
    code = code.replace(regex, replacement);
}

// Clean up any weird stacking from chaining logic
code = code.replace(/text-slate-900 dark:text-slate-900 dark:text-\[\#F8FAFC\]/g, 'text-slate-900 dark:text-[#F8FAFC]');
code = code.replace(/bg-slate-50 dark:bg-slate-50 dark:bg-\[\#0F172A\]/g, 'bg-slate-50 dark:bg-[#0F172A]');

fs.writeFileSync('src/App.tsx', code);
console.log("Successfully wrote updated theme bindings to App.tsx");
