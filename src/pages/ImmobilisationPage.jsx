import { Building2 } from 'lucide-react';
import { C } from '../styles/theme';
import { Card } from '../components/primitives/Card';
import { SectionTitle } from '../components/primitives/SectionTitle';
import { TopLineTable } from '../components/TopLineTable';

// ============================================
// ImmobilisationPage — base Top Line, fenêtres / immobilisations
// ============================================
export function ImmobilisationPage({ data }) {
  const items = data.topline || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <SectionTitle
        overline="Top Line"
        icon={Building2}
        sub="Immobilisation des fenêtres · personnes en charge & temps par phase"
      >Immobilisation</SectionTitle>

      {items.length === 0 ? (
        <Card padding={32}>
          <div style={{ textAlign: "center", color: C.inkDim, fontSize: 13 }}>
            Aucune fenêtre Top Line dans les données.
          </div>
        </Card>
      ) : (
        <TopLineTable items={items} />
      )}
    </div>
  );
}
