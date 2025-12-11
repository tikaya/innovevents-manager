const bcrypt = require('bcryptjs');

async function testPassword() {
    // Remplace par le mot de passe reçu par email
    const passwordFromEmail = '7f2JCRU0o@ad';
    
    // Hash de la BDD
    const hashFromDB = '$2b$10$dN8OCWiU3HY1dhveL7bZOuMrdpQy0ESoevLew6.e.RKx0fKz7Q.pK';
    
    const isValid = await bcrypt.compare(passwordFromEmail, hashFromDB);
    console.log('Match:', isValid);
}

testPassword();