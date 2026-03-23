import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { parseResumeText } from '../utils/resumeParser.js';
import { scoreResumeText } from '../utils/resumeScorer.js';

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded.' });
        }

        const filePath = req.file.path;
        const fileData = fs.readFileSync(filePath);

        // Parse PDF to text - handle both ES Module and CommonJS exports
        const parseFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
        const pdfData = await parseFn(fileData);
        const rawText = pdfData.text;

        // Parse extracted text to JSON using our utility
        const parsedProfile = parseResumeText(rawText);

        // Run dynamic scoring heuristics
        const scoringData = scoreResumeText(rawText);

        // Clean up the temporarily uploaded file
        fs.unlinkSync(filePath);

        res.status(200).json({
            success: true,
            data: parsedProfile,
            scoring: scoringData,
            message: 'Resume parsed and scored successfully.'
        });

    } catch (error) {
        console.error('Error parsing resume:', error);
        
        // Clean up temp file on error if it exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ success: false, message: `Server error during parsing: ${error.message}` });
    }
};

export { uploadResume };
