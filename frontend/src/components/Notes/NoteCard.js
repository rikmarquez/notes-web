import React from 'react';
import { formatDate, getTextPreview } from '../../utils/helpers';

const NoteCard = ({ note, onClick }) => {
  const handleClick = () => {
    onClick(note);
  };

  return (
    <div 
      className="card cursor-pointer hover:shadow-lg transition-shadow"
      onClick={handleClick}
    >
      <div className="card-body">
        {/* Header with title */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
              {note.title}
            </h3>
            {note.is_private && (
              <div className="flex-shrink-0 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                🔒 <span>Privado</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        {note.summary && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 italic">
              {getTextPreview(note.summary, 200)}
            </p>
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