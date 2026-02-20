import { AccommodationProcedureForm } from '@/components/internal/AccommodationProcedureForm';
import { useNavigate } from 'react-router-dom';

export function AccommodationProcedurePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/procedures');
  };

  const handleCancel = () => {
    navigate('/procedures');
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
