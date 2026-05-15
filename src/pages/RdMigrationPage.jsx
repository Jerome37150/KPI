import { Database } from 'lucide-react';
import { PagePlaceholder } from '../components/primitives/PagePlaceholder';

export function RdMigrationPage() {
  return (
    <PagePlaceholder
      overline="NAX7 full web"
      title="R&D migration"
      description="Plan de migration des données et des utilisateurs vers NAX7 full web."
      icon={Database}
    />
  );
}
