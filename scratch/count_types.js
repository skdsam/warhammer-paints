import fs from 'fs';

const content = fs.readFileSync('src/data/paints.ts', 'utf8');
const typeMatches = content.match(/"type":\s*"([^"]+)"/g);
if (typeMatches) {
    const types = {};
    typeMatches.forEach(m => {
        const type = m.match(/"type":\s*"([^"]+)"/)[1];
        types[type] = (types[type] || 0) + 1;
    });
    console.log(JSON.stringify(types, null, 2));
} else {
    console.log("No types found");
}
