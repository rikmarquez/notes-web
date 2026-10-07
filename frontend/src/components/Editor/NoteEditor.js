import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TagInput from '../Tags/TagInput';
import AttachmentsSection from '../Attachments/AttachmentsSection';
import Icon from '../UI/Icon';
import notesService from '../../services/notesService';
import { getErrorMessage } from '../../utils/helpers';
import { attachMarkdownPaste } from '../../utils/markdownPaste';

const NoteEditor = ({ noteId, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    tags: [],
    isPrivate: false
  });
  const [loading, setLoading] = useState(false);
  const [loadingNote, setLoadingNote] = useState(!!noteId);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const quillRef = useRef(null);

  // ReactQuill configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'indent', 'align',
    'blockquote', 'code-block', 'code',
    'link', 'image'
  ];

  // Convert pasted markdown into formatted text (create and edit modes)
  useEffect(() => {
    if (loadingNote || !quillRef.current) return;
    return attachMarkdownPaste(quillRef.current.getEditor());
  }, [loadingNote]);

  // Load existing note if editing
  useEffect(() => {
    const loadNote = async () => {
      if (!noteId) {
        setLoadingNote(false);
        return;
      }

      try {
        const response = await notesService.getNote(noteId);
        if (response.success) {
          const note = response.data.note;
          setFormData({
            title: note.title || '',
            summary: note.summary || '',
            content: note.content || '',
            tags: note.tags || [],
            isPrivate: note.is_private || false
          });
        } else {
          setError(response.message || 'Error al cargar la nota');
        }
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoadingNote(false);
      }
    };

    loadNote();
  }, [noteId]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setSaved(false);
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return false;
    }
    if (formData.title.length > 500) {
      setError('El título no puede exceder 500 caracteres');
      return false;
    }
    if (formData.summary.length > 2000) {
      setError('El resumen no puede exceder 2000 caracteres');
      return false;
    }
    return true;
  };

  // Save note
  const handleSave = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const noteData = {
        title: formData.title.trim(),
        summary: formData.summary.trim() || null,
        content: formData.content.trim() || null,
        tags: formData.tags,
        isPrivate: formData.isPrivate
      };

      let response;
      if (noteId) {
        response = await notesService.updateNote(noteId, noteData);
      } else {
        response = await notesService.createNote(noteData);
      }

      if (response.success) {
        console.log('Update response:', response); // Debug log
        setSaved(true);
        if (onSave) {
          onSave(response.data.note);
        }
      } else {
        setError(response.message || 'Error al guardar la nota');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Auto-save functionality (optional)
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (noteId && formData.title.trim() && !loading && !saved) {
        handleSave();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, noteId, loading, saved]);


  if (loadingNote) {
    return (
      <div className="loading-row">
        <div className="spinner"></div>
        Cargando nota...
      </div>
    );
  }

  const canSave = !loading && formData.title.trim();
  const saveLabel = noteId ? 'Actualizar nota' : 'Crear nota';

  return (
    <div className="page-wide">
      {/* Header */}
      <div className="page-head">
        <h1 className="page-title page-title-sm">
          {noteId ? 'Editar nota' : 'Nueva nota'}
        </h1>
        <div className="page-actions hide-mobile">
          {onCancel && (
            <button
              onClick={onCancel}
              className="btn btn-ghost btn-sm"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            className="btn btn-secondary btn-sm"
            disabled={!canSave}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      {saved && (
        <div className="status-ok">
          <Icon name="check" size={16} />
          Nota guardada automáticamente
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="alert alert-error">
          <Icon name="alert" />
          {error}
        </div>
      )}

      {/* Form */}
      <div>
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Escribe el título de tu nota..."
            className="form-input form-input-title"
            disabled={loading}
            maxLength={500}
          />
          <div className="form-help">
            {formData.title.length}/500 caracteres
          </div>
        </div>

        {/* Summary */}
        <div className="form-group">
          <label htmlFor="summary" className="form-label">
            Mi reflexión sobre esta idea
          </label>
          <textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => handleInputChange('summary', e.target.value)}
            placeholder="Comparte tu perspectiva personal, conexiones con otras ideas, o por qué es importante para ti..."
            className="form-textarea"
            rows={4}
            disabled={loading}
            maxLength={2000}
          />
          <div className="form-help">
            {formData.summary.length}/2000 caracteres
          </div>
        </div>

        {/* Content Editor */}
        <div className="form-group">
          <label className="form-label">
            Contenido principal
          </label>
          <div className="editor-shell">
            <ReactQuill
              ref={quillRef}
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Desarrolla tu idea principal aquí..."
              readOnly={loading}
            />
          </div>
          <div className="form-help">
            Puedes pegar texto en Markdown y se convertirá automáticamente en texto con formato (Ctrl+Z para deshacer).
          </div>
        </div>

        {/* Action buttons right after content - no need to scroll */}
        <div className="action-bar">
          {onCancel && (
            <button
              onClick={onCancel}
              className="btn btn-ghost"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={!canSave}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Guardando...
              </>
            ) : (
              <>
                <Icon name="check" />
                {saveLabel}
              </>
            )}
          </button>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">
            Tags
          </label>
          <TagInput
            tags={formData.tags}
            onChange={(tags) => handleInputChange('tags', tags)}
            placeholder="Agrega tags para organizar tus notas..."
          />
        </div>

        {/* Privacy Setting */}
        <label className="check-row" htmlFor="isPrivate">
          <input
            type="checkbox"
            id="isPrivate"
            checked={formData.isPrivate}
            onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
            disabled={loading}
          />
          <span>
            <span className="check-row-title">
              <Icon name="lock" size={16} />
              Nota privada
            </span>
            <span className="check-row-text">
              Solo yo puedo ver, editar y eliminar esta nota. Perfecta para información sensible como contraseñas, cuentas personales, etc.
            </span>
          </span>
        </label>

        {/* Attachments */}
        {noteId && (
          <AttachmentsSection
            noteId={noteId}
            isEditing={true}
          />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
