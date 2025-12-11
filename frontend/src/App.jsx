import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import ClientLayout from './components/layout/ClientLayout';

// Pages publiques
import Home from './pages/public/Home';
import DemandeDevis from './pages/public/DemandeDevis';
import Evenements from './pages/public/Evenements';
import Avis from './pages/public/Avis';
import Contact from './pages/public/Contact';
import MentionsLegales from './pages/public/MentionsLegales';

// Pages auth
import Connexion from './pages/auth/Connexion';
import Inscription from './pages/auth/Inscription';
import MotDePasseOublie from './pages/auth/MotDePasseOublie';

// Pages admin
import Dashboard from './pages/admin/Dashboard';
import Prospects from './pages/admin/Prospects';
import Clients from './pages/admin/Clients';
import EvenementsAdmin from './pages/admin/EvenementsAdmin';
import DevisAdmin from './pages/admin/DevisAdmin';
import TachesAdmin from './pages/admin/TachesAdmin';
import AvisAdmin from './pages/admin/AvisAdmin';

// Pages client
import DashboardClient from './pages/client/DashboardClient';
import MesEvenements from './pages/client/MesEvenements';
import MesDevis from './pages/client/MesDevis';
import DeposerAvis from './pages/client/DeposerAvis';
import MonProfil from './pages/client/MonProfil';

// Layout avec Header/Footer
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

// Layout sans Header/Footer (auth)
const AuthLayout = ({ children }) => (
  <div className="min-h-screen">{children}</div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/demande-devis" element={<PublicLayout><DemandeDevis /></PublicLayout>} />
          <Route path="/evenements" element={<PublicLayout><Evenements /></PublicLayout>} />
          <Route path="/avis" element={<PublicLayout><Avis /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/mentions-legales" element={<PublicLayout><MentionsLegales /></PublicLayout>} />
          
          {/* Routes auth */}
          <Route path="/connexion" element={<AuthLayout><Connexion /></AuthLayout>} />
          <Route path="/inscription" element={<AuthLayout><Inscription /></AuthLayout>} />
          <Route path="/mot-de-passe-oublie" element={<AuthLayout><MotDePasseOublie /></AuthLayout>} />
          {/* Routes admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="prospects" element={<Prospects />} />
            <Route path="clients" element={<Clients />} />
            <Route path="evenements" element={<EvenementsAdmin />} />
            <Route path="devis" element={<DevisAdmin />} />
            <Route path="taches" element={<TachesAdmin />} />
            <Route path="avis" element={<AvisAdmin />} />
          </Route>

          {/* Routes client */}
          <Route path="/client" element={<ClientLayout />}>
            <Route index element={<DashboardClient />} />
            <Route path="evenements" element={<MesEvenements />} />
            <Route path="devis" element={<MesDevis />} />
            <Route path="avis" element={<DeposerAvis />} />
            <Route path="profil" element={<MonProfil />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;