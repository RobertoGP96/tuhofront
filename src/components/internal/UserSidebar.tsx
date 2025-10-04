import { SidebarContainer, ProcedureList, ProcedureItem } from "../../styles/styles";

type Procedure = {
  id: string | number;
  nombre_tramite: string;
  on_create: string;
};

interface UserSidebarProps {
  procedures: Procedure[];
  onProcedureSelect: (procedure: Procedure) => void;
  selectedProcedure?: Procedure | null;
}

function UserSidebar({ procedures, onProcedureSelect, selectedProcedure }: UserSidebarProps) {
  return (
    <SidebarContainer>
      <ProcedureList>
        {procedures.map((procedure) => (
          <ProcedureItem
            key={procedure.id}
            $selected={selectedProcedure?.id === procedure.id}
            onClick={() => onProcedureSelect(procedure)}
          >
            {`${procedure.nombre_tramite} - ${procedure.on_create}`}
          </ProcedureItem>
        ))}
      </ProcedureList>
    </SidebarContainer>
  );
}

export default UserSidebar;