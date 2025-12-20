// src/components/profile/SocialLinks.jsx
import React from "react";
import "../../styles/components/SocialLinks.css";

const SocialLinks = ({
  socials = {},
  onChange,
  companyMode = false,
  editable = true,
}) => {
  const handleChange = (platform, value) => {
    if (onChange) {
      const updatedSocials = {
        ...socials,
        [platform]: value,
      };
      onChange(updatedSocials);
    }
  };

  const socialPlatforms = companyMode
    ? [
        {
          key: "facebook",
          label: "Facebook",
          icon: "📘",
          placeholder: "https://facebook.com/suaempresa",
        },
        {
          key: "instagram",
          label: "Instagram",
          icon: "📷",
          placeholder: "https://instagram.com/suaempresa",
        },
        {
          key: "linkedin",
          label: "LinkedIn",
          icon: "💼",
          placeholder: "https://linkedin.com/company/suaempresa",
        },
        {
          key: "twitter",
          label: "Twitter/X",
          icon: "🐦",
          placeholder: "https://twitter.com/suaempresa",
        },
        {
          key: "youtube",
          label: "YouTube",
          icon: "🎥",
          placeholder: "https://youtube.com/c/suaempresa",
        },
        {
          key: "website",
          label: "Website",
          icon: "🌐",
          placeholder: "https://suaempresa.com",
        },
      ]
    : [
        {
          key: "linkedin",
          label: "LinkedIn",
          icon: "💼",
          placeholder: "https://linkedin.com/in/seunome",
        },
        {
          key: "github",
          label: "GitHub",
          icon: "💻",
          placeholder: "https://github.com/seunome",
        },
        {
          key: "portfolio",
          label: "Portfólio",
          icon: "🎨",
          placeholder: "https://seuportfolio.com",
        },
        {
          key: "twitter",
          label: "Twitter/X",
          icon: "🐦",
          placeholder: "https://twitter.com/seunome",
        },
        {
          key: "instagram",
          label: "Instagram",
          icon: "📷",
          placeholder: "https://instagram.com/seunome",
        },
        {
          key: "facebook",
          label: "Facebook",
          icon: "📘",
          placeholder: "https://facebook.com/seunome",
        },
      ];

  return (
    <div className="social-links">
      <div className="social-grid">
        {socialPlatforms.map((platform) => (
          <div key={platform.key} className="social-input-group">
            <div className="social-label">
              <span className="social-icon">{platform.icon}</span>
              <span className="social-name">{platform.label}</span>
            </div>

            {editable ? (
              <input
                type="url"
                value={socials[platform.key] || ""}
                onChange={(e) => handleChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
                className="social-input"
              />
            ) : (
              <div className="social-display">
                {socials[platform.key] ? (
                  <a
                    href={socials[platform.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-link"
                  >
                    {socials[platform.key]}
                  </a>
                ) : (
                  <span className="social-empty">Não informado</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {editable && (
        <div className="social-hint">
          <p>
            💡 Preencha apenas as redes sociais que você deseja compartilhar
          </p>
        </div>
      )}

      {!editable && Object.keys(socials).some((key) => socials[key]) && (
        <div className="social-badges">
          <h4>Redes Sociais:</h4>
          <div className="badges-container">
            {Object.entries(socials)
              .filter(([_, value]) => value)
              .map(([platform, url]) => {
                const platformInfo = socialPlatforms.find(
                  (p) => p.key === platform
                );
                return (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-badge"
                  >
                    <span className="badge-icon">
                      {platformInfo?.icon || "🔗"}
                    </span>
                    <span className="badge-label">
                      {platformInfo?.label || platform}
                    </span>
                  </a>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

// Export default - IMPORTANTE para o import no Edit.jsx
export default SocialLinks;

// Named export também (opcional)
export { SocialLinks };
