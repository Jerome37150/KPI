import { ClipboardList } from 'lucide-react';
import { PagePlaceholder } from '../components/primitives/PagePlaceholder';

export function CahierDesChargesPage() {
  return (
    <PagePlaceholder
      overline="NAX7 full web"
      title="Cahier des charges"
      description="Spécifications fonctionnelles et techniques du projet NAX7 full web."
      icon={ClipboardList}
    />
  );
}
