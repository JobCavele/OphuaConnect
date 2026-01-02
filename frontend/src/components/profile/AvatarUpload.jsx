// src/components/profile/AvatarUpload.jsx
import React, { useState } from "react";
import "../../styles/components/AvatarUpload.css";

const AvatarUpload = ({ current = "", onChange, onThemeExtracted }) => {
  const [preview, setPreview] = useState(current);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    onChange(file);
    const url = URL.createObjectURL(file);
    setPreview(url);

    // extrai cor
    const img = new Image();
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      const primary = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)}`;
      onThemeExtracted({ primary });
    };
  };

  return (
    <div className="avatar-upload-modern">
      <div className="avatar-wrapper">
        <img
          className="avatar-image"
          src={preview || current || "/placeholder-logo.png"}
          alt="Logo"
        />
        <div className="avatar-overlay">
          <span className="avatar-icon">📷</span>
        </div>
      </div>
      <label className="avatar-button">
        Alterar logotipo
        <input type="file" accept="image/*" hidden onChange={handleFile} />
      </label>
    </div>
  );
};

export default AvatarUpload;
