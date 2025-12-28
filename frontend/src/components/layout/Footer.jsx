import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-bleu-royal text-white" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4" aria-label="Innov'Events - Accueil">
              <span className="text-or text-2xl" aria-hidden="true">✦</span>
              <span className="font-montserrat font-bold text-xl">
                Innov'<span className="text-or">Events</span>
              </span>
            </Link>
            <p className="text-blue-200 mb-4">
              Votre partenaire pour des événements d'entreprise uniques et mémorables.
              Nous transformons vos idées en expériences exceptionnelles.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Navigation du pied de page">
            <h2 className="font-montserrat font-bold text-lg mb-4">Navigation</h2>
            <ul className="space-y-2" role="list">
              <li>
                <Link to="/" className="text-blue-200 hover:text-or transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/evenements" className="text-blue-200 hover:text-or transition-colors">
                  Événements
                </Link>
              </li>
              <li>
                <Link to="/avis" className="text-blue-200 hover:text-or transition-colors">
                  Avis clients
                </Link>
              </li>
              <li>
                <Link to="/demande-devis" className="text-blue-200 hover:text-or transition-colors">
                  Demander un devis
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-blue-200 hover:text-or transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="font-montserrat font-bold text-lg mb-4">Contact</h2>
            <address className="not-italic space-y-3">
              <p className="flex items-center gap-2 text-blue-200">
                <MapPin className="w-5 h-5 text-or flex-shrink-0" aria-hidden="true" />
                <span>123 Avenue des Événements<br />75001 Paris</span>
              </p>
              <p className="flex items-center gap-2 text-blue-200">
                <Phone className="w-5 h-5 text-or flex-shrink-0" aria-hidden="true" />
                <a href="tel:+33123456789" className="hover:text-or transition-colors">
                  01 23 45 67 89
                </a>
              </p>
              <p className="flex items-center gap-2 text-blue-200">
                <Mail className="w-5 h-5 text-or flex-shrink-0" aria-hidden="true" />
                <a href="mailto:contact@innovevents.com" className="hover:text-or transition-colors">
                  contact@innovevents.com
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-blue-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-blue-200 text-sm">
            © {new Date().getFullYear()} Innov'Events. Tous droits réservés.
          </p>
          <Link 
            to="/mentions-legales" 
            className="text-blue-200 hover:text-or transition-colors text-sm"
          >
            Mentions légales & RGPD
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
