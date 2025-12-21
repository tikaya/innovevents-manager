const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('Client123!', 10);
console.log('Hash:', hash);
