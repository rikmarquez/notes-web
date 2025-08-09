import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NoteEditor from '../components/Editor/NoteEditor';
import Header from '../components/Layout/Header';

const NoteEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewNote = !id || id === 'new';

  const handleSave = (note) => {
    console.log('Note saved:', note); // Debug log
    if (note && note.id) {
      navigate(`/note/${note.id}`);
    } else {
      console.error('Note ID is missing:', note);
      // If we're editing an existing note, navigate back to it
      if (!isNewNote && id) {
        navigate(`/note/${id}`);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleCancel = () => {
    if (isNewNote) {
      navigate('/dashboard');
    } else {
      navigate(`/note/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearchInHeader={false} />
      
      <div className="pt-16"> {/* Account for fixed header */}
        <div className="container py-6">
          <NoteEditor
            noteId={isNewNote ? null : id}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};

export default NoteEditPage;