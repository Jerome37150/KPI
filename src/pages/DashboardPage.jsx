import { LayoutDashboard } from 'lucide-react';
import { PagePlaceholder } from '../components/primitives/PagePlaceholder';

// ============================================
// DashboardPage — vue macro (à construire)
// ============================================
export function DashboardPage({ data }) {
  return (
    <PagePlaceholder
      overline="Vue d'ensemble"
      title="Dashboard"
      description="Indicateurs macro produits & qualité"
      icon={LayoutDashboard}
    />
  );
}
