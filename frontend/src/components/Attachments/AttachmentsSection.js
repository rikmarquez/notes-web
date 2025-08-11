import React, { useState, useEffect, useRef } from 'react';
import attachmentsService from '../../services/attachmentsService';
import './AttachmentsSection.css';

const AttachmentsSection = ({ noteId, isEditing }) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (noteId) {
      loadAttachments();
    }
  }, [noteId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const response = await attachmentsService.getAttachmentsByNote(noteId);
      setAttachments(response.attachments || []);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // Validaciones
      if (!attachmentsService.isValidFileType(file)) {
        alert(`Archivo inválido: ${file.name}`);
        continue;
      }
      
      if (!attachmentsService.isValidFileSize(file)) {
        alert(`Archivo demasiado grande: ${file.name}. Máximo 10MB`);
        continue;
      }

      try {
        setUploading(true);
        await attachmentsService.uploadFile(noteId, file);
        await loadAttachments(); // Recargar lista
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error subiendo archivo: ${file.name}`);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
    // Reset input
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDownload = async (attachment) => {
    try {
      await attachmentsService.downloadFile(attachment.id, attachment.original_filename);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error descargando archivo');
    }
  };

  const handleDelete = async (attachment) => {
    if (!window.confirm(`¿Estás seguro de eliminar el archivo "${attachment.original_filename}"?`)) {
      return;
    }

    try {
      await attachmentsService.deleteAttachment(attachment.id);
      await loadAttachments(); // Recargar lista
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Error eliminando archivo');
    }
  };

  if (loading) {
    return (
      <div className="attachments-section">
        <h3>📎 Archivos adjuntos</h3>
        <div className="loading">Cargando archivos...</div>
      </div>
    );
  }

  return (
    <div className="attachments-section">
      <div className="attachments-header">
        <h3>📎 Archivos adjuntos ({attachments.length})</h3>
        {isEditing && (
          <button
            className="upload-button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Subiendo...' : '+ Agregar archivo'}
          </button>
        )}
      </div>

      {isEditing && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            multiple
            style={{ display: 'none' }}
            accept="*"
          />
          
          <div
            className={`drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <div className="drop-zone-icon">📁</div>
              <p>Arrastra archivos aquí o haz clic para seleccionar</p>
              <small>Todos los tipos de archivo (máx. 10MB cada archivo)</small>
            </div>
          </div>
        </>
      )}

      <div className="attachments-list">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="attachment-item">
            <div className="attachment-info">
              <span className="attachment-icon">
                {attachmentsService.getFileIcon(attachment.mime_type)}
              </span>
              <div className="attachment-details">
                <div className="attachment-name">{attachment.original_filename}</div>
                <div className="attachment-meta">
                  {attachmentsService.formatFileSize(attachment.file_size)} • 
                  {' '}{new Date(attachment.created_at).toLocaleDateString()}
                  {attachment.uploader_name && ` • ${attachment.uploader_name}`}
                </div>
              </div>
            </div>
            
            <div className="attachment-actions">
              <button
                className="action-button download"
                onClick={() => handleDownload(attachment)}
                title="Descargar"
              >
                ⬇️
              </button>
              {isEditing && (
                <button
                  className="action-button delete"
                  onClick={() => handleDelete(attachment)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {attachments.length === 0 && !isEditing && (
        <div className="no-attachments">
          No hay archivos adjuntos en esta nota.
        </div>
      )}
    </div>
  );
};

export default AttachmentsSection;