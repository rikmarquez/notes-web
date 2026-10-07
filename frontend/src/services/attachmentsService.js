import api from './api';

const attachmentsService = {
  // Subir archivo a una nota
  uploadFile: async (noteId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/attachments/notes/${noteId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Obtener archivos de una nota
  getAttachmentsByNote: async (noteId) => {
    try {
      const response = await api.get(`/attachments/notes/${noteId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting attachments:', error);
      throw error;
    }
  },

  // Descargar archivo
  downloadFile: async (attachmentId, filename) => {
    try {
      const response = await api.get(`/attachments/${attachmentId}/download`, {
        responseType: 'blob',
      });

      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading file:', error);
      throw error;
    }
  },

  // Eliminar archivo
  deleteAttachment: async (attachmentId) => {
    try {
      const response = await api.delete(`/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting attachment:', error);
      throw error;
    }
  },

  // Formatear tamaño de archivo
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Obtener nombre de icono (components/UI/Icon) según tipo de archivo
  getFileIcon: (mimeType) => {
    if (mimeType.includes('pdf')) return 'file';
    if (mimeType.includes('word')) return 'file';
    if (mimeType.includes('excel') || mimeType.includes('sheet')) return 'table';
    if (mimeType.includes('image')) return 'image';
    if (mimeType.includes('text')) return 'file';
    if (mimeType.includes('sql') || mimeType === 'application/sql') return 'database';
    if (mimeType.includes('tar') || mimeType.includes('archive')) return 'archive';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'archive';
    return 'paperclip';
  },

  // Validar tipo de archivo - ahora permite todos los tipos
  isValidFileType: (file) => {
    // Permitir todos los tipos de archivo
    // Solo verificar que tenga un nombre válido
    return file.name && file.name.trim().length > 0;
  },

  // Validar tamaño de archivo
  isValidFileSize: (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }
};

export default attachmentsService;