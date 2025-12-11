import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Calendar, 
  FileText, 
  UserCog,
  ClipboardList,
  Star,
  LogOut,
  X,
  Home,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
    { icon: Users, label: 'Prospects', path: '/admin/prospects' },
    { icon: UserCheck, label: 'Clients', path: '/admin/clients' },
    { icon: Calendar, label: 'Événements', path: '/admin/evenements' },
    { icon: FileText, label: 'Devis', path: '/admin/devis' },
    { icon: ClipboardList, label: 'Tâches', path: '/admin/taches' },
    { icon: Star, label: 'Avis', path: '/admin/avis' },
    { icon: UserCog, label: 'Employés', path: '/admin/employes', adminOnly: true },
  ];

  const filteredMenu = menuItems.filter(item => !item.adminOnly || isAdmin());

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
        fixed top-0 left-0 h-screen w-64 bg-bleu-royal text-white z-50
        flex flex-col overflow-hidden
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header - fixe */}
        <div className="p-4 border-b border-blue-700 flex-shrink-0">
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
          <p className="text-blue-200 text-xs mt-1">Administration</p>
        </div>

        {/* Navigation - scrollable */}
        <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-1">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-btn transition-all text-sm
                ${isActive 
                  ? 'bg-or text-bleu-royal font-semibold' 
                  : 'text-blue-100 hover:bg-blue-800'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Séparateur */}
          <div className="border-t border-blue-700 my-3"></div>

          {/* Lien vers le site public */}
          <Link
            to="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-btn text-blue-100 hover:bg-blue-800 transition-all text-sm"
          >
            <Home className="w-5 h-5 flex-shrink-0" />
            <span>Voir le site</span>
            <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0" />
          </Link>
        </nav>

        {/* User info - fixe en bas */}
        <div className="p-3 border-t border-blue-700 flex-shrink-0 bg-blue-900">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-or flex items-center justify-center flex-shrink-0">
              <span className="text-bleu-royal font-bold text-sm">
                {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user?.prenom} {user?.nom}</p>
              <p className="text-blue-200 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-btn transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;