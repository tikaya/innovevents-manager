/**
 * Tests unitaires - Validation
 */

describe('Validation du mot de passe', () => {
  
  const validatePassword = (password) => {
    const errors = [];
    
    if (!password || password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  test('devrait accepter un mot de passe valide', () => {
    const result = validatePassword('Admin123!');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test('devrait refuser un mot de passe trop court', () => {
    const result = validatePassword('Ab1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
  });

  test('devrait refuser un mot de passe sans majuscule', () => {
    const result = validatePassword('admin123!');
    expect(result.isValid).toBe(false);
  });

  test('devrait refuser un mot de passe sans chiffre', () => {
    const result = validatePassword('AdminTest!');
    expect(result.isValid).toBe(false);
  });

  test('devrait refuser un mot de passe sans caractère spécial', () => {
    const result = validatePassword('Admin1234');
    expect(result.isValid).toBe(false);
  });
});

describe('Validation de l\'email', () => {
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  test('devrait accepter un email valide', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  test('devrait refuser un email sans @', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  test('devrait refuser un email vide', () => {
    expect(validateEmail('')).toBe(false);
  });
});
