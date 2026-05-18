import { useMemo, useState } from 'react';
import './styles/globals.css';
import { useAuth } from './hooks/useAuth';
import { useNotionData } from './hooks/useNotionData';
import { AppLayout } from './components/AppLayout';
import { projectForTab } from './components/Sidebar';
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
import { CahierDesChargesNaxiSaasPage } from './pages/CahierDesChargesNaxiSaasPage';
import { CalculPrixPage } from './pages/CalculPrixPage';
import { RdModeDegradePage } from './pages/RdModeDegradePage';
import { RdMigrationPage } from './pages/RdMigrationPage';

// Wrappers pour les Cahiers des charges par projet
const Cdc = (project) => () => <CahierDesChargesPage project={project} />;

// ============================================
// PAGES — registre des pages connues (clé = id route, label = titre header)
// ============================================
const PAGES = {
  dashboard:      { label: "Dashboard",       Component: DashboardPage      },
  enregistrement: { label: "Enregistrement",  Component: EnregistrementPage },
  version:        { label: "Version",         Component: VersionPage        },
  sprint:         { label: "Sprint en cours", Component: SprintPage         },
  "naxi-saas-cdc":{ label: "Cahier des charges · Naxi Saas", Component: CahierDesChargesNaxiSaasPage },
  suivi:          { label: "Suivi Top Line",  Component: SuiviPage          },
  immobilisation: { label: "Immobilisation",  Component: ImmobilisationPage },

  // NAX7 full web
  blueprint:                  { label: "Blue Print",                          Component: BluePrintPage      },
  gantt:                      { label: "Gantt",                               Component: GanttPage          },
  "cdc-nax7-full-web":        { label: "NAX7 full web · Cahier des charges",  Component: Cdc("NAX7 full web") },
  "calcul-prix":              { label: "Calcul prix",                         Component: CalculPrixPage     },
  "rd-mode-degrade":          { label: "R&D mode dégradé",                    Component: RdModeDegradePage  },
  "rd-migration":             { label: "R&D migration",                       Component: RdMigrationPage    },

  // Autres projets — uniquement Cahier des charges pour l'instant
  "cdc-nax7-light":           { label: "Nax7 light · Cahier des charges",            Component: Cdc("Nax7 light") },
  "cdc-nax7-manager":         { label: "Nax7 Manager · Cahier des charges",          Component: Cdc("Nax7 Manager") },
  "cdc-inaxel-pilot":         { label: "Inaxel Pilot · Cahier des charges",          Component: Cdc("Inaxel Pilot") },
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

  // Filtre data selon le projet de l'onglet actif (null = vue globale, pas de filtre).
  // Les onglets sous une catégorie avec `notionProject` ne voient que les fenêtres,
  // saisies, lignes CII et membres rattachés à ce projet.
  const currentProject = projectForTab(tab);
  const scopedData = useMemo(() => {
    if (!currentProject) return data;
    return {
      ...data,
      topline:    data.topline.filter(t => t.projet === currentProject),
      suiviLundi: data.suiviLundi.filter(s => s.projet === currentProject),
      equipe:     data.equipe.filter(e => !e.projets?.length || e.projets.includes(currentProject)),
      cii: {
        ...data.cii,
        rows: data.cii.rows.filter(r => r.projet === currentProject),
      },
    };
  }, [data, currentProject]);

  return (
    <AppLayout
      tab={tab}
      onTabChange={setTab}
      onLogout={logout}
      currentLabel={page.label}
      lastRefresh={data.generatedAt}
    >
      <div className="fade-in" key={tab}>
        <Page data={scopedData} onNavigate={setTab} />
      </div>
    </AppLayout>
  );
}
