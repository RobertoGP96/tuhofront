import { SidebarContainer, Tab, ProcedureList, ProcedureItem, DeleteButton, TabsContainer } from "../../styles/styles";
import { deleteFeedingProcedure, deleteAccommodationProcedure, deleteTransportProcedure, deleteMaintanceProcedure } from "../../services/internal/internal.procedures.api";
import { toast } from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import type { Procedure } from "../../types/internal/general";

interface TabType {
  key: string;
  label: string;
}

type Tabs = 'feeding' | 'accommodation' | 'transport' | 'maintance';

interface SidebarProps {
  tabs: TabType[];
  activeTab: Tabs;
  onTabChange: (key: Tabs) => void;
  procedures: Procedure[];
  onProcedureSelect: (procedure: Procedure) => void;
  selectedProcedure?: Procedure | null;
  setProcedures: React.Dispatch<React.SetStateAction<Procedure[]>>;
}

function Sidebar({
  tabs,
  activeTab,
  onTabChange,
  procedures,
  onProcedureSelect,
  selectedProcedure,
  setProcedures,
}: SidebarProps) {
  const handleDelete = async (id: number) => {
    try {
      const deleteFunctions = {
        feeding: deleteFeedingProcedure,
        accommodation: deleteAccommodationProcedure,
        transport: deleteTransportProcedure,
        maintance: deleteMaintanceProcedure,
      };

      await deleteFunctions[activeTab](id);

      setProcedures((prevProcedures) => prevProcedures.filter((procedure) => procedure.id !== id));

      toast.success("Trámite eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el trámite:", error);
      toast.error("Error al eliminar el trámite");
    }
  };

  return (
    <SidebarContainer>
      <TabsContainer className="tabs">
        {tabs.map((tabs) => (
          <Tab
            key={tabs.key}
            $active={activeTab === tabs.key}
            onClick={() => onTabChange(tabs.key as Tabs)}
          >
            {tabs.label}
          </Tab>
        ))}
      </TabsContainer>
      <ProcedureList>
        {procedures.map((procedure) => (
          <ProcedureItem
            key={procedure.id}
            $selected={selectedProcedure?.id === procedure.id}
          >
            <div onClick={() => onProcedureSelect(procedure)} style={{ flex: 1 }}>
              <span>
                Date
              </span>
            </div>
            <DeleteButton onClick={() => handleDelete(procedure.id)}>
              <FaTrash />
            </DeleteButton>
          </ProcedureItem>
        ))}
      </ProcedureList>
    </SidebarContainer>
  );
}

export default Sidebar;