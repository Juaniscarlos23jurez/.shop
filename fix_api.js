const fs = require('fs');
let code = fs.readFileSync('lib/api/api.ts', 'utf8');
const lines = code.split('\n');

// We know export const api ends at line 2544
// We know reviews inside pointRules starts at line 2746
// We know whatsapp ends at line 3118

const blockStartIndex = 2745; // line 2746
const blockEndIndex = 3118; // line 3118, next is 3119 };

const blockToMove = lines.slice(blockStartIndex, blockEndIndex);
lines.splice(blockStartIndex, blockToMove.length);

const apiEndIndex = 2543; // line 2544 };
lines.splice(apiEndIndex, 0, ...blockToMove);

fs.writeFileSync('lib/api/api.ts', lines.join('\n'));
