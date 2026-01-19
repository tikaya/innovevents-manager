/**
 * ============================================
 * INNOV'EVENTS - Script d'initialisation complet
 * ============================================
 * 
 * Ce script:
 * 1. Supprime les tables existantes
 * 2. Crée le schéma (tables + index)
 * 3. Insère les données de test avec mots de passe hashés
 * 
 * Usage:
 *   node database/init-db.js                    # Utilise les variables d'environnement
 *   node database/init-db.js "postgresql://..." # Utilise l'URL passée en argument
 * 
 * ============================================
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// ============================================
// CONFIGURATION
// ============================================
const DEFAULT_PASSWORD = 'Innovevents2024!';
const SALT_ROUNDS = 10;

// Récupère l'URL de connexion
const getDatabaseUrl = () => {
    if (process.argv[2]) {
        return process.argv[2];
    }
    
    const host = process.env.POSTGRES_HOST || 'localhost';
    const port = process.env.POSTGRES_PORT || 5432;
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || 'postgres';
    const database = process.env.POSTGRES_DB || 'innovevents_dev';
    
    return `postgresql://${user}:${password}@${host}:${port}/${database}`;
};

const pool = new Pool({
    connectionString: getDatabaseUrl(),
    ssl: process.env.NODE_ENV === 'production' || process.argv[2] ? { rejectUnauthorized: false } : false
});

// ============================================
// SCHEMA SQL
// ============================================
const SCHEMA_SQL = `
-- Suppression des tables
DROP TABLE IF EXISTS avis CASCADE;
DROP TABLE IF EXISTS tache CASCADE;
DROP TABLE IF EXISTS note CASCADE;
DROP TABLE IF EXISTS prestation CASCADE;
DROP TABLE IF EXISTS devis CASCADE;
DROP TABLE IF EXISTS evenement CASCADE;
DROP TABLE IF EXISTS client CASCADE;
DROP TABLE IF EXISTS prospect CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;
DROP TABLE IF EXISTS contact CASCADE;

-- Table utilisateur
CREATE TABLE utilisateur (
    id_utilisateur SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    nom_utilisateur VARCHAR(50) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL,
    statut_utilisateur VARCHAR(20) DEFAULT 'actif',
    doit_changer_mdp BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table prospect
CREATE TABLE prospect (
    id_prospect SERIAL PRIMARY KEY,
    nom_entreprise VARCHAR(100) NOT NULL,
    nom_prospect VARCHAR(50) NOT NULL,
    prenom_prospect VARCHAR(50) NOT NULL,
    email_prospect VARCHAR(100) NOT NULL,
    telephone_prospect VARCHAR(20) NOT NULL,
    lieu_souhaite VARCHAR(150) NOT NULL,
    type_evenement_souhaite VARCHAR(50) NOT NULL,
    date_souhaitee DATE NOT NULL,
    nb_participants INT NOT NULL,
    description_besoin TEXT NOT NULL,
    statut_prospect VARCHAR(20) DEFAULT 'a_contacter',
    message_echec TEXT,
    date_creation_prospect TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table client
CREATE TABLE client (
    id_client SERIAL PRIMARY KEY,
    nom_entreprise_client VARCHAR(100) NOT NULL,
    nom_contact VARCHAR(50) NOT NULL,
    prenom_contact VARCHAR(50) NOT NULL,
    email_client VARCHAR(100) NOT NULL,
    telephone_client VARCHAR(20) NOT NULL,
    adresse_client VARCHAR(200),
    code_postal_client VARCHAR(10),
    ville_client VARCHAR(100),
    date_creation_client TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification_client TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_prospect INT,
    id_utilisateur INT,
    FOREIGN KEY (id_prospect) REFERENCES prospect(id_prospect) ON DELETE SET NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE SET NULL
);

-- Table evenement
CREATE TABLE evenement (
    id_evenement SERIAL PRIMARY KEY,
    nom_evenement VARCHAR(150) NOT NULL,
    date_debut DATE NOT NULL,
    heure_debut VARCHAR(5),
    date_fin DATE NOT NULL,
    heure_fin VARCHAR(5),
    lieu_evenement VARCHAR(200) NOT NULL,
    type_evenement VARCHAR(50),
    theme_evenement VARCHAR(100),
    statut_evenement VARCHAR(20) DEFAULT 'brouillon',
    visible_public BOOLEAN DEFAULT FALSE,
    accord_client_affichage BOOLEAN DEFAULT FALSE,
    image_evenement VARCHAR(255),
    date_creation_evenement TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification_evt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_client INT NOT NULL,
    FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE
);

-- Table devis
CREATE TABLE devis (
    id_devis SERIAL PRIMARY KEY,
    numero_devis VARCHAR(20) NOT NULL UNIQUE,
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    statut_devis VARCHAR(20) DEFAULT 'brouillon',
    motif_modification TEXT,
    chemin_pdf VARCHAR(255),
    date_creation_devis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_envoi_devis TIMESTAMP,
    date_reponse_client TIMESTAMP,
    id_evenement INT NOT NULL,
    FOREIGN KEY (id_evenement) REFERENCES evenement(id_evenement) ON DELETE CASCADE
);

-- Table prestation
CREATE TABLE prestation (
    id_prestation SERIAL PRIMARY KEY,
    libelle_prestation VARCHAR(200) NOT NULL,
    montant_ht_prestation DECIMAL(10,2) NOT NULL,
    id_devis INT NOT NULL,
    FOREIGN KEY (id_devis) REFERENCES devis(id_devis) ON DELETE CASCADE
);

-- Table note
CREATE TABLE note (
    id_note SERIAL PRIMARY KEY,
    contenu_note TEXT NOT NULL,
    est_globale BOOLEAN DEFAULT FALSE,
    date_creation_note TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification_note TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_utilisateur INT NOT NULL,
    id_evenement INT,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_evenement) REFERENCES evenement(id_evenement) ON DELETE CASCADE
);

-- Table tache
CREATE TABLE tache (
    id_tache SERIAL PRIMARY KEY,
    titre_tache VARCHAR(150) NOT NULL,
    description_tache TEXT,
    statut_tache VARCHAR(20) DEFAULT 'a_faire',
    date_echeance DATE,
    date_creation_tache TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_utilisateur INT NOT NULL,
    id_evenement INT NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur) ON DELETE CASCADE,
    FOREIGN KEY (id_evenement) REFERENCES evenement(id_evenement) ON DELETE CASCADE
);

-- Table avis
CREATE TABLE avis (
    id_avis SERIAL PRIMARY KEY,
    note_avis INT NOT NULL CHECK (note_avis >= 1 AND note_avis <= 5),
    commentaire_avis TEXT,
    statut_avis VARCHAR(20) DEFAULT 'en_attente',
    date_creation_avis TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_evenement INT NOT NULL,
    id_client INT NOT NULL,
    FOREIGN KEY (id_evenement) REFERENCES evenement(id_evenement) ON DELETE CASCADE,
    FOREIGN KEY (id_client) REFERENCES client(id_client) ON DELETE CASCADE
);

-- Table contact
CREATE TABLE contact (
    id_contact SERIAL PRIMARY KEY,
    nom_utilisateur_contact VARCHAR(50),
    email_contact VARCHAR(100) NOT NULL,
    titre_contact VARCHAR(150) NOT NULL,
    description_contact TEXT NOT NULL,
    date_envoi_contact TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_role ON utilisateur(role);
CREATE INDEX idx_prospect_statut ON prospect(statut_prospect);
CREATE INDEX idx_client_email ON client(email_client);
CREATE INDEX idx_evenement_statut ON evenement(statut_evenement);
CREATE INDEX idx_evenement_date ON evenement(date_debut);
CREATE INDEX idx_devis_statut ON devis(statut_devis);
CREATE INDEX idx_tache_statut ON tache(statut_tache);
CREATE INDEX idx_avis_statut ON avis(statut_avis);
`;

// ============================================
// FONCTION PRINCIPALE
// ============================================
async function initDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('╔════════════════════════════════════════════╗');
        console.log('║   INNOV\'EVENTS - Initialisation BDD       ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('');
        console.log('📦 Connexion:', getDatabaseUrl().replace(/:[^:@]+@/, ':****@'));
        console.log('');

        // ========================================
        // ETAPE 1: SCHEMA
        // ========================================
        console.log('📋 ÉTAPE 1: Création du schéma...');
        await client.query(SCHEMA_SQL);
        console.log('✅ Tables et index créés');
        console.log('');

        // ========================================
        // ETAPE 2: HASH PASSWORD
        // ========================================
        console.log('🔐 ÉTAPE 2: Hashage du mot de passe...');
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
        console.log('✅ Mot de passe hashé');
        console.log('');

        // ========================================
        // ETAPE 3: DONNEES
        // ========================================
        console.log('🌱 ÉTAPE 3: Insertion des données...');
        
        await client.query('BEGIN');

        // Utilisateurs
        await client.query(`
            INSERT INTO utilisateur (email, mot_de_passe, nom, prenom, nom_utilisateur, role) VALUES
                ('chloe@innovevents.com', $1, 'Durand', 'Chloé', 'chloe_admin', 'admin'),
                ('jose@innovevents.com', $1, 'Martin', 'José', 'jose_employe', 'employe'),
                ('marie@innovevents.com', $1, 'Dupont', 'Marie', 'marie_employe', 'employe'),
                ('pierre.bernard@entreprise.com', $1, 'Bernard', 'Pierre', 'pierre_client', 'client'),
                ('sophie.leroy@startup.fr', $1, 'Leroy', 'Sophie', 'sophie_client', 'client'),
                ('marc.petit@corporate.com', $1, 'Petit', 'Marc', 'marc_client', 'client')
        `, [hashedPassword]);
        console.log('   ✅ 6 utilisateurs');

        // Prospects
        await client.query(`
            INSERT INTO prospect (nom_entreprise, nom_prospect, prenom_prospect, email_prospect, telephone_prospect, lieu_souhaite, type_evenement_souhaite, date_souhaitee, nb_participants, description_besoin, statut_prospect, message_echec) VALUES
                ('Tech Solutions', 'Moreau', 'Julie', 'julie.moreau@techsolutions.fr', '0612345678', 'Paris', 'Seminaire', '2025-03-15', 50, 'Séminaire annuel de notre équipe commerciale avec team building.', 'converti', NULL),
                ('StartUp Nation', 'Lefebvre', 'Thomas', 'thomas@startupnation.io', '0698765432', 'Lyon', 'Conference', '2025-04-20', 150, 'Conférence sur l''innovation et le digital pour nos partenaires.', 'converti', NULL),
                ('Corporate Group', 'Dubois', 'Nathalie', 'n.dubois@corporate.com', '0654321987', 'Marseille', 'Soiree', '2025-05-10', 200, 'Soirée de gala pour les 20 ans de l''entreprise.', 'converti', NULL),
                ('Petit Commerce SARL', 'Girard', 'François', 'fgirard@petitcommerce.fr', '0678901234', 'Bordeaux', 'Seminaire', '2025-06-01', 20, 'Petit séminaire pour notre équipe de 20 personnes.', 'a_contacter', NULL),
                ('Mega Corp', 'Roux', 'Isabelle', 'isabelle.roux@megacorp.com', '0645678901', 'Nice', 'Conference', '2025-02-28', 300, 'Grande conférence internationale.', 'echoue', 'Budget insuffisant pour les prestations demandées.')
        `);
        console.log('   ✅ 5 prospects');

        // Clients
        await client.query(`
            INSERT INTO client (nom_entreprise_client, nom_contact, prenom_contact, email_client, telephone_client, adresse_client, code_postal_client, ville_client, id_prospect, id_utilisateur) VALUES
                ('Tech Solutions', 'Bernard', 'Pierre', 'pierre.bernard@entreprise.com', '0612345678', '15 rue de la Tech', '75001', 'Paris', 1, 4),
                ('StartUp Nation', 'Leroy', 'Sophie', 'sophie.leroy@startup.fr', '0698765432', '42 avenue de l''Innovation', '69001', 'Lyon', 2, 5),
                ('Corporate Group', 'Petit', 'Marc', 'marc.petit@corporate.com', '0654321987', '8 boulevard des Affaires', '13001', 'Marseille', 3, 6)
        `);
        console.log('   ✅ 3 clients');

        // Evenements
        await client.query(`
            INSERT INTO evenement (nom_evenement, date_debut, heure_debut, date_fin, heure_fin, lieu_evenement, type_evenement, theme_evenement, statut_evenement, visible_public, accord_client_affichage, id_client) VALUES
                ('Séminaire Team Building Tech Solutions', '2025-03-15', '09:00', '2025-03-16', '17:00', 'Château de Versailles - Salle des Congrès', 'Seminaire', 'Innovation & Cohésion', 'en_cours', TRUE, TRUE, 1),
                ('Conférence Digital 2025', '2025-04-20', '08:30', '2025-04-20', '18:00', 'Centre de Congrès de Lyon', 'Conference', 'Transformation Digitale', 'accepte', FALSE, FALSE, 2),
                ('Gala 20 ans Corporate Group', '2025-05-10', '19:00', '2025-05-11', '02:00', 'Palais du Pharo, Marseille', 'Soiree', 'Années 2000', 'brouillon', FALSE, FALSE, 3),
                ('Workshop Innovation Q1', '2025-01-20', '14:00', '2025-01-20', '18:00', 'Locaux Tech Solutions, Paris', 'Seminaire', 'Brainstorming', 'termine', TRUE, TRUE, 1)
        `);
        console.log('   ✅ 4 événements');

        // Devis
        await client.query(`
            INSERT INTO devis (numero_devis, taux_tva, statut_devis, motif_modification, chemin_pdf, date_envoi_devis, date_reponse_client, id_evenement) VALUES
                ('DEV-2025-0001', 20.00, 'accepte', NULL, '/devis/DEV-2025-0001.pdf', '2025-01-10 10:00:00', '2025-01-15 14:30:00', 1),
                ('DEV-2025-0002', 20.00, 'etude_client', NULL, '/devis/DEV-2025-0002.pdf', '2025-02-01 09:00:00', NULL, 2),
                ('DEV-2025-0003', 20.00, 'brouillon', NULL, NULL, NULL, NULL, 3),
                ('DEV-2024-0015', 20.00, 'accepte', NULL, '/devis/DEV-2024-0015.pdf', '2024-12-15 11:00:00', '2024-12-18 16:00:00', 4)
        `);
        console.log('   ✅ 4 devis');

        // Prestations
        await client.query(`
            INSERT INTO prestation (libelle_prestation, montant_ht_prestation, id_devis) VALUES
                ('Location salle de conférence (2 jours)', 3500.00, 1),
                ('Traiteur - Déjeuners et pauses café (50 pers.)', 2500.00, 1),
                ('Animation Team Building', 1800.00, 1),
                ('Matériel audiovisuel', 800.00, 1),
                ('Location Centre de Congrès', 5000.00, 2),
                ('Traiteur - Cocktail déjeunatoire (150 pers.)', 4500.00, 2),
                ('Sonorisation et éclairage', 2000.00, 2),
                ('Location Palais du Pharo', 8000.00, 3),
                ('Traiteur - Dîner gastronomique (200 pers.)', 12000.00, 3),
                ('DJ et animation soirée', 2500.00, 3)
        `);
        console.log('   ✅ 10 prestations');

        // Notes
        await client.query(`
            INSERT INTO note (contenu_note, est_globale, id_utilisateur, id_evenement) VALUES
                ('Le client souhaite une décoration aux couleurs de l''entreprise (bleu et blanc).', FALSE, 1, 1),
                ('Prévoir un espace photo booth pour le team building.', FALSE, 2, 1),
                ('Attention : 3 participants sont végétariens, 2 sont allergiques aux fruits de mer.', FALSE, 3, 1),
                ('Rappel : Réunion d''équipe tous les lundis à 9h.', TRUE, 1, NULL),
                ('Le client hésite encore sur le choix du DJ pour la soirée.', FALSE, 1, 3)
        `);
        console.log('   ✅ 5 notes');

        // Taches
        await client.query(`
            INSERT INTO tache (titre_tache, description_tache, statut_tache, date_echeance, id_utilisateur, id_evenement) VALUES
                ('Confirmer la réservation de la salle', 'Appeler le Château de Versailles pour confirmer la réservation.', 'termine', '2025-02-15', 2, 1),
                ('Envoyer le menu au client', 'Préparer et envoyer les options de menu pour validation.', 'termine', '2025-02-20', 3, 1),
                ('Commander le matériel audiovisuel', 'Réserver vidéoprojecteur, micros et écran.', 'en_cours', '2025-03-01', 2, 1),
                ('Finaliser le programme de la conférence', 'Valider l''ordre des interventions avec le client.', 'a_faire', '2025-03-15', 1, 2),
                ('Contacter les intervenants', 'Envoyer les invitations aux 5 speakers.', 'en_cours', '2025-03-10', 3, 2),
                ('Choisir le thème de décoration', 'Proposer 3 thèmes au client pour le gala.', 'a_faire', '2025-03-20', 1, 3),
                ('Réserver le DJ', 'Comparer les devis des 3 DJ présélectionnés.', 'a_faire', '2025-03-25', 2, 3),
                ('Bilan post-événement', 'Rédiger le compte-rendu du workshop.', 'termine', '2025-01-25', 1, 4)
        `);
        console.log('   ✅ 8 tâches');

        // Avis
        await client.query(`
            INSERT INTO avis (note_avis, commentaire_avis, statut_avis, id_evenement, id_client) VALUES
                (5, 'Événement parfaitement organisé ! L''équipe était très réactive et le résultat a dépassé nos attentes. Je recommande vivement Innov''Events.', 'valide', 4, 1),
                (4, 'Très bonne organisation globale. Petit bémol sur le timing du déjeuner, mais rien de grave. Merci à toute l''équipe !', 'en_attente', 4, 1)
        `);
        console.log('   ✅ 2 avis');

        // Contacts
        await client.query(`
            INSERT INTO contact (nom_utilisateur_contact, email_contact, titre_contact, description_contact) VALUES
                ('Jean Dupuis', 'jean.dupuis@email.com', 'Demande d''information', 'Bonjour, je souhaiterais avoir plus d''informations sur vos services pour l''organisation d''un mariage. Merci.'),
                (NULL, 'anonyme@test.com', 'Question tarifs', 'Quels sont vos tarifs pour un événement de 100 personnes ?'),
                ('Claire Martin', 'claire.martin@entreprise.fr', 'Partenariat', 'Bonjour, nous sommes un traiteur et aimerions discuter d''un partenariat avec votre agence. Cordialement.')
        `);
        console.log('   ✅ 3 contacts');

        await client.query('COMMIT');
        console.log('');

        // ========================================
        // VERIFICATION
        // ========================================
        console.log('📊 ÉTAPE 4: Vérification...');
        const tables = ['utilisateur', 'prospect', 'client', 'evenement', 'devis', 'prestation', 'note', 'tache', 'avis', 'contact'];
        
        let total = 0;
        for (const table of tables) {
            const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
            const count = parseInt(result.rows[0].count);
            total += count;
            console.log(`   ${table}: ${count} lignes`);
        }
        console.log(`   ─────────────────`);
        console.log(`   TOTAL: ${total} lignes`);
        console.log('');

        // ========================================
        // RESULTAT FINAL
        // ========================================
        console.log('╔════════════════════════════════════════════╗');
        console.log('║   🎉 INITIALISATION RÉUSSIE !              ║');
        console.log('╚════════════════════════════════════════════╝');
        console.log('');
        console.log('📋 Comptes créés:');
        console.log('┌──────────┬────────────────────────────────────┐');
        console.log('│ Rôle     │ Email                              │');
        console.log('├──────────┼────────────────────────────────────┤');
        console.log('│ Admin    │ chloe@innovevents.com              │');
        console.log('│ Employé  │ jose@innovevents.com               │');
        console.log('│ Employé  │ marie@innovevents.com              │');
        console.log('│ Client   │ pierre.bernard@entreprise.com      │');
        console.log('│ Client   │ sophie.leroy@startup.fr            │');
        console.log('│ Client   │ marc.petit@corporate.com           │');
        console.log('└──────────┴────────────────────────────────────┘');
        console.log('');
        console.log(`🔐 Mot de passe: ${DEFAULT_PASSWORD}`);
        console.log('');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('');
        console.error('❌ ERREUR:', error.message);
        console.error('');
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// ============================================
// EXECUTION
// ============================================
initDatabase().catch(err => {
    console.error('❌ Initialisation échouée');
    process.exit(1);
});
