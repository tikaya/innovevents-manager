import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (user?.role === 'admin') return '/admin';
    if (user?.role === 'employe') return '/employe';
    return '/espace-client';
  };

  return (
    <header className="bg-bleu-royal text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-or text-2xl">✦</span>
            <span className="font-montserrat font-bold text-xl">
              Innov'<span className="text-or">Events</span>
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-or transition-colors">Accueil</Link>
            <Link to="/evenements" className="hover:text-or transition-colors">Événements</Link>
            <Link to="/avis" className="hover:text-or transition-colors">Avis</Link>
            <Link to="/contact" className="hover:text-or transition-colors">Contact</Link>
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="flex items-center space-x-2 hover:text-or">
                  <User size={20} />
                  <span>{user?.prenom}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-or">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="hover:text-or transition-colors">
                  Se connecter
                </Link>
                <Link to="/demande-devis" className="btn-cta text-sm py-2 px-4">
                  Demander un devis
                </Link>
              </>
            )}
          </div>

          {/* Menu Mobile */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Navigation Mobile */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 hover:text-or" onClick={() => setIsOpen(false)}>Accueil</Link>
            <Link to="/evenements" className="block py-2 hover:text-or" onClick={() => setIsOpen(false)}>Événements</Link>
            <Link to="/avis" className="block py-2 hover:text-or" onClick={() => setIsOpen(false)}>Avis</Link>
            <Link to="/contact" className="block py-2 hover:text-or" onClick={() => setIsOpen(false)}>Contact</Link>
            <hr className="border-blue-700" />
            {isAuthenticated ? (
              <>
                <Link to={getDashboardLink()} className="block py-2 hover:text-or" onClick={() => setIsOpen(false)}>Mon espace</Link>
                <button onClick={handleLogout} className="block py-2 hover:text-or">Déconnexion</button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="block py-2 hover:text-or" onClick={() => setIsOpen(false)}>Se connecter</Link>
                <Link to="/demande-devis" className="block py-2 text-or font-semibold" onClick={() => setIsOpen(false)}>Demander un devis</Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
