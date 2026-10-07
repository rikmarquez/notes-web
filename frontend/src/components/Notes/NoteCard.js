import React from 'react';
import Icon from '../UI/Icon';
import { formatDate, getTextPreview } from '../../utils/helpers';

const NoteCard = ({ note, onClick }) => {
  const handleClick = () => {
    onClick(note);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onClick(note);
    }
  };

  return (
    <article
      className="note-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="link"
      tabIndex={0}
    >
      {/* Header with title */}
      <div className="note-card-head">
        <h3 className="note-card-title">{note.title}</h3>
        {note.is_private && (
          <span className="chip-lock">
            <Icon name="lock" size={12} />
            Privada
          </span>
        )}
      </div>

      {/* Summary */}
      {note.summary && (
        <p className="note-card-text">
          {getTextPreview(note.summary, 200)}
        </p>
      )}

      {/* Footer with author and date */}
      <div className="note-card-foot">
        <strong>{note.author_name || 'Usuario'}</strong>
        <span>·</span>
        <span>
          {note.created_at !== note.updated_at ? 'Editada' : 'Creada'}{' '}
          {formatDate(note.updated_at).toLowerCase()}
        </span>
      </div>
    </article>
  );
};

export default NoteCard;
