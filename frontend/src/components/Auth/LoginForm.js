import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, getErrorMessage } from '../../utils/helpers';

const LoginForm = ({ onSwitchToRegister }) => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  return (
    <div className="card w-full max-w-md mx-auto">
      <div className="card-header">
        <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>
        <p className="text-gray-600 text-center mt-2">
          Accede a tu sistema de gestión de conocimiento
        </p>
      </div>

      <div className="card-body">
        {apiError && (
          <div className="alert alert-error">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'border-red-500' : ''}`}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Tu contraseña"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="spinner"></div>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>
      </div>

      <div className="card-footer">
        <p className="text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={loading}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;