import { useState, FormEvent } from 'react';
import { authAPI } from '../../services/api';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const response = await authAPI.login(email, password);

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Đăng nhập</h1>
            <p>Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="input-text"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu:</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-text"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
          </div>

          <div className="demo-accounts">
            <p className="demo-title">🔑 Tài khoản demo:</p>
            <div className="demo-list">
              <div className="demo-item">
                <strong>USER:</strong> user@mmo.vn / password123
              </div>
              <div className="demo-item">
                <strong>SELLER:</strong> seller@mmo.vn / password123
              </div>
              <div className="demo-item">
                <strong>ADMIN:</strong> admin@mmo.vn / password123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
