import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import EmployeSidebar from './EmployeSidebar';

const EmployeLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, isEmploye, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blanc-casse">
        <div className="animate-spin w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Employé ou Admin peuvent accéder
  if (!user || (!isEmploye() && !isAdmin())) {
    return <Navigate to="/connexion" replace />;
  }

  return (
    <div className="min-h-screen bg-blanc-casse">
      {/* Sidebar */}
      <EmployeSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gris-ardoise hover:text-green-600"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="font-montserrat font-semibold text-gris-ardoise hidden sm:block">
                Espace Employé
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative text-gray-500 hover:text-green-600">
                <Bell className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user?.prenom?.charAt(0)}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-gris-ardoise">
                  {user?.prenom}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeLayout;
