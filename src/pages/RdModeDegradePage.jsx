import { ShieldAlert } from 'lucide-react';
import { PagePlaceholder } from '../components/primitives/PagePlaceholder';

export function RdModeDegradePage() {
  return (
    <PagePlaceholder
      overline="NAX7 full web"
      title="R&D mode dégradé"
      description="Stratégie de fonctionnement en mode dégradé (perte réseau, pannes serveur, etc.)."
      icon={ShieldAlert}
    />
  );
}
