import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gris-ardoise text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-or text-2xl">✦</span>
              <span className="font-montserrat font-bold text-xl">
                Innov'<span className="text-or">Events</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              Créateurs d'événements exceptionnels depuis 2020.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="font-montserrat font-semibold text-or mb-4">Liens rapides</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/evenements" className="hover:text-white transition-colors">Événements</Link></li>
              <li><Link to="/avis" className="hover:text-white transition-colors">Avis clients</Link></li>
              <li><Link to="/demande-devis" className="hover:text-white transition-colors">Demander un devis</Link></li>
            </ul>
          </div>

          {/* Nos services */}
          <div>
            <h4 className="font-montserrat font-semibold text-or mb-4">Nos services</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Séminaires</li>
              <li>Conférences</li>
              <li>Soirées d'entreprise</li>
              <li>Team building</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-montserrat font-semibold text-or mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-center space-x-2">
                <Mail size={16} />
                <span>contact@innovevents.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} />
                <span>01 23 45 67 89</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Paris, France</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2024 Innov'Events - Tous droits réservés - <Link to="/mentions-legales" className="hover:text-white">Mentions légales</Link></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
