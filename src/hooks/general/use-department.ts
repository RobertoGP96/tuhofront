import { useQuery } from '@tanstack/react-query';
import type { Department } from '../../types/internal/general';
import { getAllDepartments } from '../../services/internal/internal.procedures.api';

/**
 * Hook para obtener departamentos desde la API.
 */
export function useDepartment() {
	const {
		data: departmentsData,
		isLoading: isLoadingDepartments,
		isError: isErrorDepartments,
		refetch: refetchDepartments,
	} = useQuery<Department[], Error, Department[]>({ queryKey: ['departments'], queryFn: () => getAllDepartments().then(r => r.data) });

	return {
		departments: departmentsData ?? ([] as Department[]),
		isLoading: isLoadingDepartments,
		isError: Boolean(isErrorDepartments),
		refetch: refetchDepartments,
	};
}

export default useDepartment;
