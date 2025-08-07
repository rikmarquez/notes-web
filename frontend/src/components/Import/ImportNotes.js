import React, { useState } from 'react';
import notesService from '../../services/notesService';
import { getErrorMessage } from '../../utils/helpers';

const ImportNotes = ({ onImportComplete }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'application/json') {
      setFile(selectedFile);
      setError('');
      setResult(null);
    } else {
      setError('Por favor selecciona un archivo JSON válido');
      setFile(null);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    handleFileSelect(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      setError('');
      setResult(null);

      // Read file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            resolve(jsonData);
          } catch (error) {
            reject(new Error('El archivo JSON no es válido'));
          }
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsText(file);
      });

      // Validate structure
      if (!fileContent.notes || !Array.isArray(fileContent.notes)) {
        throw new Error('El archivo debe tener un campo "notes" con un array de notas');
      }

      // Import notes
      const response = await notesService.importNotes(fileContent.notes);
      
      if (response.success) {
        setResult(response.data);
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        setError(response.message);
      }

    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="text-xl font-semibold text-gray-900">
          📥 Importar Notas
        </h2>
        <p className="text-gray-600">
          Importa tus notas desde un archivo JSON
        </p>
      </div>

      <div className="card-body space-y-6">
        {/* Format Example */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Formato JSON esperado:</h3>
          <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
{`{
  "notes": [
    {
      "title": "Título de la nota",
      "summary": "TAG o descripción breve", 
      "content": "Contenido completo de la nota..."
    },
    {
      "title": "Otra nota",
      "summary": "Otro tag",
      "content": "Más contenido..."
    }
  ]
}`}
          </pre>
        </div>

        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : file 
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-2">
              <div className="text-green-600 text-4xl">✅</div>
              <p className="text-green-700 font-medium">{file.name}</p>
              <p className="text-gray-600 text-sm">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <button
                onClick={resetForm}
                className="btn btn-outline btn-sm"
              >
                Seleccionar otro archivo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-400 text-4xl">📁</div>
              <div>
                <p className="text-gray-600 mb-2">
                  Arrastra tu archivo JSON aquí o haz clic para seleccionar
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="btn btn-outline cursor-pointer"
                >
                  Seleccionar archivo JSON
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Solo archivos .json
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {/* Import Button */}
        {file && !result && (
          <div className="text-center">
            <button
              onClick={handleImport}
              disabled={importing}
              className="btn btn-primary"
            >
              {importing ? (
                <span className="flex items-center gap-2">
                  <div className="spinner"></div>
                  Importando...
                </span>
              ) : (
                '📥 Importar Notas'
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="alert alert-success">
              <div className="font-medium">¡Importación completada!</div>
              <div className="text-sm mt-1">
                ✅ {result.imported} notas importadas exitosamente
                {result.failed > 0 && (
                  <span className="text-red-600">
                    <br />❌ {result.failed} notas fallaron
                  </span>
                )}
              </div>
            </div>

            {/* Error Details */}
            {result.errors && result.errors.length > 0 && (
              <details className="bg-red-50 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-red-800">
                  Ver errores ({result.errors.length})
                </summary>
                <div className="mt-3 space-y-2">
                  {result.errors.slice(0, 10).map((err, index) => (
                    <div key={index} className="text-sm text-red-700">
                      <strong>Nota {err.note}:</strong> {err.title} - {err.error}
                    </div>
                  ))}
                  {result.errors.length > 10 && (
                    <p className="text-sm text-red-600 italic">
                      ... y {result.errors.length - 10} errores más
                    </p>
                  )}
                </div>
              </details>
            )}

            <div className="text-center">
              <button
                onClick={resetForm}
                className="btn btn-outline"
              >
                Importar más notas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportNotes;