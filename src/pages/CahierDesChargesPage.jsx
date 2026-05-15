import { ClipboardList } from 'lucide-react';
import { PagePlaceholder } from '../components/primitives/PagePlaceholder';

// Page générique réutilisée par chaque projet (NAX7 full web, Nax7 light, etc.)
export function CahierDesChargesPage({ project }) {
  return (
    <PagePlaceholder
      overline={project}
      title="Cahier des charges"
      description={`Spécifications fonctionnelles et techniques du projet ${project}.`}
      icon={ClipboardList}
    />
  );
}
