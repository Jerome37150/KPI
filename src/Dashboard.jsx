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
import { CahierDesChargesPage } from './pages/CahierDesChargesPage';
import { CahierDesChargesNaxiSaasPage } from './pages/CahierDesChargesNaxiSaasPage';
import { CahierDesChargesNax7FullWebPage } from './pages/CahierDesChargesNax7FullWebPage';
import { CahierDesChargesNax7LightPage } from './pages/CahierDesChargesNax7LightPage';
import { CahierDesChargesNax7ManagerPage } from './pages/CahierDesChargesNax7ManagerPage';
import { CahierDesChargesInaxelPilotPage } from './pages/CahierDesChargesInaxelPilotPage';
import { CalculPrixPage } from './pages/CalculPrixPage';
import { RdModeDegradePage } from './pages/RdModeDegradePage';
import { RdMigrationPage } from './pages/RdMigrationPage';
import { RdIaPage } from './pages/RdIaPage';
import { ProcedureDetailPage } from './pages/ProcedureDetailPage';
import { PagePlaceholder } from './components/primitives/PagePlaceholder';
import { ClipboardList } from 'lucide-react';

// Wrappers pour les Cahiers des charges par projet
const Cdc = (project) => () => <CahierDesChargesPage project={project} />;

// Wrapper placeholder simple (page en construction sous un projet)
const Placeholder = (overline, title) => () => (
  <PagePlaceholder
    overline={overline}
    title={title}
    description={`Page ${title} en cours de définition pour le projet ${overline}.`}
    icon={ClipboardList}
  />
);

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
  blueprint:                       { label: "Blue Print",                         Component: BluePrintPage      },
  "cdc-nax7-full-web":             { label: "NAX7 full web · Cahier des charges", Component: CahierDesChargesNax7FullWebPage },
  "calcul-prix":                   { label: "Calcul prix",                        Component: CalculPrixPage     },
  "rd-mode-degrade":               { label: "R&D mode dégradé",                   Component: RdModeDegradePage  },
  "rd-migration":                  { label: "R&D migration",                      Component: RdMigrationPage    },
  "rd-ia":                         { label: "R&D intégration IA",                 Component: RdIaPage           },

  // Autres projets — uniquement Cahier des charges pour l'instant
  "cdc-nax7-light":                { label: "Nax7 light · Cahier des charges",      Component: CahierDesChargesNax7LightPage },
  "cdc-nax7-manager":              { label: "Nax7 Manager · Cahier des charges",    Component: CahierDesChargesNax7ManagerPage },
  "cdc-inaxel-pilot":              { label: "Inaxel Pilot · Cahier des charges",    Component: CahierDesChargesInaxelPilotPage },
  "espace-client-inaxel":          { label: "Espace client (site inaxel)",          Component: Placeholder("Inaxel Pilot", "Espace client (site inaxel)") },
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

  // Route dynamique pour les procédures : `procedure-<slug>` → ProcedureDetailPage
  let page;
  let renderPage;
  if (tab.startsWith("procedure-")) {
    const slug = tab.slice("procedure-".length);
    const proc = data.procedures?.find(p => p.slug === slug);
    page = { label: proc?.titre || "Procédure" };
    renderPage = (props) => <ProcedureDetailPage {...props} slug={slug} />;
  } else {
    page = PAGES[tab] || PAGES.dashboard;
    const Page = page.Component;
    renderPage = (props) => <Page {...props} />;
  }

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
      procedures={data.procedures}
    >
      <div className="fade-in" key={tab}>
        {renderPage({ data: scopedData, onNavigate: setTab })}
      </div>
    </AppLayout>
  );
}
