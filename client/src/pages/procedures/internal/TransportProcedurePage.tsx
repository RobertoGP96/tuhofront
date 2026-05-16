import { TransportProcedureForm } from '@/components/internal/TransportProcedureForm';
import { useNavigate } from 'react-router-dom';

export function TransportProcedurePage() {
  const navigate = useNavigate();

  const handleSuccess = (createdId: number) => {
    navigate(`/procedures/internals/transport/${createdId}`, { state: { justCreated: true } });
  };

  const handleCancel = () => {
    navigate('/procedures/internals');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <TransportProcedureForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
