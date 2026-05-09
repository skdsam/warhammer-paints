import fs from 'fs';

const content = fs.readFileSync('src/data/paints.ts', 'utf8');
const match = content.match(/export const ALL_PAINTS: Paint\[\] = (\[[\s\S]*?\]);/);
if (match) {
    try {
        const paints = JSON.parse(match[1]);
        const brands = {};
        paints.forEach(p => {
            brands[p.brand] = (brands[p.brand] || 0) + 1;
        });
        console.log(JSON.stringify(brands, null, 2));
    } catch (e) {
        console.error("JSON parse error", e);
        // Maybe it's not pure JSON but TS objects?
        // Let's try a simpler regex for brands
        const brandMatches = content.match(/"brand":\s*"([^"]+)"/g);
        if (brandMatches) {
            const brands = {};
            brandMatches.forEach(m => {
                const brand = m.match(/"brand":\s*"([^"]+)"/)[1];
                brands[brand] = (brands[brand] || 0) + 1;
            });
            console.log(JSON.stringify(brands, null, 2));
        }
    }
} else {
    console.log("Could not find ALL_PAINTS array");
}
