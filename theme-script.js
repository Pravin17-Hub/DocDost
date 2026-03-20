const fs = require('fs');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = dir + '/' + file;
    try {
      filelist = fs.statSync(dirFile).isDirectory() ? walkSync(dirFile, filelist) : filelist.concat(dirFile);
    } catch (err) { }
  });
  return filelist;
};

const mapEntries = [
  // backgrounds
  ["bg-black/20", "bg-white border border-slate-200 shadow-sm"],
  ["bg-black/40", "bg-slate-50"],
  ["bg-black/60", "bg-white/80"],
  ["bg-black", "bg-slate-50"],
  ["bg-slate-950", "bg-slate-100"],
  ["bg-slate-900", "bg-slate-50"],
  ["bg-slate-800", "bg-slate-200"],
  ["bg-white/5", "bg-white shadow-sm border border-slate-100"],
  ["bg-white/10", "bg-slate-100"],
  ["bg-white/20", "bg-slate-200"],
  ["bg-background", "bg-white"],
  
  // text colors
  ["text-white/80", "text-slate-700"],
  ["text-white/60", "text-slate-600"],
  ["text-white/50", "text-slate-500"],
  ["text-white/40", "text-slate-500"],
  ["text-white/30", "text-slate-400"],
  ["text-white/20", "text-slate-300"],
  ["text-white/10", "text-slate-200"],
  ["text-white", "text-slate-900"],
  ["text-foreground", "text-slate-900"],

  // borders
  ["border-white/10", "border-slate-200"],
  ["border-white/20", "border-slate-300"],
  ["border-slate-800", "border-slate-200"],

  // gradients
  ["from-blue-950/20", "from-blue-50"],
  ["from-indigo-950/20", "from-indigo-50"],
  ["from-purple-950/20", "from-purple-50"],
  ["via-background", "via-white"],
  ["to-background", "to-white"]
];

const files = walkSync('c:/Users/Dell/Desktop/DocDost/frontend/src/app').concat(walkSync('c:/Users/Dell/Desktop/DocDost/frontend/src/components'));

files.filter(f => f.endsWith('.tsx')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // First, fix the compilation error in consultation/page.tsx
  if (file.includes('consultation')) {
     content = content.replace(/\\\`/g, "`");
     content = content.replace(/\\\$/g, "$");
  }

  // Then apply theme replacements
  mapEntries.forEach(([dark, light]) => {
     // We replace exact sequences to avoid partial overlaps later, 
     // but since we process in order, we put more specific ones first (like bg-black/20 before bg-black).
     // Already ordered in mapEntries!
     content = content.split(dark).join(light);
  });

  fs.writeFileSync(file, content);
});

console.log("Theme conversion complete");
