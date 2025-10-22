const pool = require('./config/database');

async function initDatabase() {
  try {
    console.log('🔧 Iniciando criação das tabelas...');

    // Criar tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tabela "users" criada com sucesso!');

    // Criar índice no email para busca rápida
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    console.log('✅ Índice no email criado!');

    // Criar tabela de favoritos do usuário
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        book_slug VARCHAR(100) NOT NULL,
        chapter_id VARCHAR(50) NOT NULL,
        paragraph_index INTEGER NOT NULL,
        paragraph_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, book_slug, chapter_id, paragraph_index)
      );
    `);

    console.log('✅ Tabela "user_favorites" criada com sucesso!');

    // Criar índice para busca de favoritos por usuário
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
    `);

    console.log('✅ Índice de favoritos criado!');

    console.log('\n🎉 Banco de dados inicializado com sucesso!');
    console.log('👤 Você já pode criar usuários e fazer login.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    process.exit(1);
  }
}

initDatabase();
