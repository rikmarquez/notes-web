import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail, validatePassword, getErrorMessage } from '../../utils/helpers';

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

  return (
    <div className="card w-full max-w-md mx-auto">
      <div className="card-header">
        <h2 className="text-2xl font-bold text-center">Crear Cuenta</h2>
        <p className="text-gray-600 text-center mt-2">
          Únete y comienza a organizar tu conocimiento
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
              Email *
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
            <label htmlFor="name" className="form-label">
              Nombre (opcional)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Tu nombre"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'border-red-500' : ''}`}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${errors.confirmPassword ? 'border-red-500' : ''}`}
              placeholder="Repite tu contraseña"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
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
                Creando cuenta...
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </button>
        </form>
      </div>

      <div className="card-footer">
        <p className="text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={loading}
          >
            Inicia sesión aquí
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;