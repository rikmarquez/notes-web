import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NoteEditor from '../components/Editor/NoteEditor';
import Header from '../components/Layout/Header';

const NoteEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewNote = !id || id === 'new';

  const handleSave = (note) => {
    navigate(`/note/${note.id}`);
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
      <Header />
      
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