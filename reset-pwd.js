/**
 * Script de réinitialisation de mot de passe
 * Utilise les variables d'environnement du fichier .env
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Utilisation des variables d'environnement
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  host: process.env.POSTGRES_HOST || 'localhost',
  port: process.env.POSTGRES_PORT || 5432
});

async function resetPassword(email, newPassword) {
  if (!email || !newPassword) {
    console.error('Usage: node reset-pwd.js <email> <nouveau_mot_de_passe>');
    process.exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    
    const result = await pool.query(
      "UPDATE utilisateur SET mot_de_passe = $1, doit_changer_mdp = true WHERE email = $2 RETURNING email",
      [hash, email]
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Aucun utilisateur trouvé avec cet email:', email);
    } else {
      console.log('✅ Mot de passe réinitialisé pour:', result.rows[0].email);
      console.log('⚠️  L\'utilisateur devra changer son mot de passe à la prochaine connexion');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    pool.end();
  }
}

// Récupérer les arguments de la ligne de commande
const email = process.argv[2];
const newPassword = process.argv[3];

resetPassword(email, newPassword);
