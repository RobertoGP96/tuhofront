import { useMaintanceProcedures, useMaintanceProcedure } from './use-maintance';
import useMaintanceMutations from './use-maintance-mutations';

export function useMaintanceAdmin(id?: number) {
  const list = useMaintanceProcedures();
  const single = useMaintanceProcedure(id);
  const mutations = useMaintanceMutations();

  return { ...list, ...single, ...mutations };
}

export default useMaintanceAdmin;
