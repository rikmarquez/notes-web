const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Attachment = require('../models/Attachment');
const Note = require('../models/Note');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: fileFilter
});

const uploadFile = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    // Verificar que la nota existe y pertenece al usuario
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    if (note.user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para agregar archivos a esta nota' });
    }

    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    // Crear registro en la base de datos
    const attachment = await Attachment.create({
      noteId,
      filename: req.file.filename,
      originalFilename: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: userId
    });

    res.status(201).json({
      message: 'Archivo subido exitosamente',
      attachment: {
        id: attachment.id,
        original_filename: attachment.original_filename,
        file_size: attachment.file_size,
        mime_type: attachment.mime_type,
        created_at: attachment.created_at
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // Limpiar archivo si hubo error en DB
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    // Buscar el attachment
    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Verificar permisos (debe ser dueño de la nota)
    const note = await Note.findById(attachment.note_id);
    if (!note || note.user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para descargar este archivo' });
    }

    // Verificar que el archivo existe
    try {
      await fs.access(attachment.file_path);
    } catch (error) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    // Configurar headers para descarga
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.original_filename}"`);
    res.setHeader('Content-Type', attachment.mime_type);

    // Enviar archivo
    res.sendFile(path.resolve(attachment.file_path));
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAttachmentsByNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user.id;

    // Verificar que la nota existe y pertenece al usuario
    const note = await Note.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Nota no encontrada' });
    }
    if (note.user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para ver los archivos de esta nota' });
    }

    const attachments = await Attachment.findByNoteId(noteId);
    
    // Formatear respuesta
    const formattedAttachments = attachments.map(att => ({
      id: att.id,
      original_filename: att.original_filename,
      file_size: att.file_size,
      mime_type: att.mime_type,
      created_at: att.created_at,
      uploader_name: att.uploader_name
    }));

    res.json({ attachments: formattedAttachments });
  } catch (error) {
    console.error('Error getting attachments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const userId = req.user.id;

    // Buscar el attachment
    const attachment = await Attachment.findById(attachmentId);
    if (!attachment) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Verificar permisos
    const note = await Note.findById(attachment.note_id);
    if (!note || note.user_id !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este archivo' });
    }

    // Eliminar archivo del sistema
    try {
      await fs.unlink(attachment.file_path);
    } catch (error) {
      console.warn('File not found on disk, continuing with database deletion:', error.message);
    }

    // Eliminar de la base de datos
    await Attachment.delete(attachmentId);

    res.json({ message: 'Archivo eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  upload,
  uploadFile,
  downloadFile,
  getAttachmentsByNote,
  deleteAttachment
};