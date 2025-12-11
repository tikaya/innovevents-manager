const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-blanc-casse py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="page-title mb-8">Mentions Légales</h1>

          <div className="card space-y-8">
            <section>
              <h2 className="section-title mb-4">Éditeur du site</h2>
              <p className="text-gray-600">
                <strong>Innov'Events</strong><br />
                Société par Actions Simplifiée (SAS)<br />
                Capital social : 10 000 €<br />
                Siège social : 123 Avenue des Événements, 75001 Paris<br />
                RCS Paris : 123 456 789<br />
                N° TVA : FR 12 345678901
              </p>
            </section>

            <section>
              <h2 className="section-title mb-4">Contact</h2>
              <p className="text-gray-600">
                Email : contact@innovevents.com<br />
                Téléphone : 01 23 45 67 89
              </p>
            </section>

            <section>
              <h2 className="section-title mb-4">Responsable de la publication</h2>
              <p className="text-gray-600">
                Chloé Martin, Directrice Générale
              </p>
            </section>

            <section>
              <h2 className="section-title mb-4">Hébergeur</h2>
              <p className="text-gray-600">
                <strong>OVH SAS</strong><br />
                2 rue Kellermann<br />
                59100 Roubaix, France<br />
                Téléphone : 1007
              </p>
            </section>

            <section>
              <h2 className="section-title mb-4">Propriété intellectuelle</h2>
              <p className="text-gray-600">
                L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
              </p>
            </section>

            <section>
              <h2 className="section-title mb-4">Protection des données personnelles</h2>
              <p className="text-gray-600">
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit d'accès, de rectification, de suppression et de portabilité de vos données personnelles. Pour exercer ces droits, vous pouvez nous contacter à l'adresse : contact@innovevents.com
              </p>
            </section>

            <section>
              <h2 className="section-title mb-4">Cookies</h2>
              <p className="text-gray-600">
                Ce site utilise des cookies pour améliorer l'expérience utilisateur. En poursuivant votre navigation, vous acceptez l'utilisation de ces cookies.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentionsLegales;
