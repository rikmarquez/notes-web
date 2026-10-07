import React, { useState } from 'react';
import notesService from '../../services/notesService';
import { getErrorMessage } from '../../utils/helpers';
import Icon from '../UI/Icon';

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
    <div>
      {/* Format Example */}
      <div className="form-group">
        <p className="form-label">Formato JSON esperado</p>
        <pre className="code-sample">
{`{
  "notes": [
    {
      "title": "Título de la nota",
      "summary": "TAG o descripción breve",
      "content": "Contenido completo de la nota..."
    }
  ]
}`}
        </pre>
      </div>

      {/* File Upload Area */}
      <div
        className={`drop-zone form-group ${dragActive ? 'is-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {file ? (
          <>
            <Icon name="file" size={28} />
            <p>{file.name}</p>
            <span>{(file.size / 1024).toFixed(1)} KB</span>
            <button
              onClick={resetForm}
              className="btn btn-outline btn-sm"
            >
              Seleccionar otro archivo
            </button>
          </>
        ) : (
          <>
            <Icon name="upload" size={28} />
            <p>Arrastra tu archivo JSON aquí</p>
            <span>Solo archivos .json</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileInput}
              className="visually-hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="btn btn-outline btn-sm"
            >
              Seleccionar archivo
            </label>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <Icon name="alert" />
          {error}
        </div>
      )}

      {/* Import Button */}
      {file && !result && (
        <button
          onClick={handleImport}
          disabled={importing}
          className="btn btn-primary btn-block"
        >
          {importing ? (
            <>
              <span className="spinner"></span>
              Importando...
            </>
          ) : (
            <>
              <Icon name="upload" />
              Importar notas
            </>
          )}
        </button>
      )}

      {/* Results */}
      {result && (
        <div>
          <div className="alert alert-success">
            <Icon name="check" />
            <div>
              <strong>Importación completada.</strong>{' '}
              {result.imported} notas importadas
              {result.failed > 0 && `, ${result.failed} fallaron`}
            </div>
          </div>

          {/* Error Details */}
          {result.errors && result.errors.length > 0 && (
            <details className="panel form-group">
              <summary className="form-label" style={{ cursor: 'pointer', marginBottom: 0 }}>
                Ver errores ({result.errors.length})
              </summary>
              {result.errors.slice(0, 10).map((err, index) => (
                <p key={index} className="form-help">
                  <strong>Nota {err.note}:</strong> {err.title} - {err.error}
                </p>
              ))}
              {result.errors.length > 10 && (
                <p className="form-help">
                  ... y {result.errors.length - 10} errores más
                </p>
              )}
            </details>
          )}

          <button
            onClick={resetForm}
            className="btn btn-outline btn-block"
          >
            Importar más notas
          </button>
        </div>
      )}
    </div>
  );
};

export default ImportNotes;
