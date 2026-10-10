const fs = require('fs');
const path = require('path');

const directories = [
  'app/player/tournaments',
  'app/player/community',
  'app/player/messages',
  'app/player/settings',
];

const replacements = [
  // Backgrounds and Borders
  { regex: /bg-zinc-900\/[0-9]{2} border border-zinc-800(\/80)? rounded-3xl/g, replace: 'bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] rounded-3xl' },
  { regex: /bg-zinc-900\/[0-9]{2} border border-zinc-800/g, replace: 'bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' },
  { regex: /bg-gradient-to-b from-zinc-900\/60 to-zinc-950 border border-zinc-800/g, replace: 'bg-[#121214] border border-white/[0.04] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' },
  { regex: /bg-zinc-950\/[0-9]{2} border border-zinc-900/g, replace: 'bg-[#0a0a0c] border border-white/[0.02]' },
  { regex: /bg-zinc-950\/[0-9]{2} border border-zinc-800\/[0-9]{2}/g, replace: 'bg-[#0a0a0c] border border-white/[0.02]' },
  { regex: /bg-zinc-950 border border-zinc-800/g, replace: 'bg-[#0a0a0c] border border-white/[0.02]' },
  
  // Specific zinc color texts
  { regex: /text-zinc-500/g, replace: 'text-white/40' },
  { regex: /text-zinc-400/g, replace: 'text-white/50' },
  { regex: /text-zinc-300/g, replace: 'text-white/70' },
  
  // Dividers
  { regex: /border-zinc-850/g, replace: 'border-white/[0.04]' },
  { regex: /border-zinc-800/g, replace: 'border-white/[0.04]' },
];

directories.forEach(dir => {
  const fullPath = path.join(__dirname, dir, 'page.js');
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Reduce uppercase spam
    content = content.replace(/font-black uppercase tracking-wider/g, 'font-bold text-sm tracking-tight');
    content = content.replace(/font-black uppercase tracking-widest/g, 'font-bold text-sm tracking-tight');
    content = content.replace(/font-bold uppercase tracking-wider/g, 'font-bold text-sm tracking-tight');
    content = content.replace(/font-bold uppercase tracking-widest/g, 'font-bold text-sm tracking-tight');
    
    // Apply regex replacements
    replacements.forEach(rep => {
      content = content.replace(rep.regex, rep.replace);
    });
    
    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${fullPath}`);
  }
});
