/**
 * Tests unitaires - Gestion des statuts
 */

describe('Statuts des événements', () => {
  
  const STATUTS = ['en_preparation', 'confirme', 'en_cours', 'termine', 'annule'];
  
  const isValidStatut = (statut) => STATUTS.includes(statut);

  const canTransition = (from, to) => {
    const transitions = {
      'en_preparation': ['confirme', 'annule'],
      'confirme': ['en_cours', 'annule'],
      'en_cours': ['termine', 'annule'],
      'termine': [],
      'annule': []
    };
    return transitions[from]?.includes(to) || false;
  };

  test('devrait valider un statut correct', () => {
    expect(isValidStatut('confirme')).toBe(true);
  });

  test('devrait refuser un statut invalide', () => {
    expect(isValidStatut('invalid')).toBe(false);
  });

  test('devrait permettre en_preparation -> confirme', () => {
    expect(canTransition('en_preparation', 'confirme')).toBe(true);
  });

  test('devrait refuser termine -> en_cours', () => {
    expect(canTransition('termine', 'en_cours')).toBe(false);
  });
});

describe('Statuts des tâches', () => {
  
  const getNextStatut = (current) => {
    const order = { 'a_faire': 'en_cours', 'en_cours': 'termine', 'termine': 'a_faire' };
    return order[current] || null;
  };

  test('devrait passer de a_faire à en_cours', () => {
    expect(getNextStatut('a_faire')).toBe('en_cours');
  });

  test('devrait boucler de termine à a_faire', () => {
    expect(getNextStatut('termine')).toBe('a_faire');
  });
});
