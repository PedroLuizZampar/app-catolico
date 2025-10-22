const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Pegar o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Token não fornecido',
        message: 'Por favor, faça login novamente' 
      });
    }

    // Format: "Bearer TOKEN"
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ 
        error: 'Token malformatado',
        message: 'Formato de token inválido' 
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ 
        error: 'Token malformatado',
        message: 'Formato de token inválido' 
      });
    }

    // Verificar token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          error: 'Token inválido',
          message: 'Sessão expirada. Por favor, faça login novamente' 
        });
      }

      // Adicionar informações do usuário na requisição
      req.userId = decoded.id;
      req.userEmail = decoded.email;

      return next();
    });
  } catch (error) {
    return res.status(401).json({ 
      error: 'Falha na autenticação',
      message: 'Erro ao validar token' 
    });
  }
};

module.exports = authMiddleware;
