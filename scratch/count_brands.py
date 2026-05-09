import json
import re

with open('src/data/paints.ts', 'r', encoding='utf-8') as f:
    content = f.read()
    # Extract the array content
    match = re.search(r'export const ALL_PAINTS: Paint\[\] = (\[.*\]);', content, re.DOTALL)
    if match:
        paints = json.loads(match.group(1))
        brands = {}
        for p in paints:
            brand = p.get('brand')
            brands[brand] = brands.get(brand, 0) + 1
        print(json.dumps(brands, indent=2))
    else:
        print("Could not find ALL_PAINTS array")
