import { Calculator } from 'lucide-react';
import { PagePlaceholder } from '../components/primitives/PagePlaceholder';

export function CalculPrixPage() {
  return (
    <PagePlaceholder
      overline="NAX7 full web"
      title="Calcul prix"
      description="Modèle de tarification et grille de prix NAX7 full web."
      icon={Calculator}
    />
  );
}
