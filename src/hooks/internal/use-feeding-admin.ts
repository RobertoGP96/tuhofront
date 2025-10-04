import { useFeedingProcedures, useFeedingProcedure } from './use-feeding';
import useFeedingMutations from './use-feeding-mutations';

export function useFeedingAdmin(id?: number) {
  const list = useFeedingProcedures();
  const single = useFeedingProcedure(id);
  const mutations = useFeedingMutations();

  return { ...list, ...single, ...mutations };
}

export default useFeedingAdmin;
