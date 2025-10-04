import { useTransportProcedures, useTransportProcedure } from './use-transport';
import useTransportMutations from './use-transport-mutations';

export function useTransportAdmin(id?: number) {
  const list = useTransportProcedures();
  const single = useTransportProcedure(id);
  const mutations = useTransportMutations();

  return { ...list, ...single, ...mutations };
}

export default useTransportAdmin;
