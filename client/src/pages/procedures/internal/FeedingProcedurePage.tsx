import { FeedingProcedureForm } from '@/components/internal/FeedingProcedureForm';
import { useNavigate } from 'react-router-dom';

export function FeedingProcedurePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/procedures');
  };

  const handleCancel = () => {
    navigate('/procedures');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <FeedingProcedureForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
