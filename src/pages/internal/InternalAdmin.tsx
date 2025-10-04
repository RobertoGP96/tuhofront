import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { FiX, FiSearch } from "react-icons/fi";
import { FaTrash } from "react-icons/fa";

import { getProcedureStats } from "../../services/internal/internal.procedures.api";
import { deleteFeedingProcedure, deleteAccommodationProcedure, deleteTransportProcedure, deleteMaintanceProcedure } from "../../services/internal/internal.procedures.api";
import { useParams } from "react-router-dom";
import {
  getAllFeedingProcedures,
  getAllAccommodationProcedures,
  getAllTransportProcedures,
  getAllMaintanceProcedures,
  getAllAreas,
  getAllDepartments,
  patchProcedureState,
} from "../../services/internal/internal.procedures.api";
import { toast } from "react-hot-toast";
import StateChangeDialog from "../../components/internal/StateChangeDialog";
import MeterGroup from "../../components/internal/MeterGroup";

// Import types
import type { ProcedureStats, Area, Department, Note } from "../../types/internal/general";

// Import components
import FeedingComponent from "../../components/internal/FeedingComponent";
import AccommodationComponent from "../../components/internal/AccommodationComponent";
import TransportComponent from "../../components/internal/TransportComponent";
import MaintanceComponent from "../../components/internal/MaintanceComponent";

// Extended procedure with additional API fields
interface ApiProcedure {
  id: number;
  username?: string;
  on_create: string;
  state: string;
  area: number | Area;
  department: number | Department;
  notes?: Note[];
  [key: string]: unknown; // Para propiedades adicionales específicas de cada tipo
}

const STATE_OPTIONS = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "APROBADO", label: "Aprobado" },
  { value: "FINALIZADO", label: "Finalizado" },
  { value: "CANCELADO", label: "Cancelado" },
  { value: "RECHAZADO", label: "Rechazado" },
];

const allowedTransitions: Record<string, string[]> = {
  PENDIENTE: ["APROBADO", "RECHAZADO"],
  APROBADO: ["CANCELADO", "FINALIZADO"],
  CANCELADO: [],
  RECHAZADO: [],
  FINALIZADO: [],
};

// Styled Components
const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const Content = styled.div`
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 90vw;
  margin: 0 auto;
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--primary);
  padding-bottom: 8px;
`;

interface TabButtonProps {
  active?: boolean;
}

const TabButton = styled.button<TabButtonProps>`
  padding: 8px 16px;
  border-radius: 4px;
  border: ${({ active }) => (active ? "2px solid var(--primary)" : "1px solid #ccc")};
  background: ${({ active }) => (active ? "var(--primary)" : "#fff")};
  color: ${({ active }) => (active ? "#fff" : "#222")};
  cursor: pointer;
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
  transition: all 0.2s;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 6px #0001;
`;

const Th = styled.th`
  background: var(--primary);
  color: #fff;
  text-align: center;
  padding: 12px 8px;
  border: 1px solid #e0e0e0;
`;

const Td = styled.td`
  text-align: center;
  border: 1px solid #e0e0e0;
  padding: 8px;
`;

const StateSelect = styled.select`
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid var(--primary);
  background: #f7faff;
  color: #222;
  font-weight: bold;
  min-width: 120px;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DeleteButton = styled.button`
  background-color: red;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: darkred;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; width: 100vw; height: 100vh;
  background: #0008;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  min-width: 400px;
  max-width: 90vw;
  max-height: 90vh;
  overflow: auto;
  position: relative;
`;

const CloseIcon = styled(FiX)`
  position: absolute;
  top: 18px;
  right: 18px;
  font-size: 28px;
  color: var(--primary);
  cursor: pointer;
  z-index: 10;
`;


function InternalAdmin() {
  const [procedures, setProcedures] = useState<ApiProcedure[]>([]);
  const [stats, setStats] = useState<ProcedureStats | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalProcedure, setModalProcedure] = useState<ApiProcedure | null>(null);
  const [pendingState, setPendingState] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [procedureToChange, setProcedureToChange] = useState<ApiProcedure | null>(null);
  const params = useParams<{ procedure?: string }>();
  const [activeTab, setActiveTab] = useState(params.procedure);

  const modalRef = useRef<HTMLDivElement>(null);

  const tabs =
    params.procedure === "admin"
      ? [
          { key: "feeding", label: "Alimentación" },
          { key: "accommodation", label: "Hospedaje" },
          { key: "transport", label: "Transporte" },
          { key: "maintance", label: "Mantenimiento" },
        ]
      : [
          {
            key: params.procedure || "",
            label: (params.procedure && {
              feeding: "Trámites de Alimentación",
              accommodation: "Trámites de Hospedaje",
              transport: "Trámites de Transporte",
              maintance: "Trámites de Mantenimiento",
            }[params.procedure as "feeding" | "accommodation" | "transport" | "maintance"]) || params.procedure || "",
          },
        ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!activeTab) return;
        const response = await getProcedureStats();
        setStats({ stats: response.data.stats });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(null);
      }
    };
    if (activeTab) fetchStats();
  }, [activeTab]);

  useEffect(() => {
    const fetchProcedures = async () => {
      const fetchFunctions = {
        feeding: getAllFeedingProcedures,
        accommodation: getAllAccommodationProcedures,
        transport: getAllTransportProcedures,
        maintance: getAllMaintanceProcedures,
      } as const;
      try {
        if (activeTab && activeTab in fetchFunctions) {
          const response = await fetchFunctions[activeTab as keyof typeof fetchFunctions]();
          setProcedures(response.data as unknown as ApiProcedure[]);
        }
        const responseDepartments = await getAllDepartments();
        const responseAreas = await getAllAreas();
        setDepartments(responseDepartments.data);
        setAreas(responseAreas.data);
      } catch (error) {
        console.error("Error fetching procedures:", error);
      }
    };
    if (activeTab) fetchProcedures();
  }, [activeTab]);

  // Al confirmar el cambio de estado desde el dialog
  const handleDialogConfirm = async (description?: string, plateInput?: string) => {
    setDialogOpen(false);
    if (!procedureToChange || !pendingState || !activeTab) return;
    await toast.promise(
      patchProcedureState(activeTab, procedureToChange.id, {
        state: pendingState,
        ...(description ? { notes: [...(procedureToChange.notes || []), { state: pendingState, description }] } : {}),
        ...(activeTab === "transport" && pendingState === "APROBADO" && plateInput ? { plate: plateInput } : {}),
      }).then(() => {
        setProcedures((prev: ApiProcedure[]) =>
          prev.map((p: ApiProcedure) =>
            p.id === procedureToChange.id
              ? { ...p, state: pendingState, ...(activeTab === "transport" && pendingState === "APROBADO" ? { plate: plateInput } : {}) }
              : p
          ) as ApiProcedure[]
        );
        setProcedureToChange(null);
        setPendingState("");
      }),
      {
        loading: "Cambiando estado...",
        success: <b>Estado cambiado exitosamente</b>,
        error: <b>Error al cambiar el estado</b>,
      }
    );
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div>
        <div>¿Estás seguro de que deseas Eliminar el trámite?</div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            style={{
              background: "var(--primary)",
              color: "var(--white)",
              border: "none",
              borderRadius: 4,
              padding: "4px 10px",
              cursor: "pointer"
            }}
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button
            style={{
              background: "#dc3545",
              color: "var(--white)",
              border: "none",
              borderRadius: 4,
              padding: "4px 10px",
              cursor: "pointer"
            }}
            onClick={async () => {
              toast.dismiss(t.id);
              const deleteFunctions = {
                feeding: deleteFeedingProcedure,
                accommodation: deleteAccommodationProcedure,
                transport: deleteTransportProcedure,
                maintance: deleteMaintanceProcedure,
              } as const;

              if (!activeTab) return;

              await toast.promise(
                deleteFunctions[activeTab as keyof typeof deleteFunctions](id)
              .then(() => {
                setProcedures((prevProcedures: ApiProcedure[]) => 
                  prevProcedures.filter((procedure: ApiProcedure) => procedure.id !== id)
                )
              }),
              {
                loading: "Eliminando Trámite...",
                success: <b>Trámite eliminado correctamente</b>,
                error: <b>Error al eliminar el trámite</b>,
              })
            }}
          >
            Confirmar
          </button>
        </div>
      </div>
    ), { duration: 8000 });
  };

  // Cerrar modal al hacer click fuera
  useEffect(() => {
    if (!modalOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [modalOpen]);

  // Renderiza el modal de detalles
  const renderModal = () => {
    if (!modalOpen || !modalProcedure) return null;
    
    const onStateChange = (newState: string) => {
      setModalProcedure({ ...modalProcedure, state: newState } as ApiProcedure);
      setProcedures((prev: ApiProcedure[]) =>
        prev.map((p: ApiProcedure) =>
          p.id === modalProcedure?.id ? { ...p, state: newState } : p
        )
      );
    };

    return (
      <ModalOverlay>
        <ModalContent ref={modalRef}>
          <CloseIcon onClick={() => setModalOpen(false)} title="Cerrar" />
          {activeTab === "feeding" && (
            <FeedingComponent
              mode="details"
              procedure={modalProcedure as never}
              onStateChange={onStateChange}
              setProcedures={setProcedures as never}
              departments={departments}
              areas={areas}
            />
          )}
          {activeTab === "accommodation" && (
            <AccommodationComponent
              mode="details"
              procedure={modalProcedure as never}
              onStateChange={onStateChange}
              setProcedures={setProcedures as never}
              departments={departments}
              areas={areas}
            />
          )}
          {activeTab === "transport" && (
            <TransportComponent
              mode="details"
              procedure={modalProcedure as never}
              onStateChange={onStateChange}
              setProcedures={setProcedures as never}
              departments={departments}
              areas={areas}
            />
          )}
          {activeTab === "maintance" && (
            <MaintanceComponent
              mode="details"
              procedure={modalProcedure as never}
              onStateChange={onStateChange}
              setProcedures={setProcedures as never}
              departments={departments}
              areas={areas}
            />
          )}
        </ModalContent>
      </ModalOverlay>
    );
  };

  // Renderiza la tabla de trámites
  const renderTable = () => (
    <TableContainer>
      <StyledTable>
        <thead>
          <tr>
            <Th>Usuario</Th>
            <Th>Fecha de Creación</Th>
            <Th>Área</Th>
            <Th>Departamento</Th>
            <Th>Estado</Th>
            <Th>Detalles</Th>
            <Th>Eliminar</Th>
          </tr>
        </thead>
        <tbody>
          {procedures.map((p) => {
            const allowed = allowedTransitions[p.state] || [];
            return (
              <tr key={p.id}>
                <Td>{p.username || "N/A"}</Td>
                <Td>{p.on_create}</Td>
                <Td>{areas.find(a => a.id === (typeof p.area === 'number' ? p.area : p.area?.id))?.name || "N/A"}</Td>
                <Td>{departments.find(d => d.id === (typeof p.department === 'number' ? p.department : p.department?.id))?.name || "N/A"}</Td>
                <Td>
                  <StateSelect
                    value={p.state}
                    onChange={e => {
                      setProcedureToChange(p);
                      setPendingState(e.target.value);
                      setDialogOpen(true);
                    }}
                    disabled={allowed.length === 0}
                  >
                    <option value={p.state}>
                      {STATE_OPTIONS.find(opt => opt.value === p.state)?.label || p.state}
                    </option>
                    {allowed.map((opt: string) =>
                      <option key={opt} value={opt}>
                        {STATE_OPTIONS.find(o => o.value === opt)?.label || opt}
                      </option>
                    )}
                  </StateSelect>
                </Td>
                <Td>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <IconButton
                      title="Ver detalles"
                      onClick={() => { setModalProcedure(p); setModalOpen(true); }}
                    >
                      <FiSearch />
                    </IconButton>
                  </div>
                </Td>
                <Td>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <DeleteButton onClick={() => handleDelete(p.id)}>
                      <FaTrash />
                    </DeleteButton>
                  </div>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
      {/* Dialog para cambio de estado */}
      <StateChangeDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDialogConfirm}
        newState={STATE_OPTIONS.find(opt => opt.value === pendingState)?.label || pendingState}
        requirePlate={activeTab === "transport" && pendingState === "APROBADO"}
      />
    </TableContainer>
  );

  return (
    <MainContainer>
      <Content>
        <MeterGroup stats={stats || { stats: { PENDIENTE: 0, APROBADO: 0, CANCELADO: 0, RECHAZADO: 0, FINALIZADO: 0 } }} />
        {params.procedure === "admin" && (
          <TabsContainer>
            {tabs.map(tab => (
              <TabButton
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                active={activeTab === tab.key}
              >
                {tab.label}
              </TabButton>
            ))}
          </TabsContainer>
        )}
        {renderTable()}
        {renderModal()}
      </Content>
    </MainContainer>
  );
}

export default InternalAdmin;