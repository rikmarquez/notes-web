import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, getErrorMessage } from '../../utils/helpers';
import Icon from '../UI/Icon';

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
    <div>
      <h2 className="auth-title">Iniciar sesión</h2>
      <p className="auth-sub">
        Accede a tu sistema de gestión de conocimiento
      </p>

      {apiError && (
        <div className="alert alert-error">
          <Icon name="alert" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
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
            className={`form-input ${errors.email ? 'is-invalid' : ''}`}
            placeholder="tu@email.com"
            autoComplete="email"
            disabled={loading}
          />
          {errors.email && (
            <p className="form-error">{errors.email}</p>
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
            className={`form-input ${errors.password ? 'is-invalid' : ''}`}
            placeholder="Tu contraseña"
            autoComplete="current-password"
            disabled={loading}
          />
          {errors.password && (
            <p className="form-error">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-block"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Iniciando sesión...
            </>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta?{' '}
        <button
          onClick={onSwitchToRegister}
          className="link-btn"
          disabled={loading}
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  );
};

export default LoginForm;