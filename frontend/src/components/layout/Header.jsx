import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Accueil' },
    { to: '/evenements', label: 'Événements' },
    { to: '/avis', label: 'Avis' },
    { to: '/demande-devis', label: 'Demander un devis' },
    { to: '/contact', label: 'Contact' },
  ];

  const getDashboardLink = () => {
    if (!user) return '/connexion';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'employe': return '/employe';
      case 'client': return '/client';
      default: return '/connexion';
    }
  };

  return (
    <>
      {/* Skip Link pour l'accessibilité */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-bleu-royal focus:text-white focus:px-4 focus:py-2 focus:rounded-btn"
      >
        Aller au contenu principal
      </a>

      <header className="bg-white shadow-sm sticky top-0 z-40" role="banner">
        <nav className="container mx-auto px-4" role="navigation" aria-label="Navigation principale">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2" aria-label="Innov'Events - Accueil">
              <span className="text-or text-2xl" aria-hidden="true">✦</span>
              <span className="font-montserrat font-bold text-lg text-bleu-royal">
                Innov'<span className="text-or">Events</span>
              </span>
            </Link>

            {/* Navigation Desktop */}
            <div className="hidden lg:flex items-center space-x-6">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `font-medium transition-colors hover:text-or ${
                      isActive ? 'text-or' : 'text-gris-ardoise'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* Auth Buttons Desktop */}
            <div className="hidden lg:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center space-x-2 text-gris-ardoise hover:text-or transition-colors"
                    aria-label={`Mon espace ${user?.role || ''}`}
                  >
                    <User className="w-5 h-5" aria-hidden="true" />
                    <span>{user?.prenom}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gris-ardoise hover:text-red-600 transition-colors"
                    aria-label="Se déconnecter"
                  >
                    <LogOut className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <Link to="/connexion" className="btn-primary">
                  Connexion
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gris-ardoise hover:text-or transition-colors"
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {isOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            id="mobile-menu"
            className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}
            role="menu"
          >
            <div className="py-4 space-y-2 border-t">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 px-4 rounded-btn transition-colors ${
                      isActive
                        ? 'bg-bleu-ciel text-bleu-royal'
                        : 'text-gris-ardoise hover:bg-gray-100'
                    }`
                  }
                  role="menuitem"
                >
                  {link.label}
                </NavLink>
              ))}
              
              <div className="pt-4 border-t">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsOpen(false)}
                      className="block py-2 px-4 text-gris-ardoise hover:bg-gray-100 rounded-btn"
                      role="menuitem"
                    >
                      Mon espace
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="block w-full text-left py-2 px-4 text-red-600 hover:bg-red-50 rounded-btn"
                      role="menuitem"
                    >
                      Déconnexion
                    </button>
                  </>
                ) : (
                  <Link
                    to="/connexion"
                    onClick={() => setIsOpen(false)}
                    className="block py-2 px-4 bg-bleu-royal text-white text-center rounded-btn"
                    role="menuitem"
                  >
                    Connexion
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
