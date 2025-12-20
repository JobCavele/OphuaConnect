// src/components/profile/AvatarUpload.jsx
import React, { useState } from "react";
import "../../styles/components/AvatarUpload.css";

const AvatarUpload = ({
  currentImage,
  onImageChange,
  type = "company",
  size = "large",
}) => {
  const [preview, setPreview] = useState(currentImage);
  const [isDragging, setIsDragging] = useState(false);

  const sizes = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 150, height: 150 },
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Por favor, selecione uma imagem");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        // 2MB
        alert("A imagem deve ser menor que 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageChange(null, null);
  };

  const getPlaceholderIcon = () => {
    return type === "company" ? "🏢" : "👤";
  };

  return (
    <div className="avatar-upload">
      <div
        className={`avatar-preview ${size} ${isDragging ? "dragging" : ""}`}
        style={sizes[size]}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById(`avatar-input-${type}`).click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" />
        ) : (
          <div className="avatar-placeholder">
            <span className="placeholder-icon">{getPlaceholderIcon()}</span>
            <span className="placeholder-text">
              {isDragging ? "Solte a imagem aqui" : "Clique para fazer upload"}
            </span>
          </div>
        )}
      </div>

      <input
        id={`avatar-input-${type}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="avatar-input"
      />

      <div className="avatar-actions">
        <label htmlFor={`avatar-input-${type}`} className="btn btn-outline">
          Escolher {type === "company" ? "Logotipo" : "Foto"}
        </label>

        {preview && (
          <button onClick={removeImage} className="btn btn-outline danger">
            Remover
          </button>
        )}
      </div>

      <p className="avatar-hint">
        PNG, JPG ou GIF • Máx. 2MB •{" "}
        {type === "company"
          ? "Recomendado: 500x500px"
          : "Recomendado: 400x400px"}
      </p>

      {type === "company" && preview && (
        <div className="theme-extraction">
          <p className="theme-hint">
            💡 As cores do tema serão extraídas automaticamente do seu logotipo
          </p>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
