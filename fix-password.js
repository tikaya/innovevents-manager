const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'innovevents',
  password: 'innovevents123', 
  database: 'innovevents_dev',
  host: 'localhost',
  port: 5433
});

async function resetPassword() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('Client123', salt);
  console.log('Hash généré:', hash);
  
  const result = await pool.query(
    "UPDATE utilisateur SET mot_de_passe = $1 WHERE email = 'tikaya1999+client@gmail.com' RETURNING email",
    [hash]
  );
  
  console.log('Mot de passe mis à jour pour:', result.rows[0]?.email);
  pool.end();
}

resetPassword().catch(console.error);
