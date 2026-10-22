import express from 'express';
import {
  uploadSketch,
  generateConcepts,
  consultAssistant,
  submitDossier,
  getDossier,
  getMyDossiers,
  addDossierMessage,
} from './studio.controller.js';
import { upload } from '../../middlewares/upload.middleware.js';
import { protect, optionalAuth } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/upload-sketch', upload.single('sketch'), uploadSketch);
router.post('/generate', generateConcepts);
router.post('/assistant-chat', consultAssistant);
router.post('/submit', optionalAuth, submitDossier);
router.get('/my-dossiers', protect, getMyDossiers);
router.get('/dossier/:refCode', optionalAuth, getDossier);
router.post('/dossier/:refCode/message', optionalAuth, addDossierMessage);

export default router;
