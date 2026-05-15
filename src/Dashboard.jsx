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
import { BluePrintPage } from './pages/BluePrintPage';
import { GanttPage } from './pages/GanttPage';
import { CahierDesChargesPage } from './pages/CahierDesChargesPage';
import { CalculPrixPage } from './pages/CalculPrixPage';
import { RdModeDegradePage } from './pages/RdModeDegradePage';
import { RdMigrationPage } from './pages/RdMigrationPage';

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
  blueprint:           { label: "Blue Print",            Component: BluePrintPage         },
  gantt:               { label: "Gantt",                 Component: GanttPage             },
  "cahier-des-charges": { label: "Cahier des charges",    Component: CahierDesChargesPage  },
  "calcul-prix":       { label: "Calcul prix",           Component: CalculPrixPage        },
  "rd-mode-degrade":   { label: "R&D mode dégradé",      Component: RdModeDegradePage     },
  "rd-migration":      { label: "R&D migration",         Component: RdMigrationPage       },
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
