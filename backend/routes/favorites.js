const express = require('express');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// GET /api/favorites - Buscar favoritos do usuário
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );

    return res.json({ favorites: result.rows });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar favoritos' 
    });
  }
});

// POST /api/favorites - Adicionar favorito
router.post('/', async (req, res) => {
  try {
    const { book_slug, chapter_id, paragraph_index, paragraph_text } = req.body;

    if (!book_slug || !chapter_id || paragraph_index === undefined || !paragraph_text) {
      return res.status(400).json({ 
        error: 'Dados incompletos' 
      });
    }

    const result = await pool.query(
      `INSERT INTO user_favorites (user_id, book_slug, chapter_id, paragraph_index, paragraph_text)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, book_slug, chapter_id, paragraph_index) DO NOTHING
       RETURNING *`,
      [req.userId, book_slug, chapter_id, paragraph_index, paragraph_text]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ 
        message: 'Favorito já existe' 
      });
    }

    return res.status(201).json({ 
      message: 'Favorito adicionado',
      favorite: result.rows[0] 
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    return res.status(500).json({ 
      error: 'Erro ao adicionar favorito' 
    });
  }
});

// DELETE /api/favorites/:id - Remover favorito
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM user_favorites WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Favorito não encontrado' 
      });
    }

    return res.json({ 
      message: 'Favorito removido' 
    });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    return res.status(500).json({ 
      error: 'Erro ao remover favorito' 
    });
  }
});

// DELETE /api/favorites - Limpar todos os favoritos
router.delete('/', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM user_favorites WHERE user_id = $1',
      [req.userId]
    );

    return res.json({ 
      message: 'Todos os favoritos foram removidos' 
    });
  } catch (error) {
    console.error('Erro ao limpar favoritos:', error);
    return res.status(500).json({ 
      error: 'Erro ao limpar favoritos' 
    });
  }
});

module.exports = router;
