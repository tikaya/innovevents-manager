/**
 * Tests unitaires - Utilitaires
 */

describe('Calcul des montants TVA', () => {
  
  const calculateMontants = (montantHT, tauxTVA = 20) => {
    if (montantHT === null || montantHT === undefined || montantHT < 0) return null;
    const tva = montantHT * (tauxTVA / 100);
    const ttc = montantHT + tva;
    return {
      ht: parseFloat(montantHT.toFixed(2)),
      tva: parseFloat(tva.toFixed(2)),
      ttc: parseFloat(ttc.toFixed(2))
    };
  };

  test('devrait calculer correctement avec TVA 20%', () => {
    const result = calculateMontants(100);
    expect(result.ht).toBe(100);
    expect(result.tva).toBe(20);
    expect(result.ttc).toBe(120);
  });

  test('devrait calculer correctement avec TVA 10%', () => {
    const result = calculateMontants(100, 10);
    expect(result.ttc).toBe(110);
  });

  test('devrait retourner null pour montant négatif', () => {
    expect(calculateMontants(-100)).toBe(null);
  });
});

describe('Génération numéro de devis', () => {
  
  const generateNumeroDevis = (year, sequence) => {
    if (!year || !sequence) return null;
    return `DEV-${year}-${String(sequence).padStart(4, '0')}`;
  };

  test('devrait générer un numéro correct', () => {
    expect(generateNumeroDevis(2024, 1)).toBe('DEV-2024-0001');
  });

  test('devrait gérer les grandes séquences', () => {
    expect(generateNumeroDevis(2024, 9999)).toBe('DEV-2024-9999');
  });
});

describe('Vérification des rôles', () => {
  
  const hasAccess = (userRole, allowedRoles) => {
    if (!userRole || !Array.isArray(allowedRoles)) return false;
    return allowedRoles.includes(userRole);
  };

  test('admin devrait avoir accès aux routes admin', () => {
    expect(hasAccess('admin', ['admin'])).toBe(true);
  });

  test('employé ne devrait pas avoir accès aux routes admin only', () => {
    expect(hasAccess('employe', ['admin'])).toBe(false);
  });
});
