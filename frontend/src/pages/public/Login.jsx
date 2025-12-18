import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  // Verificar status da API
  const checkApiStatus = async () => {
    try {
      const health = await authService.checkHealth();
      setApiStatus({ status: 'online', message: 'API conectada' });
    } catch (err) {
      setApiStatus({ status: 'offline', message: 'API desconectada' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    const result = await login(email, password);
    
    if (result.success) {
      // Redirecionar baseado no role
      const userRole = result.user.role;
      
      switch (userRole) {
        case 'SUPER_ADMIN':
          navigate('/admin/dashboard');
          break;
        case 'COMPANY_ADMIN':
          navigate('/company/dashboard');
          break;
        case 'PERSONAL':
          navigate('/personal/dashboard');
          break;
        case 'EMPLOYEE':
          navigate('/employee/dashboard');
          break;
        default:
          navigate(from);
      }
    }
  };

  // Testar conexão com API
  useState(() => {
    checkApiStatus();
  }, []);

  return (
    <div className="min-h-screen gradient-blue flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-xl mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-dark">OphuaConnect</h1>
          <p className="text-gray mt-2">Entre na sua conta</p>
        </div>

        {/* Status da API */}
        {apiStatus && (
          <div className={`mb-6 p-3 rounded ${apiStatus.status === 'online' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${apiStatus.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm font-medium">{apiStatus.message}</span>
            </div>
            {apiStatus.status === 'offline' && (
              <p className="text-xs mt-1">
                Verifique se o backend está rodando em http://localhost:5000
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-dark mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-primary border-gray rounded"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray">
                Lembrar-me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu a senha?
            </Link>
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Entrar
          </button>
        </form>

        <div className="mt-8 pt-6 border-t">
          <p className="text-center text-gray text-sm">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>
        </div>

        {/* Credenciais de teste */}
        <div className="mt-6 p-3 bg-gray-light rounded text-xs text-gray">
          <p className="font-medium mb-1">Para teste:</p>
          <p>Email: admin@ophuaconnect.com</p>
          <p>Senha: Admin123!</p>
          <p className="mt-1 text-xs">
            <button 
              onClick={() => {
                setEmail('admin@ophuaconnect.com');
                setPassword('Admin123!');
              }}
              className="text-primary hover:underline"
            >
              Preencher automaticamente
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;