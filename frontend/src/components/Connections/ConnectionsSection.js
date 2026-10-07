import React, { useState, useEffect } from 'react';
import InlineConnectionForm from './InlineConnectionForm';
import Icon from '../UI/Icon';
import connectionsService from '../../services/connectionsService';
import { getConnectionTypeLabel, getErrorMessage } from '../../utils/helpers';

const ConnectionsSection = ({ noteId }) => {
  const [connections, setConnections] = useState({});
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInlineForm, setShowInlineForm] = useState(false);

  useEffect(() => {
    fetchConnections();
    fetchConnectionTypes();
  }, [noteId]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await connectionsService.getNoteConnections(noteId);

      if (response.success) {
        setConnections(response.data.connections);
      } else {
        setError(response.message || 'Error al cargar las conexiones');
      }
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectionTypes = async () => {
    try {
      const response = await connectionsService.getConnectionTypes();
      if (response.success) {
        setConnectionTypes(response.data.connectionTypes);
      }
    } catch (error) {
      console.error('Error fetching connection types:', error);
    }
  };

  const handleCreateConnection = async (targetNoteId, connectionType) => {
    try {
      const response = await connectionsService.createConnection(
        noteId,
        targetNoteId,
        connectionType
      );

      if (response.success) {
        setShowInlineForm(false);
        fetchConnections(); // Refresh connections
      } else {
        throw new Error(response.message || 'Error al crear la conexión');
      }
    } catch (error) {
      throw error; // Let the form handle the error
    }
  };

  const handleDeleteConnection = async (connectionId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conexión?')) {
      try {
        const response = await connectionsService.deleteConnection(connectionId);

        if (response.success) {
          fetchConnections(); // Refresh connections
        } else {
          alert(response.message || 'Error al eliminar la conexión');
        }
      } catch (error) {
        alert(getErrorMessage(error));
      }
    }
  };

  const handleNoteClick = (noteId) => {
    window.location.href = `/note/${noteId}`;
  };

  if (loading) {
    return (
      <section className="section">
        <div className="section-head">
          <h2 className="section-title">Ideas conectadas</h2>
        </div>
        <p className="form-help">Cargando conexiones...</p>
      </section>
    );
  }

  const hasConnections = Object.keys(connections).length > 0;

  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">Ideas conectadas</h2>
        {!showInlineForm && hasConnections && (
          <button
            onClick={() => setShowInlineForm(true)}
            className="btn btn-secondary btn-sm"
          >
            <Icon name="plus" size={16} />
            Añadir conexión
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <Icon name="alert" />
          {error}
          <button
            onClick={fetchConnections}
            className="btn btn-outline btn-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Inline Connection Form */}
      {showInlineForm && (
        <InlineConnectionForm
          noteId={noteId}
          connectionTypes={connectionTypes}
          onCreateConnection={handleCreateConnection}
          onCancel={() => setShowInlineForm(false)}
        />
      )}

      {!hasConnections && !showInlineForm ? (
        <div className="empty">
          <div className="empty-icon">
            <Icon name="link" size={24} />
          </div>
          <h3>No hay conexiones aún</h3>
          <p>
            Conecta esta idea con otras notas para crear una red de conocimiento
          </p>
          <button
            onClick={() => setShowInlineForm(true)}
            className="btn btn-secondary"
          >
            <Icon name="plus" />
            Crear primera conexión
          </button>
        </div>
      ) : hasConnections ? (
        <div>
          {connectionTypes.map(type => {
            const typeConnections = connections[type] || [];
            if (typeConnections.length === 0) return null;

            return (
              <div key={type} className="conn-group">
                <h3 className="eyebrow">
                  {getConnectionTypeLabel(type)} · {typeConnections.length}
                </h3>

                <div className="row-list">
                  {typeConnections.map(connection => (
                    <div key={connection.id} className="row">
                      <div
                        className="row-main row-link"
                        onClick={() => handleNoteClick(connection.noteId)}
                      >
                        <div className="row-text">
                          <div className="row-title">
                            {connection.title}
                          </div>
                          <div className="row-sub">
                            {connection.direction === 'outgoing' ? (
                              <span>Esta nota → {connection.title}</span>
                            ) : (
                              <span>{connection.title} → Esta nota</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteConnection(connection.id)}
                        className="icon-btn icon-btn-danger"
                        title="Eliminar conexión"
                      >
                        <Icon name="trash" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default ConnectionsSection;
