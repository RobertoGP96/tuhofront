import { AccommodationProcedureForm } from '@/components/internal/AccommodationProcedureForm';
import { useNavigate } from 'react-router-dom';

export function AccommodationProcedurePage() {
  const navigate = useNavigate();

  const handleSuccess = (createdId: number) => {
    navigate(`/procedures/internals/accommodation/${createdId}`, { state: { justCreated: true } });
  };

  const handleCancel = () => {
    navigate('/procedures/internals');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <AccommodationProcedureForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
