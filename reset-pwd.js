const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  database: 'innovevents',
  host: 'localhost'
});

const hash = bcrypt.hashSync('Client123', 10);

pool.query(
  "UPDATE utilisateurs SET mot_de_passe = $1 WHERE email = 'tikaya1999+client@gmail.com'",
  [hash]
).then(() => {
  console.log('Mot de passe mis à jour!');
  pool.end();
}).catch(err => {
  console.error('Erreur:', err);
  pool.end();
});
