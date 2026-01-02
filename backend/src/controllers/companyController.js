// controllers/companyController.js
exports.uploadLogo = (req, res) => {
  // devolve URL pública (ex: /uploads/nome-arquivo.png)
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
};
