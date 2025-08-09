const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  upload,
  uploadFile,
  downloadFile,
  getAttachmentsByNote,
  deleteAttachment
} = require('../controllers/attachmentsController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Subir archivo a una nota
router.post('/notes/:noteId/upload', upload.single('file'), uploadFile);

// Obtener archivos de una nota
router.get('/notes/:noteId', getAttachmentsByNote);

// Descargar archivo específico
router.get('/:attachmentId/download', downloadFile);

// Eliminar archivo específico
router.delete('/:attachmentId', deleteAttachment);

module.exports = router;