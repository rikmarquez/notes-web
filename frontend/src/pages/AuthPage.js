import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📝 Notes Web
          </h1>
          <p className="text-lg text-gray-600">
            Tu sistema personal de gestión de conocimiento
          </p>
        </div>

        {/* Auth Forms */}
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* Features */}
        <div className="mt-12 text-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Características principales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">🔍</span>
              <span>Búsqueda inteligente</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">🏷️</span>
              <span>Sistema de tags</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl mb-2">🔗</span>
              <span>Conexiones entre ideas</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;