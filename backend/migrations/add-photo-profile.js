const pool = require('../config/database');

async function addPhotoProfile() {
  try {
    console.log('🔧 Adicionando coluna photo_url à tabela users...');

    // Adicionar coluna photo_url se não existir
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS photo_url TEXT;
    `);

    console.log('✅ Coluna photo_url adicionada com sucesso!');

    // Verificar estrutura da tabela
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);

    console.log('\n📋 Estrutura da tabela users:');
    result.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });

    console.log('\n🎉 Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

addPhotoProfile();
