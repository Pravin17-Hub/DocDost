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

const dirs = [
  'c:/Users/Dell/Desktop/DocDost/frontend/src/app',
  'c:/Users/Dell/Desktop/DocDost/frontend/src/components'
];

let files = [];
dirs.forEach(d => {
  files = files.concat(walkSync(d));
});

files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts')).forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace double quotes
content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, '`' + '${process.env.NEXT_PUBLIC_API_URL}$1' + '`');

// Replace single quotes
content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, '`' + '${process.env.NEXT_PUBLIC_API_URL}$1' + '`');

// Replace backticks
content = content.replace(/`http:\/\/localhost:5000([^`]*)`/g, '`' + '${process.env.NEXT_PUBLIC_API_URL}$1' + '`');
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
  }
});

console.log("Finished replacing hardcoded localhost URLs.");
