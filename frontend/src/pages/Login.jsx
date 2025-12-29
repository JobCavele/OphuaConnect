// src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import "../styles/pages/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // CORRIJA ESTA LINHA - passe um objeto em vez de dois parâmetros
    const result = await login({ email, password }); // ← AQUI ESTÁ O ERRO

    if (result.success) {
      const user = result.user;

      switch (user.role) {
        case "SUPER_ADMIN":
          navigate("/admin");
          break;
        case "COMPANY_ADMIN":
          navigate("/company");
          break;
        case "EMPLOYEE":
        case "PERSONAL":
          navigate("/personal");
          break;
        default:
          navigate("/dashboard");
      }
    } else {
      setError(result.error);
    }
  } catch (err) {
    setError("Erro ao fazer login. Tente novamente.");
    console.error("Login error:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-circle">
            <span className="logo-text">O</span>
          </div>
          <h1>OphuaConnect</h1>
          <p className="subtitle">Conecte empresas e profissionais</p>
        </div>

        <div className="login-card">
          <div className="card-header">
            <h2>Bem-vindo de volta</h2>
            <p>Faça login na sua conta</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="error-message">
                <div className="error-icon">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="input-with-icon">
                <svg
                  className="input-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                />
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Lembrar-me</label>
              </div>
              <a href="#" className="forgot-password">
                Esqueceu sua senha?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <div className="loading-button">
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Entrando...</span>
                </div>
              ) : (
                "Entrar na conta"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Não tem uma conta?{" "}
              <Link to="/register" className="register-link">
                Crie sua conta
              </Link>
            </p>
          </div>
        </div>

        <div className="demo-credentials">
          <p>
            Use <strong>admin@ophuaconnect.com</strong> /{" "}
            <strong>Admin123!</strong> para testar
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
