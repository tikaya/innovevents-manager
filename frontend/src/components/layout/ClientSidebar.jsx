import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Star,
  User,
  LogOut,
  X,
  Home,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClientSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/client' },
    { icon: Calendar, label: 'Mes événements', path: '/client/evenements' },
    { icon: FileText, label: 'Mes devis', path: '/client/devis' },
    { icon: Star, label: 'Déposer un avis', path: '/client/avis' },
    { icon: User, label: 'Mon profil', path: '/client/profil' },
  ];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-gris-ardoise text-white z-50
        flex flex-col overflow-hidden
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-or text-xl">✦</span>
              <span className="font-montserrat font-bold text-base">
                Innov'<span className="text-or">Events</span>
              </span>
            </div>
            <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-1">Espace client</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/client'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-btn transition-all text-sm
                ${isActive 
                  ? 'bg-or text-gris-ardoise font-semibold' 
                  : 'text-gray-300 hover:bg-gray-700'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Séparateur */}
          <div className="border-t border-gray-600 my-3"></div>

          {/* Lien vers le site public */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-gray-300 hover:bg-gray-700 transition-all text-sm"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            <span>Retour au site</span>
            <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0" />
          </Link>
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-gray-600 flex-shrink-0 bg-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-or flex items-center justify-center flex-shrink-0">
              <span className="text-gris-ardoise font-bold text-sm">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-gray-400 text-xs">Client</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-btn transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default ClientSidebar;
