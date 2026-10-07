import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, getErrorMessage } from '../../utils/helpers';
import Icon from '../UI/Icon';

const RegisterForm = ({ onSwitchToLogin }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
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
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (formData.name && formData.name.length > 255) {
      newErrors.name = 'El nombre no puede exceder 255 caracteres';
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
      const userData = {
        email: formData.email,
        password: formData.password,
        name: formData.name.trim() || undefined
      };
      
      await register(userData);
    } catch (error) {
      setApiError(getErrorMessage(error));
    }
  };

  const fields = [
    { name: 'email', type: 'email', label: 'Email *', placeholder: 'tu@email.com', autoComplete: 'email' },
    { name: 'name', type: 'text', label: 'Nombre (opcional)', placeholder: 'Tu nombre', autoComplete: 'name' },
    { name: 'password', type: 'password', label: 'Contraseña *', placeholder: 'Mínimo 6 caracteres', autoComplete: 'new-password' },
    { name: 'confirmPassword', type: 'password', label: 'Confirmar contraseña *', placeholder: 'Repite tu contraseña', autoComplete: 'new-password' }
  ];

  return (
    <div>
      <h2 className="auth-title">Crear cuenta</h2>
      <p className="auth-sub">
        Únete y comienza a organizar tu conocimiento
      </p>

      {apiError && (
        <div className="alert alert-error">
          <Icon name="alert" />
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {fields.map((field) => (
          <div className="form-group" key={field.name}>
            <label htmlFor={field.name} className="form-label">
              {field.label}
            </label>
            <input
              type={field.type}
              id={field.name}
              name={field.name}
              value={formData[field.name]}
              onChange={handleChange}
              className={`form-input ${errors[field.name] ? 'is-invalid' : ''}`}
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              disabled={loading}
            />
            {errors[field.name] && (
              <p className="form-error">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-lg btn-block"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creando cuenta...
            </>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={onSwitchToLogin}
          className="link-btn"
          disabled={loading}
        >
          Inicia sesión aquí
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
