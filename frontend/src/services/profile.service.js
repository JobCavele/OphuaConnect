import api from './api';

export const profileService = {
  // Criar/atualizar perfil pessoal
  async createPersonalProfile(profileData) {
    return api.post('/api/profiles/personal', profileData);
  },

  // Obter perfil por slug (público)
  async getProfileBySlug(slug) {
    return api.get(`/api/profiles/${slug}`);
  },

  // Atualizar perfil pessoal
  async updatePersonalProfile(id, profileData) {
    return api.put(`/api/profiles/personal/${id}`, profileData);
  },

  // Upload de imagem/logo
  async uploadImage(formData) {
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Gerar QR Code
  async generateQRCode(profileId) {
    return api.post(`/api/profiles/${profileId}/qrcode`);
  }
};