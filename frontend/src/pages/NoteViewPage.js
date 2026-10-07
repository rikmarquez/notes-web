import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Layout/Header';
import ConnectionsSection from '../components/Connections/ConnectionsSection';
import AttachmentsSection from '../components/Attachments/AttachmentsSection';
import Icon from '../components/UI/Icon';
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
      <div className="app-shell">
        <Header />
        <main className="container page">
          <div className="loading-row">
            <div className="spinner"></div>
            Cargando nota...
          </div>
        </main>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="app-shell">
        <Header />
        <main className="container page">
          <div className="page-wide">
            <div className="alert alert-error">
              <Icon name="alert" />
              {error || 'Nota no encontrada'}
              <button
                onClick={handleBack}
                className="btn btn-outline btn-sm"
              >
                Volver al dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />

      <main className="container page">
        <div className="page-wide">
          {/* Navigation */}
          <button onClick={handleBack} className="back-link">
            <Icon name="arrow-left" size={16} />
            Volver al dashboard
          </button>

          {/* Header */}
          <header className="note-head">
            {note.is_private && (
              <span
                className="chip-lock"
                title="Solo tú puedes ver esta nota. No es visible para otros usuarios."
              >
                <Icon name="lock" size={12} />
                Nota privada · solo tú puedes verla
              </span>
            )}

            <h1 className="note-title">{note.title}</h1>

            {/* Metadata */}
            <div className="note-meta">
              <span>Creada el {formatDateTime(note.created_at)}</span>
              {note.created_at !== note.updated_at && (
                <span>Editada el {formatDateTime(note.updated_at)}</span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="note-actions">
              <button onClick={handleEdit} className="btn btn-primary btn-sm">
                <Icon name="edit" size={16} />
                Editar
              </button>
              {note.content && (
                <div className="tooltip-anchor">
                  <button
                    onClick={handleCopyContent}
                    className="btn btn-secondary btn-sm"
                    title="Copiar contenido al portapapeles"
                  >
                    <Icon name="copy" size={16} />
                    Copiar
                  </button>
                  {copyFeedback && (
                    <div className="tooltip" role="status">
                      {copyFeedback}
                    </div>
                  )}
                </div>
              )}
              <button onClick={handleDelete} className="btn btn-danger btn-sm">
                <Icon name="trash" size={16} />
                Eliminar
              </button>
            </div>
          </header>

          {/* Summary */}
          {note.summary && (
            <aside className="reflection">
              <h2 className="eyebrow">Mi reflexión sobre esta idea</h2>
              <p>{note.summary}</p>
            </aside>
          )}

          {/* Main Content */}
          {note.content && (
            <section className="card note-body">
              <div className="card-body">
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              </div>
              {/* Edit button below content - no need to scroll up */}
              <div className="card-footer">
                <button onClick={handleEdit} className="btn btn-secondary">
                  <Icon name="edit" />
                  Editar esta nota
                </button>
              </div>
            </section>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="tag-row note-tags">
              {note.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                </span>
              ))}
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
      </main>

      {/* Floating back to dashboard button - always visible */}
      <button
        onClick={handleBack}
        className="fab"
        title="Volver al dashboard"
        aria-label="Volver al dashboard"
      >
        <Icon name="home" size={22} />
      </button>
    </div>
  );
};

export default NoteViewPage;
