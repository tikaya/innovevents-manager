-- ============================================
-- INNOV'EVENTS - Script SQL PostgreSQL
-- Fichier : init.sql (Schéma uniquement)
-- Projet CDA - 2024
-- ============================================
-- Ce script crée uniquement la structure des tables.
-- Pour les données, utilisez le script seed.js
-- ============================================

-- ============================================
-- SUPPRESSION DES TABLES (ordre inverse des FK)
-- ============================================
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

-- ============================================
-- TABLE UTILISATEUR
-- ============================================
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

-- ============================================
-- TABLE PROSPECT
-- ============================================
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

-- ============================================
-- TABLE CLIENT
-- ============================================
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

-- ============================================
-- TABLE EVENEMENT
-- ============================================
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

-- ============================================
-- TABLE DEVIS
-- ============================================
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

-- ============================================
-- TABLE PRESTATION
-- ============================================
CREATE TABLE prestation (
    id_prestation SERIAL PRIMARY KEY,
    libelle_prestation VARCHAR(200) NOT NULL,
    montant_ht_prestation DECIMAL(10,2) NOT NULL,
    id_devis INT NOT NULL,
    FOREIGN KEY (id_devis) REFERENCES devis(id_devis) ON DELETE CASCADE
);

-- ============================================
-- TABLE NOTE
-- ============================================
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

-- ============================================
-- TABLE TACHE
-- ============================================
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

-- ============================================
-- TABLE AVIS
-- ============================================
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

-- ============================================
-- TABLE CONTACT
-- ============================================
CREATE TABLE contact (
    id_contact SERIAL PRIMARY KEY,
    nom_utilisateur_contact VARCHAR(50),
    email_contact VARCHAR(100) NOT NULL,
    titre_contact VARCHAR(150) NOT NULL,
    description_contact TEXT NOT NULL,
    date_envoi_contact TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEX POUR OPTIMISATION
-- ============================================
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_role ON utilisateur(role);
CREATE INDEX idx_prospect_statut ON prospect(statut_prospect);
CREATE INDEX idx_client_email ON client(email_client);
CREATE INDEX idx_evenement_statut ON evenement(statut_evenement);
CREATE INDEX idx_evenement_date ON evenement(date_debut);
CREATE INDEX idx_devis_statut ON devis(statut_devis);
CREATE INDEX idx_tache_statut ON tache(statut_tache);
CREATE INDEX idx_avis_statut ON avis(statut_avis);

-- ============================================
-- FIN DU SCRIPT SCHEMA
-- ============================================
SELECT 'Schema créé avec succès !' AS message;
