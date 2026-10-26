const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, 'client/src/pages/AdminDashboardPage.jsx');
let code = fs.readFileSync(targetFile, 'utf8');

// Replace divide-y divide-[#1E293B]
code = code.split('divide-y divide-[#1E293B]').join('divide-y divide-[#DAD7D1]');

// Replace cancel/close button dark text on dark
code = code.split('px-2 py-1 bg-[#1E293B] text-[#171717] rounded-lg text-[11px]').join('px-2 py-1 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-[#171717] border border-[#DAD7D1] rounded-lg text-[11px] font-medium transition');
code = code.split('px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#171717] text-xs font-semibold rounded-xl transition').join('px-4 py-2 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-[#171717] border border-[#DAD7D1] text-xs font-semibold rounded-xl transition');
code = code.split('px-4 py-2 bg-[#1E293B] hover:bg-[#334155] text-[#171717] text-xs rounded-xl transition').join('px-4 py-2 bg-[#F1EFEA] hover:bg-[#E5E2DC] text-[#171717] border border-[#DAD7D1] text-xs font-medium rounded-xl transition');

// Replace hover:bg-[#1E293B] with dark text
code = code.split('hover:bg-[#1E293B] border border-[#DAD7D1] text-xs text-[#171717]').join('hover:bg-[#E5E2DC] border border-[#DAD7D1] text-xs text-[#171717]');
code = code.split('hover:bg-[#1E293B] border border-[#DAD7D1] text-[#171717]').join('hover:bg-[#E5E2DC] border border-[#DAD7D1] text-[#171717]');
code = code.split('hover:bg-[#1E293B] text-xs text-[#171717]').join('hover:bg-[#E5E2DC] text-xs text-[#171717]');
code = code.split('hover:bg-[#1E293B] border border-[#DAD7D1] text-xs font-semibold text-[#171717]').join('hover:bg-[#E5E2DC] border border-[#DAD7D1] text-xs font-semibold text-[#171717]');
code = code.split('hover:bg-[#1E293B] border border-[#DAD7D1] hover:border-[#D4AF37] text-[#D4AF37]').join('hover:bg-[#E5E2DC] border border-[#DAD7D1] hover:border-[#D4AF37] text-[#D4AF37]');
code = code.split('hover:bg-[#1E293B] border border-[#DAD7D1] hover:border-[#4D5543] text-[#35664A]').join('hover:bg-[#E5E2DC] border border-[#DAD7D1] hover:border-[#4D5543] text-[#35664A]');
code = code.split('hover:bg-[#1E293B] border border-[#DAD7D1] hover:border-[#171717] text-[#4D5543]').join('hover:bg-[#E5E2DC] border border-[#DAD7D1] hover:border-[#171717] text-[#4D5543]');
code = code.split('hover:bg-[#1E293B] rounded-lg transition').join('hover:bg-[#E5E2DC] rounded-lg transition');
code = code.split('hover:bg-[#1E293B] border border-[#DAD7D1]').join('hover:bg-[#E5E2DC] border border-[#DAD7D1]');
code = code.split('p-1 rounded-lg hover:bg-[#1E293B]').join('p-1 rounded-lg hover:bg-[#E5E2DC]');
code = code.split('hover:bg-[#1E293B] text-xs text-[#77736E] hover:text-[#171717]').join('hover:bg-[#E5E2DC] text-xs text-[#77736E] hover:text-[#171717]');

// Email badges
code = code.split(": 'bg-[#1E293B] text-[#8C827A]'").join(": 'bg-[#E7E5E4] text-[#1C1917] font-bold border border-[#D6D3D1]'");
code = code.split(": 'bg-[#1E293B] text-[#77736E]'").join(": 'bg-[#E7E5E4] text-[#1C1917] font-bold border border-[#D6D3D1]'");
code = code.split("? 'bg-[#334155]/40 text-[#77736E]'").join("? 'bg-[#E7E5E4] text-[#44403C] font-semibold border border-[#D6D3D1]'");
code = code.split(": 'bg-[#1E293B] text-[#353535]'").join(": 'bg-[#E7E5E4] text-[#1C1917] font-bold border border-[#D6D3D1]'");

fs.writeFileSync(targetFile, code, 'utf8');
console.log('Sanitization complete!');
