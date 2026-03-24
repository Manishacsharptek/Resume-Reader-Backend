import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse-fork');
import { parseResumeText } from '../utils/resumeParser.js';
import { scoreResumeText } from '../utils/resumeScorer.js';
import { getGeminiSuggestions } from '../utils/geminiAi.js';

const uploadResume = async (req, res) => {
    try {
        // Default data returned when PDF cannot be read — user still reaches the score page
        const defaultData = {
            profile: { name: "User", email: "", phone: "", skills: [] },
            scores: { overall: 0, impact: 0, brevity: 0, style: 0, skills: 0 },
            recommendations: [],
            fixes: [],
            goods: [],
            overallScore: 0,
            rawText: ""
        };

        if (!req.file) {
            console.error("Upload error: req.file is missing");
            return res.status(200).json({ success: true, data: defaultData });
        }

        const filePath = req.file.path;
        console.log(`Received upload: ${req.file.originalname}, Path: ${filePath}, Size: ${req.file.size}`);

        const parseFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
        let rawText = "";
        let parsed = false;

        try {
            if (!fs.existsSync(filePath)) {
                console.error(`File does not exist at path: ${filePath}`);
                return res.status(200).json({ success: true, data: defaultData });
            }
            let fileData = fs.readFileSync(filePath);

            // Only attempt PDF strategies if file starts with %PDF header
            const isPdf = fileData.toString('utf8', 0, 4) === '%PDF';
            console.log(`Is PDF check: ${isPdf}`);
            if (isPdf) {
                // Strategy 1: trim after %%EOF and parse
                try {
                    const eofIdx = fileData.lastIndexOf('%%EOF');
                    const cleaned = eofIdx !== -1 ? fileData.slice(0, eofIdx + 5) : fileData;
                    const result = await parseFn(cleaned);
                    rawText = result.text;
                    parsed = true;
                } catch (e) { console.error("Strategy 1 failed:", e.message); }

                // Strategy 2: strip bytes before %PDF header
                if (!parsed) {
                    try {
                        const headerIdx = fileData.indexOf('%PDF');
                        const trimmed = headerIdx > 0 ? fileData.slice(headerIdx) : fileData;
                        const result = await parseFn(trimmed);
                        rawText = result.text;
                        parsed = true;
                    } catch (e) { console.error("Strategy 2 failed:", e.message); }
                }

                // Strategy 3: use raw original bytes without any modification
                if (!parsed) {
                    try {
                        const raw = fs.readFileSync(filePath);
                        const result = await parseFn(raw);
                        rawText = result.text;
                        parsed = true;
                    } catch (e) { console.error("Strategy 3 failed:", e.message); }
                }
            } else {
                console.log("Not a PDF file, skipping strategies.");
            }
        } catch (e) {
            console.error("File processing error:", e.message);
        }

        // Always clean up the temp file
        try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch { /* ignore */ }

        // If we couldn't parse at all, return default data — user still goes to score page
        if (!parsed || !rawText.trim()) {
            console.warn("Parsing failed or empty text returned. Returning default data.");
            return res.status(200).json({ success: true, data: defaultData });
        }

        console.log("Parsing successful, scoring now...");

        // Happy path — parse and score
        try {
            const parserResult = parseResumeText(rawText);
            const scorerResult = scoreResumeText(rawText);
            console.log(`Scoring complete. Score: ${parserResult.scores.overall}`);
            return res.status(200).json({
                success: true,
                data: {
                    profile: parserResult.profile,
                    scores: parserResult.scores,
                    recommendations: parserResult.recommendations,
                    fixes: scorerResult.fixes,
                    goods: scorerResult.goods,
                    overallScore: parserResult.scores.overall,
                    rawText
                }
            });
        } catch (e) {
            console.error("Scorer crashed:", e.message);
            return res.status(200).json({ success: true, data: defaultData });
        }
    } catch (err) {
        console.error("CRITICAL UPLOAD CONTROLLER ERROR:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getAiInsights = async (req, res) => {
    try {
        const { rawText } = req.body;

        if (!rawText) {
            return res.status(400).json({ success: false, message: 'Missing rawText in request body.' });
        }

        // Get AI suggestions from Gemini
        const aiResult = await getGeminiSuggestions(rawText);

        res.status(200).json({
            success: true,
            data: {
                aiSuggestions: aiResult.suggestions,
                aiMeta: {
                    isLive: aiResult.isLive,
                    wordCount: aiResult.wordCount,
                    count: aiResult.suggestions.length
                }
            },
            message: 'AI insights generated successfully.'
        });

    } catch (error) {
        console.error('Error generating AI insights:', error);
        res.status(500).json({ success: false, message: `Server error generating AI insights: ${error.message}` });
    }
};

export { uploadResume, getAiInsights };
