export interface ParsedItem {
    originalText: string;
    matchedName: string;
    quantity: number;
    confidence: number;
}

export class TextParser {
    // This would ideally be loaded from the DB or a config file
    private knownItems: string[] = [
        'bed', 'bett', 'sofa', 'couch', 'tisch', 'table', 'stuhl', 'chair',
        'schrank', 'wardrobe', 'box', 'karton', 'kommode', 'dresser'
    ];

    parse(text: string): ParsedItem[] {
        const results: ParsedItem[] = [];
        const lowerText = text.toLowerCase();

        // Basic regex to find "number item" or "item number" patterns
        // e.g., "2 betten", "ein sofa", "3x tisch"

        // Helper to convert number words to digits (German/English)
        const wordToNum: Record<string, number> = {
            'ein': 1, 'eine': 1, 'einen': 1, 'one': 1, 'a': 1, 'an': 1,
            'zwei': 2, 'two': 2,
            'drei': 3, 'three': 3,
            'vier': 4, 'four': 4,
            'fünf': 5, 'five': 5
        };

        this.knownItems.forEach(item => {
            // Regex to find quantity before the item
            // Matches: "2 [x] item", "two item"
            const regex = new RegExp(`(\\d+|${Object.keys(wordToNum).join('|')})\\s*(?:x|mal)?\\s*${item}\\w*`, 'gi');

            let match;
            while ((match = regex.exec(lowerText)) !== null) {
                let quantity = 1;
                const numPart = match[1];

                if (/\d/.test(numPart)) {
                    quantity = parseInt(numPart, 10);
                } else if (wordToNum[numPart]) {
                    quantity = wordToNum[numPart];
                }

                results.push({
                    originalText: match[0],
                    matchedName: item,
                    quantity,
                    confidence: 0.9
                });
            }

            // Check for item mention without explicit number (assume 1)
            // Only if not already matched by the quantity regex
            // (This logic needs refinement to avoid double counting, simplified for now)
        });

        return results;
    }
}
