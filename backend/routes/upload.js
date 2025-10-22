const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// POST /api/upload/profile-photo - Upload de foto de perfil (base64)
router.post('/profile-photo', async (req, res) => {
  try {
    const { photoBase64 } = req.body;

    if (!photoBase64) {
      return res.status(400).json({ 
        error: 'Foto não fornecida',
        message: 'Envie a imagem em base64' 
      });
    }

    // Validar se é base64 válido
    if (!photoBase64.startsWith('data:image/')) {
      return res.status(400).json({ 
        error: 'Formato inválido',
        message: 'A foto deve estar em formato base64 (data:image/...)' 
      });
    }

    // Validar tamanho (máximo 5MB)
    const sizeInBytes = (photoBase64.length * 3) / 4;
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (sizeInBytes > maxSize) {
      return res.status(400).json({ 
        error: 'Arquivo muito grande',
        message: 'A foto deve ter no máximo 5MB' 
      });
    }

    // Atualizar foto do usuário no banco
    const result = await pool.query(
      'UPDATE users SET photo_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, nome, email, photo_url',
      [photoBase64, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    return res.json({
      message: 'Foto atualizada com sucesso!',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    return res.status(500).json({ 
      error: 'Erro ao fazer upload',
      message: 'Erro interno do servidor' 
    });
  }
});

// DELETE /api/upload/profile-photo - Remover foto de perfil
router.delete('/profile-photo', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE users SET photo_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, nome, email, photo_url',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    return res.json({
      message: 'Foto removida com sucesso!',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Erro ao remover foto:', error);
    return res.status(500).json({ 
      error: 'Erro ao remover foto',
      message: 'Erro interno do servidor' 
    });
  }
});

module.exports = router;
