const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Função para gerar JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// POST /api/auth/register - Cadastrar novo usuário
router.post(
  '/register',
  [
    body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  ],
  async (req, res) => {
    try {
      // Validar dados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: errors.array() 
        });
      }

      const { nome, email, senha } = req.body;

      // Verificar se usuário já existe
      const userExists = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Email já cadastrado',
          message: 'Este email já está em uso' 
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(senha, 10);

      // Inserir usuário no banco
      const result = await pool.query(
        'INSERT INTO users (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email, photo_url, created_at',
        [nome, email.toLowerCase(), hashedPassword]
      );

      const user = result.rows[0];

      // Gerar token JWT
      const token = generateToken(user);

      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso!',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          photo_url: user.photo_url,
        },
        token,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({ 
        error: 'Erro ao cadastrar usuário',
        message: 'Erro interno do servidor' 
      });
    }
  }
);

// POST /api/auth/login - Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req, res) => {
    try {
      // Validar dados
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Dados inválidos', 
          details: errors.array() 
        });
      }

      const { email, senha } = req.body;

      // Buscar usuário
      const result = await pool.query(
        'SELECT id, nome, email, senha, photo_url FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos' 
        });
      }

      const user = result.rows[0];

      // Verificar senha
      const validPassword = await bcrypt.compare(senha, user.senha);

      if (!validPassword) {
        return res.status(401).json({ 
          error: 'Credenciais inválidas',
          message: 'Email ou senha incorretos' 
        });
      }

      // Gerar token JWT
      const token = generateToken(user);

      return res.json({
        message: 'Login realizado com sucesso!',
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          photo_url: user.photo_url,
        },
        token,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ 
        error: 'Erro ao fazer login',
        message: 'Erro interno do servidor' 
      });
    }
  }
);

// GET /api/auth/me - Obter dados do usuário autenticado
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nome, email, photo_url, created_at FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    return res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return res.status(500).json({ 
      error: 'Erro ao buscar dados do usuário' 
    });
  }
});

// POST /api/auth/verify - Verificar se token é válido
router.post('/verify', authMiddleware, (req, res) => {
  return res.json({ 
    valid: true,
    userId: req.userId 
  });
});

module.exports = router;
