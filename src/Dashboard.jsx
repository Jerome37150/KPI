import { useState } from 'react';
import './styles/globals.css';
import { useAuth } from './hooks/useAuth';
import { useNotionData } from './hooks/useNotionData';
import { AppLayout } from './components/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EnregistrementPage } from './pages/EnregistrementPage';
import { VersionPage } from './pages/VersionPage';
import { SprintPage } from './pages/SprintPage';
import { ImmobilisationPage } from './pages/ImmobilisationPage';
import { SuiviPage } from './pages/SuiviPage';

// ============================================
// PAGES — registre des pages connues (clé = id route, label = titre header)
// ============================================
const PAGES = {
  dashboard:      { label: "Dashboard",       Component: DashboardPage      },
  enregistrement: { label: "Enregistrement",  Component: EnregistrementPage },
  version:        { label: "Version",         Component: VersionPage        },
  sprint:         { label: "Sprint en cours", Component: SprintPage         },
  suivi:          { label: "Suivi Top Line",  Component: SuiviPage          },
  immobilisation: { label: "Immobilisation",  Component: ImmobilisationPage },
};

// ============================================
// APP ENTRY — wrap auth + data + layout
// ============================================
export default function Dashboard() {
  const [tab, setTab] = useState("dashboard");
  const { isAuthenticated, login, logout } = useAuth();
  const { data } = useNotionData();

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  const page = PAGES[tab] || PAGES.dashboard;
  const Page = page.Component;

  return (
    <AppLayout
      tab={tab}
      onTabChange={setTab}
      onLogout={logout}
      currentLabel={page.label}
      lastRefresh={data.generatedAt}
    >
      <div className="fade-in" key={tab}>
        <Page data={data} onNavigate={setTab} />
      </div>
    </AppLayout>
  );
}
