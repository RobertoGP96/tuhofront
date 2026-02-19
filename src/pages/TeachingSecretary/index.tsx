import { TeachingSecretaryLayout } from '@/components/teaching_secretary/TeachingSecretaryLayout';
import { Outlet } from 'react-router-dom';

export function TeachingSecretary() {
  return (
    <TeachingSecretaryLayout>
      <Outlet />
    </TeachingSecretaryLayout>
  );
}
