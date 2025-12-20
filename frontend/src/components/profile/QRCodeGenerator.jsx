// src/components/profile/QRCodeGenerator.jsx
import React, { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import "../../styles/components/QRCodeGenerator.css";

const QRCodeGenerator = ({
  url,
  logo,
  companyName,
  size = 256,
  fgColor = "#000000",
  bgColor = "#ffffff",
}) => {
  const [qrConfig, setQrConfig] = useState({
    size,
    fgColor,
    bgColor,
    includeMargin: true,
    level: "H", // Nível de correção de erro: L, M, Q, H
  });

  const qrRef = useRef();

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector("canvas");
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");

    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${companyName || "ophuaconnect"}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert("Link copiado para a área de transferência!");
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: companyName ? `Cadastre-se na ${companyName}` : "Cadastre-se",
          text: "Use este link para se cadastrar:",
          url: url,
        });
      } catch (error) {
        console.log("Erro ao compartilhar:", error);
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="qr-code-generator">
      <div className="qr-code-preview" ref={qrRef}>
        <QRCodeCanvas
          value={url}
          size={qrConfig.size}
          fgColor={qrConfig.fgColor}
          bgColor={qrConfig.bgColor}
          includeMargin={qrConfig.includeMargin}
          level={qrConfig.level}
          imageSettings={
            logo
              ? {
                  src: logo,
                  x: null,
                  y: null,
                  height: 48,
                  width: 48,
                  excavate: true,
                }
              : undefined
          }
        />

        {companyName && (
          <div className="qr-company-name">
            <p>{companyName}</p>
          </div>
        )}
      </div>

      <div className="qr-actions">
        <button onClick={downloadQRCode} className="btn btn-primary">
          📥 Download PNG
        </button>

        <button onClick={copyLink} className="btn btn-outline">
          📋 Copiar Link
        </button>

        <button onClick={shareQR} className="btn btn-outline">
          ↗️ Compartilhar
        </button>
      </div>

      <div className="qr-customization">
        <h4>Personalizar QR Code</h4>

        <div className="color-pickers">
          <div className="color-picker">
            <label>Cor do QR Code</label>
            <input
              type="color"
              value={qrConfig.fgColor}
              onChange={(e) =>
                setQrConfig({ ...qrConfig, fgColor: e.target.value })
              }
            />
          </div>

          <div className="color-picker">
            <label>Cor de Fundo</label>
            <input
              type="color"
              value={qrConfig.bgColor}
              onChange={(e) =>
                setQrConfig({ ...qrConfig, bgColor: e.target.value })
              }
            />
          </div>
        </div>

        <div className="qr-size-control">
          <label>Tamanho: {qrConfig.size}px</label>
          <input
            type="range"
            min="128"
            max="512"
            step="32"
            value={qrConfig.size}
            onChange={(e) =>
              setQrConfig({ ...qrConfig, size: parseInt(e.target.value) })
            }
          />
        </div>
      </div>

      <div className="qr-instructions">
        <h4>📋 Como usar:</h4>
        <ol>
          <li>Baixe o QR Code ou copie o link</li>
          <li>Compartilhe com seus funcionários</li>
          <li>Eles podem escanear ou clicar no link para se cadastrar</li>
          <li>Aprove as solicitações na seção "Aprovações"</li>
        </ol>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
