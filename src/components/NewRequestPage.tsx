import { PageIntro } from './common/PageIntro';
import NewRequestForm from './NewRequestForm';

export default function NewRequestPage() {
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Прием обращения"
        title="Новая заявка"
        description="Заполните данные клиента и устройства. После создания заявка сразу попадет в общую очередь."
      />
      <NewRequestForm />
    </div>
  );
}
