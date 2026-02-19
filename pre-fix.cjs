const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');

const ROOT = '.';
const files = fg.sync(['**/*.ts', '**/*.tsx'], { cwd: ROOT, ignore: ['node_modules/**'] });

console.log(`Found ${files.length} files to check.`);

files.forEach(file => {
  const filePath = path.join(ROOT, file);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Regex to find import statements with unquoted relative paths, being careful not to match already correct paths.
    // Looks for `from` followed by a space, and then a path starting with `.` that is not quoted.
    content = content.replace(/(from\s+)(?!['"`])(\.\.?\/[^;\n\r]+)/g, (match, p1, p2) => {
        const trimmedPath = p2.trim().replace(/;$/, '');
        console.log(`Fixing unquoted import in ${filePath}: ${trimmedPath}`);
        return `${p1}'${trimmedPath}'`;
    });

    if (content !== originalContent) {
        console.log(`Writing changes to ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
    }
  } catch (e) {
    console.error(`Could not process file ${filePath}: ${e.message}`);
  }
});

console.log('Pre-fix script finished.');
