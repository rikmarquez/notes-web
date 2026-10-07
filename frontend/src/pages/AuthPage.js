import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import Logo from '../components/UI/Logo';
import Icon from '../components/UI/Icon';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth">
      {/* Brand panel - desktop only */}
      <aside className="auth-brand">
        <Logo size={34} inverse />

        <div>
          <h1 className="auth-headline">
            Tus ideas, organizadas y conectadas.
          </h1>
          <ul className="auth-points">
            <li>
              <Icon name="search" size={20} />
              Búsqueda inteligente
            </li>
            <li>
              <Icon name="tag" size={20} />
              Sistema de tags
            </li>
            <li>
              <Icon name="link" size={20} />
              Conexiones entre ideas
            </li>
          </ul>
        </div>

        <p className="auth-foot">
          Tu sistema personal de gestión de conocimiento
        </p>
      </aside>

      <main className="auth-main">
        <div className="auth-form">
          <Logo size={32} className="auth-logo-mobile" />

          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
