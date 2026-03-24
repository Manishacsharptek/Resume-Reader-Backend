import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse-fork');

(async () => {
    try {
        console.log('Testing pdf-parse-fork...');
        const parseFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
        console.log('parseFn type:', typeof parseFn);
        
        // Minimal valid PDF header
        const buffer = Buffer.from('%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 0/Kids[]>>endobj\n%%EOF');
        
        const data = await parseFn(buffer);
        console.log('Result:', data);
        process.exit(0);
    } catch (err) {
        console.error('Error during PDF parse test:', err);
        process.exit(1);
    }
})();
