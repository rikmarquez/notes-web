import React from 'react';
import { formatDate, getTextPreview } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

const NoteCard = ({ note, onClick, onEdit, onDelete }) => {
  const { user } = useAuth();
  const handleClick = (e) => {
    // Prevent card click when clicking action buttons
    if (e.target.closest('.note-actions')) {
      return;
    }
    onClick(note);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(note);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
      onDelete(note.id);
    }
  };

  // Allow all authenticated users to edit and delete any note (collaborative knowledge base)
  const canEdit = !!user; // Any authenticated user can edit
  const canDelete = !!user; // Any authenticated user can delete

  return (
    <div 
      className="card cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="card-body">
        {/* Header with title and actions */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {note.title}
          </h3>
          {(canEdit || canDelete) && (
            <div className="note-actions flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="text-gray-500 hover:text-blue-600 p-1"
                  title="Editar nota"
                >
                  ✏️
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-red-600 p-1"
                  title="Eliminar nota"
                >
                  🗑️
                </button>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        {note.summary && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 italic">
              {getTextPreview(note.summary, 120)}
            </p>
          </div>
        )}

        {/* Content preview */}
        {note.content && (
          <div className="mb-3">
            <p className="text-gray-700">
              {getTextPreview(note.content, 150)}
            </p>
          </div>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {note.tags.slice(0, 4).map((tag, index) => (
                <span key={index} className="tag text-xs">
                  {tag}
                </span>
              ))}
              {note.tags.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{note.tags.length - 4} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer with author and date */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">
              👤 {note.author_name || 'Usuario'}
            </span>
            <span>•</span>
            <span>
              {formatDate(note.updated_at)}
            </span>
          </div>
          <span className="text-xs">
            {note.created_at !== note.updated_at ? 'Editado' : 'Creado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;