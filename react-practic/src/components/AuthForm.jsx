import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export function AuthForm() {
  const [mode, setMode] = useState('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignIn = mode === 'signIn';

  const toggleMode = () => {
    setMode((prev) => (prev === 'signIn' ? 'signUp' : 'signIn'));
    setError('');
    setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) {
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    const { error: authError } = isSignIn
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: window.location.origin }
})

    if (authError) {
      setError(authError.message);
    }else if (!isSignIn) {
  setMessage('Проверьте почту — там ссылка для подтверждения.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-window layout">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">{isSignIn ? 'Вход' : 'Регистрация'}</h2>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            className="auth-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            disabled={loading}
            required
          />
        </label>

        <label className="auth-field">
          <span>Пароль</span>
          <input
            type="password"
            className="auth-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isSignIn ? 'current-password' : 'new-password'}
            minLength={8}
            disabled={loading}
            required
          />
        </label>

        {error && <p className="message auth-error">{error}</p>}
        {message && <p className="message auth-success">{message}</p>}

        <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
          {loading ? 'Подождите...' : isSignIn ? 'Войти' : 'Зарегистрироваться'}
        </button>

        <button className="btn btn-ghost auth-switch" type="button" onClick={toggleMode} disabled={loading}>
          {isSignIn ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
        </button>
      </form>
    </div>
  );
}
