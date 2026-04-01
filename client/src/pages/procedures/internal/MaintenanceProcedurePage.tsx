import { MaintenanceProcedureForm } from '@/components/internal/MaintenanceProcedureForm';
import { useNavigate } from 'react-router-dom';

export function MaintenanceProcedurePage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/procedures/internals');
  };

  const handleCancel = () => {
    navigate('/procedures/internals');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <MaintenanceProcedureForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
