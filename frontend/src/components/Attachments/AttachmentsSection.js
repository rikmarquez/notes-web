import React, { useState, useEffect, useRef } from 'react';
import attachmentsService from '../../services/attachmentsService';
import Icon from '../UI/Icon';

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
      <section className="section attachments-section">
        <div className="section-head">
          <h2 className="section-title">Archivos adjuntos</h2>
        </div>
        <p className="form-help">Cargando archivos...</p>
      </section>
    );
  }

  return (
    <section className="section attachments-section">
      <div className="section-head">
        <h2 className="section-title">
          Archivos adjuntos
          <span className="count">{attachments.length}</span>
        </h2>
        {isEditing && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="spinner"></span>
                Subiendo...
              </>
            ) : (
              <>
                <Icon name="plus" size={16} />
                Agregar archivo
              </>
            )}
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
            className={`drop-zone is-clickable ${dragOver ? 'is-active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="upload" size={24} />
            <p>Arrastra archivos aquí o haz clic para seleccionar</p>
            <span>Todos los tipos de archivo (máx. 10MB cada archivo)</span>
          </div>
        </>
      )}

      <div className="row-list">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="row">
            <div className="row-main">
              <span className="row-icon">
                <Icon name={attachmentsService.getFileIcon(attachment.mime_type)} size={20} />
              </span>
              <div className="row-text">
                <div className="row-title">{attachment.original_filename}</div>
                <div className="row-sub">
                  {attachmentsService.formatFileSize(attachment.file_size)} ·
                  {' '}{new Date(attachment.created_at).toLocaleDateString()}
                  {attachment.uploader_name && ` · ${attachment.uploader_name}`}
                </div>
              </div>
            </div>

            <div className="row-actions">
              <button
                className="icon-btn"
                onClick={() => handleDownload(attachment)}
                title="Descargar"
              >
                <Icon name="download" />
              </button>
              {isEditing && (
                <button
                  className="icon-btn icon-btn-danger"
                  onClick={() => handleDelete(attachment)}
                  title="Eliminar"
                >
                  <Icon name="trash" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {attachments.length === 0 && !isEditing && (
        <p className="form-help">
          No hay archivos adjuntos en esta nota.
        </p>
      )}
    </section>
  );
};

export default AttachmentsSection;
