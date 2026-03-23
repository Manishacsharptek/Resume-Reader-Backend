import express from 'express';
import multer from 'multer';
import { uploadResume } from '../controllers/resume.controller.js';

const router = express.Router();

// Set up multer for temporary storage in 'uploads/' directory
const upload = multer({ dest: 'uploads/' });

// Route to handle resume upload
// The frontend will send the file under the key 'resume'
router.post('/upload', upload.single('resume'), uploadResume);

export default router;
