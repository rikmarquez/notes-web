import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import ConnectionsSection from '../components/Connections/ConnectionsSection';
import AttachmentsSection from '../components/Attachments/AttachmentsSection';
import notesService from '../services/notesService';
import { formatDateTime, getErrorMessage, copyToClipboard, formatNoteForCopy } from '../utils/helpers';

const NoteViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await notesService.getNote(id);
        
        if (response.success) {
          setNote(response.data.note);
        } else {
          setError(response.message || 'Error al cargar la nota');
        }
      } catch (error) {
        setError(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNote();
    }
  }, [id]);

  const handleEdit = () => {
    navigate(`/note/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.')) {
      try {
        const response = await notesService.deleteNote(id);
        if (response.success) {
          navigate('/dashboard');
        } else {
          alert(response.message || 'Error al eliminar la nota');
        }
      } catch (error) {
        alert(getErrorMessage(error));
      }
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleCopyContent = async () => {
    if (!note || !note.content) {
      setCopyFeedback('No hay contenido para copiar');
      setTimeout(() => setCopyFeedback(''), 2000);
      return;
    }

    const contentToCopy = formatNoteForCopy(note);
    const result = await copyToClipboard(contentToCopy);
    
    setCopyFeedback(result.message);
    setTimeout(() => setCopyFeedback(''), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showSearchInHeader={false} />
        <div className="pt-16">
          <div className="container py-6">
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
              <span className="ml-2">Cargando nota...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showSearchInHeader={false} />
        <div className="pt-16">
          <div className="container py-6">
            <div className="alert alert-error">
              {error || 'Nota no encontrada'}
              <button 
                onClick={handleBack}
                className="btn btn-outline btn-sm ml-4"
              >
                Volver al dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearchInHeader={false} />
      
      <div className="pt-16">
        <div className="container" style={{ paddingTop: '32px', paddingBottom: '24px' }}>
          {/* Navigation */}
          <div style={{ marginBottom: '32px' }}>
            <button
              onClick={handleBack}
              style={{
                backgroundColor: '#059669',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
            >
              ← Volver al dashboard
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="card mb-6">
              <div className="card-header">
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {note.title}
                </h1>

                {/* Action Buttons */}
                <div className="mb-4 flex gap-3">
                  <button
                    onClick={handleEdit}
                    className="btn btn-primary btn-sm"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="btn btn-danger btn-sm"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
                
                {/* Metadata */}
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <span>
                    📅 Creado: {formatDateTime(note.created_at)}
                  </span>
                  {note.created_at !== note.updated_at && (
                    <span>
                      ✏️ Editado: {formatDateTime(note.updated_at)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {note.summary && (
              <div className="card mb-6">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-gray-800">
                    💭 Mi reflexión sobre esta idea
                  </h2>
                </div>
                <div className="card-body">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 italic leading-relaxed">
                      {note.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            {note.content && (
              <div className="card mb-6">
                <div className="card-header flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800">
                    📝 Contenido Principal
                  </h2>
                  <div className="relative">
                    <button
                      onClick={handleCopyContent}
                      className="btn btn-outline btn-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
                      title="Copiar contenido al portapapeles"
                    >
                      📋 Copiar
                    </button>
                    {copyFeedback && (
                      <div className="absolute top-full right-0 mt-2 px-3 py-2 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-nowrap z-10">
                        {copyFeedback}
                      </div>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  <div 
                    className="prose prose-gray max-w-none"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="card mb-6">
                <div className="card-header">
                  <h2 className="text-lg font-semibold text-gray-800">
                    🏷️ Tags
                  </h2>
                </div>
                <div className="card-body">
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            <AttachmentsSection 
              noteId={id} 
              isEditing={false}
            />

            {/* Connections */}
            <ConnectionsSection noteId={id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteViewPage;