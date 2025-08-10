import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TagInput from '../Tags/TagInput';
import AttachmentsSection from '../Attachments/AttachmentsSection';
import notesService from '../../services/notesService';
import { getErrorMessage } from '../../utils/helpers';

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

  // ReactQuill configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'color', 'background', 'list', 'bullet', 'align',
    'link', 'image'
  ];

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
      <div className="flex justify-center items-center h-64">
        <div className="spinner"></div>
        <span className="ml-2">Cargando nota...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {noteId ? 'Editar Nota' : 'Nueva Nota'}
          </h1>
          <div className="flex gap-3">
            {onCancel && (
              <button
                onClick={onCancel}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={loading || !formData.title.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="spinner"></div>
                  Guardando...
                </span>
              ) : (
                noteId ? 'Actualizar' : 'Crear Nota'
              )}
            </button>
          </div>
        </div>
        
        {saved && (
          <div className="mt-2 text-green-600 text-sm">
            ✅ Nota guardada automáticamente
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="alert alert-error mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="space-y-6">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="title" className="form-label text-lg">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Escribe el título de tu nota..."
            className="form-input text-lg"
            disabled={loading}
            maxLength={500}
          />
          <div className="text-sm text-gray-500 mt-1">
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
          <div className="text-sm text-gray-500 mt-1">
            {formData.summary.length}/2000 caracteres
          </div>
        </div>

        {/* Content Editor */}
        <div className="form-group">
          <label className="form-label">
            Contenido Principal
          </label>
          <div className="border border-gray-300 rounded-lg overflow-hidden">
            <ReactQuill
              value={formData.content}
              onChange={(content) => handleInputChange('content', content)}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Desarrolla tu idea principal aquí..."
              style={{ minHeight: '300px' }}
              readOnly={loading}
            />
          </div>
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
        <div className="form-group">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              className="form-checkbox h-5 w-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
              disabled={loading}
            />
            <label htmlFor="isPrivate" className="form-label mb-0 cursor-pointer">
              <span className="font-medium text-red-700">🔒 Nota Privada</span>
              <div className="text-sm text-gray-600 mt-1">
                Solo yo puedo ver, editar y eliminar esta nota. Perfecta para información sensible como contraseñas, cuentas personales, etc.
              </div>
            </label>
          </div>
        </div>

        {/* Attachments */}
        {noteId && (
          <AttachmentsSection 
            noteId={noteId} 
            isEditing={true}
          />
        )}
      </div>

      {/* Mobile save button */}
      <div className="mt-8 mb-24 block md:hidden" style={{ marginBottom: '6rem' }}>
        <button
          onClick={handleSave}
          className="btn btn-primary w-full"
          disabled={loading || !formData.title.trim()}
        >
          {loading ? 'Guardando...' : (noteId ? 'Actualizar Nota' : 'Crear Nota')}
        </button>
      </div>
    </div>
  );
};

export default NoteEditor;