Hooks para procedimientos internos

Archivos añadidos:

- `use-feeding.ts` / `use-feeding-mutations.ts` / `use-feeding-admin.ts`
- `use-accommodation.ts` / `use-accommodation-mutations.ts` / `use-accommodation-admin.ts`
- `use-transport.ts` / `use-transport-mutations.ts` / `use-transport-admin.ts`
- `use-maintance.ts` / `use-maintance-mutations.ts` / `use-maintance-admin.ts`

Uso básico:

- Para listar: const { feedingProcedures, isLoading } = useFeedingProcedures();
- Para obtener uno: const { feedingProcedure, isLoading } = useFeedingProcedure(id);
- Para crear/editar: const { create, update, patch, remove } = useFeedingMutations();
- Hook agrupador: const admin = useFeedingAdmin(id); // contiene lectura + mutaciones

Notas:
- Estos hooks usan `@tanstack/react-query` y las funciones en `src/services/internal/internal.procedures.api.ts`.
- Las mutaciones invalidan queries relevantes tras el éxito.
