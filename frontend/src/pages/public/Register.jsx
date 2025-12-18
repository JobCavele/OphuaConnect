import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('personal');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    phone: '',
    acceptTerms: false
  });
  
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    if (step === 1 && !userType) {
      alert('Selecione um tipo de conta');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }

    if (!formData.acceptTerms) {
      alert('Você deve aceitar os termos de uso');
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      userType: userType
    };

    if (userType === 'company_admin') {
      userData.companyData = {
        name: formData.companyName
      };
    }

    const result = await register(userData);
    
    if (result.success) {
      // Redirecionar baseado no tipo de usuário
      switch (userType) {
        case 'company_admin':
          navigate('/company/dashboard');
          break;
        case 'personal':
          navigate('/personal/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen gradient-blue py-12 px-4">
      <div className="container max-w-2xl">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-dark">Criar Conta</h1>
            <p className="text-gray mt-2">Junte-se ao OphuaConnect</p>
            
            {/* Progresso */}
            <div className="mt-6 flex items-center justify-center">
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= num ? 'bg-primary text-white' : 'bg-gray-light text-gray'}`}>
                    {num}
                  </div>
                  {num < 3 && (
                    <div className={`w-16 h-1 ${step > num ? 'bg-primary' : 'bg-gray-light'}`}></div>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray">
              {step === 1 && 'Tipo de conta'}
              {step === 2 && 'Informações básicas'}
              {step === 3 && 'Criar conta'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* PASSO 1: Tipo de conta */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-dark">Qual tipo de conta você precisa?</h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div 
                    className={`p-6 border rounded-lg cursor-pointer transition-all ${userType === 'personal' ? 'border-primary bg-primary-light' : 'border-gray-light hover:border-primary'}`}
                    onClick={() => setUserType('personal')}
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full mb-3">
                        👤
                      </div>
                      <h3 className="font-semibold text-dark mb-2">Perfil Pessoal</h3>
                      <p className="text-sm text-gray">
                        Para profissionais autônomos, freelancers e pessoas físicas
                      </p>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-6 border rounded-lg cursor-pointer transition-all ${userType === 'company_admin' ? 'border-primary bg-primary-light' : 'border-gray-light hover:border-primary'}`}
                    onClick={() => setUserType('company_admin')}
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-primary text-white rounded-full mb-3">
                        🏢
                      </div>
                      <h3 className="font-semibold text-dark mb-2">Empresa</h3>
                      <p className="text-sm text-gray">
                        Para empresas que desejam gerenciar funcionários e criar perfis corporativos
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button type="button" onClick={nextStep} className="btn btn-primary">
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 2: Informações básicas */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-dark">Informações básicas</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input"
                      placeholder="João Silva"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="seu@email.com"
                    />
                  </div>
                  
                  {userType === 'company_admin' && (
                    <div>
                      <label className="block text-sm font-medium text-dark mb-1">
                        Nome da empresa *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
                        className="input"
                        placeholder="Minha Empresa Ltda"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Telefone (opcional)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="btn btn-outline">
                    Voltar
                  </button>
                  <button type="button" onClick={nextStep} className="btn btn-primary">
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* PASSO 3: Senha e termos */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-dark">Criar senha</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Senha *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="input"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <p className="text-xs text-gray mt-1">
                      Use letras, números e caracteres especiais
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark mb-1">
                      Confirmar senha *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input"
                      placeholder="Digite a senha novamente"
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      name="acceptTerms"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="mt-1 w-4 h-4 text-primary border-gray rounded"
                    />
                    <label htmlFor="terms" className="ml-2 text-sm text-gray">
                      Concordo com os{' '}
                      <Link to="/terms" className="text-primary hover:underline">
                        Termos de Serviço
                      </Link>{' '}
                      e{' '}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Política de Privacidade
                      </Link>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button type="button" onClick={prevStep} className="btn btn-outline">
                    Voltar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Criando conta...' : 'Criar conta'}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;