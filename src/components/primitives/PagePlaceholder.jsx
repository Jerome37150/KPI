import { C, RADIUS } from '../../styles/theme';
import { Card } from './Card';
import { SectionTitle } from './SectionTitle';

// ============================================
// PagePlaceholder — squelette pour les pages en attente de contenu
// ============================================
export function PagePlaceholder({ overline, title, description, icon }) {
  return (
    <Card>
      <SectionTitle overline={overline} sub={description} icon={icon}>{title}</SectionTitle>
      <div style={{
        marginTop: 12,
        padding: "32px 24px",
        background: C.bgSoft,
        border: `1px dashed ${C.gray300}`,
        borderRadius: RADIUS.md,
        textAlign: "center",
        fontSize: 13,
        color: C.inkDim,
      }}>
        Contenu à construire — les données seront branchées ici progressivement.
      </div>
    </Card>
  );
}
