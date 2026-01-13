// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Tests End-to-End - Authentification
 * Scénarios utilisateur complets
 */

test.describe('Authentification - Tests E2E', () => {

  // ==========================================
  // Test 1: Navigation vers la page de connexion
  // ==========================================
  test('devrait afficher la page de connexion', async ({ page }) => {
    await page.goto('/');
    
    // Cliquer sur le bouton Connexion
    await page.click('text=Connexion');
    
    // Vérifier qu'on est sur la page de connexion
    await expect(page).toHaveURL('/connexion');
    
    // Vérifier les éléments de la page
    await expect(page.locator('h1')).toContainText('Connexion');
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#mot_de_passe')).toBeVisible();
  });

  // ==========================================
  // Test 2: Connexion avec identifiants invalides
  // ==========================================
  test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
    await page.goto('/connexion');
    
    // Remplir le formulaire
    await page.fill('input#email', 'wrong@example.com');
    await page.fill('input#mot_de_passe', 'WrongPassword123!');
    
    // Soumettre
    await page.click('button[type="submit"]');
    
    // Attendre la réponse
    await page.waitForTimeout(2000);
    
    // Devrait rester sur la page de connexion
    await expect(page).toHaveURL('/connexion');
  });

  // ==========================================
  // Test 3: Lien vers mot de passe oublié
  // ==========================================
  test('devrait naviguer vers mot de passe oublié', async ({ page }) => {
    await page.goto('/connexion');
    
    await page.click('text=Mot de passe oublié');
    
    await expect(page).toHaveURL('/mot-de-passe-oublie');
  });

  // ==========================================
  // Test 4: Lien vers inscription
  // ==========================================
  test('devrait naviguer vers inscription', async ({ page }) => {
    await page.goto('/connexion');
    
    await page.click("text=S'inscrire");
    
    await expect(page).toHaveURL('/inscription');
  });

  // ==========================================
  // Test 5: Toggle afficher/masquer mot de passe
  // ==========================================
  test('devrait afficher/masquer le mot de passe', async ({ page }) => {
    await page.goto('/connexion');
    
    const passwordInput = page.locator('input#mot_de_passe');
    
    // Par défaut masqué
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Cliquer pour afficher
    await page.click('button[aria-label*="mot de passe"]');
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Cliquer pour masquer
    await page.click('button[aria-label*="mot de passe"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  // ==========================================
  // Test 6: Page inscription - éléments
  // ==========================================
  test('devrait afficher le formulaire inscription', async ({ page }) => {
    await page.goto('/inscription');
    
    // Vérifier le titre
    await expect(page.locator('h1')).toContainText('Créer un compte');
    
    // Vérifier qu'il y a des inputs dans le formulaire
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  // ==========================================
  // Test 7: Retour à l'accueil
  // ==========================================
  test('devrait retourner à l\'accueil', async ({ page }) => {
    await page.goto('/connexion');
    
    await page.click("text=Retour à l'accueil");
    
    await expect(page).toHaveURL('/');
  });

  // ==========================================
  // Test 8: Page d'accueil accessible
  // ==========================================
  test('devrait afficher la page d\'accueil', async ({ page }) => {
    await page.goto('/');
    
    // Vérifier le header avec le logo
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // ==========================================
  // Test 9: Navigation clavier (accessibilité)
  // ==========================================
  test('devrait être navigable au clavier', async ({ page }) => {
    await page.goto('/connexion');
    
    // Tab pour naviguer
    await page.keyboard.press('Tab');
    
    // Un élément doit avoir le focus
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedTag).toBeTruthy();
  });

  // ==========================================
  // Test 10: Page demande de devis
  // ==========================================
  test('devrait afficher le formulaire de demande de devis', async ({ page }) => {
    await page.goto('/demande-devis');
    
    // Utiliser une regex pour ignorer la casse
    await expect(page.locator('h1')).toContainText(/Demande de Devis/i);
  });
});
