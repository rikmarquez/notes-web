import React, { useState, useEffect } from 'react';
import ConnectionModal from './ConnectionModal';
import InlineConnectionForm from './InlineConnectionForm';
import connectionsService from '../../services/connectionsService';
import { getConnectionTypeLabel, getErrorMessage } from '../../utils/helpers';

const ConnectionsSection = ({ noteId }) => {
  const [connections, setConnections] = useState({});
  const [connectionTypes, setConnectionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
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
        setShowModal(false);
        setShowInlineForm(false);
        fetchConnections(); // Refresh connections
      } else {
        throw new Error(response.message || 'Error al crear la conexión');
      }
    } catch (error) {
      throw error; // Let the modal handle the error
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
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-800">
            🔗 Ideas Conectadas
          </h2>
        </div>
        <div className="card-body">
          <div className="flex justify-center items-center h-32">
            <div className="spinner"></div>
            <span className="ml-2">Cargando conexiones...</span>
          </div>
        </div>
      </div>
    );
  }

  const hasConnections = Object.keys(connections).length > 0;

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">
              🔗 Ideas Conectadas
            </h2>
            {!showInlineForm && (
              <button
                onClick={() => setShowInlineForm(true)}
                className="btn btn-primary btn-sm"
              >
                + Añadir Conexión
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          {error && (
            <div className="alert alert-error mb-4">
              {error}
              <button 
                onClick={fetchConnections}
                className="btn btn-outline btn-sm ml-4"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Inline Connection Form */}
          {showInlineForm && (
            <div className="mb-4">
              <InlineConnectionForm
                noteId={noteId}
                connectionTypes={connectionTypes}
                onCreateConnection={handleCreateConnection}
                onCancel={() => setShowInlineForm(false)}
              />
            </div>
          )}

          {!hasConnections && !showInlineForm ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No hay conexiones aún
              </h3>
              <p className="text-gray-500 mb-4">
                Conecta esta idea con otras notas para crear una red de conocimiento
              </p>
              <button
                onClick={() => setShowInlineForm(true)}
                className="btn btn-primary"
              >
                Crear primera conexión
              </button>
            </div>
          ) : hasConnections ? (
            <div className="space-y-6">
              {connectionTypes.map(type => {
                const typeConnections = connections[type] || [];
                if (typeConnections.length === 0) return null;

                return (
                  <div key={type} className="border-l-4 border-blue-200 pl-4">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      {getConnectionTypeLabel(type)} ({typeConnections.length})
                    </h3>
                    
                    <div className="space-y-2">
                      {typeConnections.map(connection => (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleNoteClick(connection.noteId)}
                          >
                            <div className="font-medium text-gray-900 hover:text-blue-600">
                              {connection.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {connection.direction === 'outgoing' ? (
                                <span>Esta nota → {connection.title}</span>
                              ) : (
                                <span>{connection.title} → Esta nota</span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteConnection(connection.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Eliminar conexión"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* Connection Modal */}
      {showModal && (
        <ConnectionModal
          noteId={noteId}
          connectionTypes={connectionTypes}
          onCreateConnection={handleCreateConnection}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default ConnectionsSection;