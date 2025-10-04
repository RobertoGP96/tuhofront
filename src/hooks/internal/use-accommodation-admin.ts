import { useAccommodationProcedures, useAccommodationProcedure } from './use-accommodation';
import useAccommodationMutations from './use-accommodation-mutations';

export function useAccommodationAdmin(id?: number) {
  const list = useAccommodationProcedures();
  const single = useAccommodationProcedure(id);
  const mutations = useAccommodationMutations();

  return { ...list, ...single, ...mutations };
}

export default useAccommodationAdmin;
