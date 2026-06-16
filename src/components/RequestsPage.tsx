import { RepairRequest } from '../types';
import { PageIntro } from './common/PageIntro';
import RequestsList from './RequestsList';

interface RequestsPageProps {
  onViewRequest: (request: RepairRequest) => void;
}

export default function RequestsPage({ onViewRequest }: RequestsPageProps) {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Журнал заявок"
        title="Все заявки"
        description="Полный список обращений с быстрым поиском, фильтрами, экспортом в CSV и умной очередью, которая сама поднимает рискованные заявки наверх."
      />
      <RequestsList onViewRequest={onViewRequest} />
    </div>
  );
}
