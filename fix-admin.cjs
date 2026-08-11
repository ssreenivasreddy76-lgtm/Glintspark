const fs = require('fs');
const path = require('path');
const d = path.join(__dirname, 'src', 'components');
fs.readdirSync(d).filter(f => f.startsWith('Admin') && f.endsWith('.tsx')).forEach(f => {
  const p = path.join(d, f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/dark:[a-zA-Z0-9\-\/]+/g, '');
  fs.writeFileSync(p, c);
  console.log('Fixed', f);
});
