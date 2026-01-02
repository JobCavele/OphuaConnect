// src/pages/company/Links/Registration.jsx
import React, { useEffect, useState } from "react";
import { useCompanySlug } from "../../../hooks/useCompanySlug";
import QRCodeGenerator from "../../../components/profile/QRCodeGenerator";
import "../../../styles/pages/CompanyLinks.css";

const RegistrationLink = () => {
  const { slug, company } = useCompanySlug();
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (slug) {
      const fullLink = `${window.location.origin}/register/employee/${slug}`;
      setLink(fullLink);
      console.log("🔗 Link gerado:", fullLink);
    }
  }, [slug]);

  const handleCopy = async () => {
    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      // Fallback para navegadores antigos
      const textArea = document.createElement("textarea");
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  if (!user?.company) {
    return (
      <section className="links-page">
        <div className="error-state">
          <h2>⚠️ Empresa não encontrada</h2>
          <p>Não foi possível gerar o link de cadastro.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="links-page">
      <div className="page-header">
        <h1>🔗 Link de Cadastro</h1>
        <p className="subtitle">
          Compartilhe este link para convidar funcionários a se cadastrarem na{" "}
          {user.company.name}
        </p>
      </div>

      <div className="link-container">
        <div className="link-card">
          <h3>📋 Instruções</h3>
          <ul className="instructions">
            <li>1. Copie o link abaixo</li>
            <li>2. Compartilhe com seus funcionários</li>
            <li>3. Eles preenchem o formulário de cadastro</li>
            <li>4. Você aprova os cadastros na página "Funcionários"</li>
          </ul>

          <div className="link-box">
            <div className="link-label">Link de Cadastro:</div>
            <div className="input-group">
              <input
                type="text"
                value={link}
                readOnly
                placeholder="Gerando link..."
                className="link-input"
              />
              <button
                className={`btn ${copied ? "btn-success" : "btn--primary"}`}
                onClick={handleCopy}
                disabled={!link}
              >
                {copied ? "✅ Copiado!" : "📋 Copiar Link"}
              </button>
            </div>
            <p className="link-hint">
              Todos os cadastros feitos por este link serão vinculados à{" "}
              {user.company.name}
            </p>
          </div>

          <div className="qr-section">
            <h3>📱 QR Code</h3>
            <p>Escaneie para acessar o formulário de cadastro</p>
            {link && <QRCodeGenerator value={link} size={200} />}
          </div>

          <div className="usage-tips">
            <h3>💡 Dicas de Uso</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">📧</div>
                <h4>Por E-mail</h4>
                <p>Envie o link no corpo do e-mail de boas-vindas</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">📱</div>
                <h4>Mensagem</h4>
                <p>Compartilhe via WhatsApp ou Telegram</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">📌</div>
                <h4>Intranet</h4>
                <p>Cole em murais digitais ou sites internos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="sidebar-info">
          <div className="info-card">
            <h3>ℹ️ Informações</h3>
            <div className="info-item">
              <strong>Empresa:</strong>
              <span>{user.company.name}</span>
            </div>
            <div className="info-item">
              <strong>Slug:</strong>
              <span>{user.company.slug || "Não definido"}</span>
            </div>
            <div className="info-item">
              <strong>Link Personalizado:</strong>
              <span>{link ? "✅ Ativo" : "❌ Inativo"}</span>
            </div>
          </div>

          <div className="actions-card">
            <h3>⚡ Ações Rápidas</h3>
            <button
              className="btn btn--outline"
              onClick={() => (window.location.href = "/company/employees")}
            >
              👥 Ver Funcionários
            </button>
            <button
              className="btn btn--outline"
              onClick={() => (window.location.href = "/company/dashboard")}
            >
              📊 Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationLink;
