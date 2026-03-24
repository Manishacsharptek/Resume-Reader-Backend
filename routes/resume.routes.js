import express from 'express';
import multer from 'multer';
import { uploadResume, getAiInsights } from '../controllers/resume.controller.js';

const router = express.Router();

// Set up multer for temporary storage in 'uploads/' directory
const upload = multer({ dest: 'uploads/' });

// Route to handle resume upload and scoring (fast — no AI)
router.post('/upload', upload.single('resume'), uploadResume);

// Route to get Gemini AI insights (slower — called separately by frontend after score is shown)
router.post('/ai-insights', getAiInsights);

export default router;
