// src/pages/Login.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // Mude esta linha:
    // const result = await login(email, password);
    // Para:
    const result = await login({ email, password }); // Enviar como objeto

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