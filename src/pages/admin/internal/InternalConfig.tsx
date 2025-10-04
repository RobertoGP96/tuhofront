import React, { useState } from "react";
import {
  MainContainer,
  ContentContainer,
  FormContainer,
  Title,
  FieldContainer,
  SubmitButton,
  ConfigSection,
  ConfigTitle,
  ConfigList,
  ConfigItem,
  DeleteButton,
} from "../../../styles/styles";
import {
  createMaintanceProcedureType,
  createTransportProcedureType,
  createMaintancePriorities,
  getAllMaintanceProceduresTypes,
  getAllTransportProceduresTypes,
  getAllMaintancePriorities,
  deleteMaintanceProcedureType,
  deleteTransportProcedureType,
  deleteMaintancePriorities,
} from "../../../services/internal/internal.procedures.api";

// Import types
import type { MaintanceProcedureType, MaintancePriority } from "../../../types/internal/mantenice";
import type { TransportProcedureType } from "../../../types/internal/transport";

const InternalConfig = () => {
  const [maintanceTypes, setMaintanceTypes] = useState<MaintanceProcedureType[]>([]);
  const [transportTypes, setTransportTypes] = useState<TransportProcedureType[]>([]);
  const [priorities, setPriorities] = useState<MaintancePriority[]>([]);
  const [newMaintanceType, setNewMaintanceType] = useState("");
  const [newTransportType, setNewTransportType] = useState("");
  const [newPriority, setNewPriority] = useState("");

  // Fetch data on mount
  React.useEffect(() => {
    const fetchData = async () => {
      const maintanceResponse = await getAllMaintanceProceduresTypes();
      const transportResponse = await getAllTransportProceduresTypes();
      const prioritiesResponse = await getAllMaintancePriorities();

      setMaintanceTypes(maintanceResponse.data);
      setTransportTypes(transportResponse.data);
      setPriorities(prioritiesResponse.data);
    };

    fetchData();
  }, []);

  const handleAddMaintanceType = async () => {
    if (!newMaintanceType.trim()) return;
    const response = await createMaintanceProcedureType({ name: newMaintanceType } as MaintanceProcedureType);
    setMaintanceTypes([...maintanceTypes, response.data]);
    setNewMaintanceType("");
  };

  const handleAddTransportType = async () => {
    if (!newTransportType.trim()) return;
    const response = await createTransportProcedureType({ name: newTransportType } as TransportProcedureType);
    setTransportTypes([...transportTypes, response.data]);
    setNewTransportType("");
  };

  const handleAddPriority = async () => {
    if (!newPriority.trim()) return;
    const response = await createMaintancePriorities({ name: newPriority } as MaintancePriority);
    setPriorities([...priorities, response.data]);
    setNewPriority("");
  };

  const handleDeleteMaintanceType = async (id: number) => {
    await deleteMaintanceProcedureType(id);
    setMaintanceTypes(maintanceTypes.filter((type) => type.id !== id));
  };

  const handleDeleteTransportType = async (id: number) => {
    await deleteTransportProcedureType(id);
    setTransportTypes(transportTypes.filter((type) => type.id !== id));
  };

  const handleDeletePriority = async (id: number) => {
    await deleteMaintancePriorities(id);
    setPriorities(priorities.filter((priority) => priority.id !== id));
  };

  return (
    <MainContainer>
      <ContentContainer>
        <FormContainer>
          <Title>Ajustes</Title>
          {/* Tipos de Mantenimiento */}
          <div className="w-full flex flex-col gap-3 justify-start items-center">
            <ConfigSection>
              <ConfigTitle>Tipos de Mantenimiento</ConfigTitle>
              <FieldContainer>
                <input
                  type="text"
                  placeholder="Nuevo tipo de mantenimiento"
                  value={newMaintanceType}
                  onChange={(e) => setNewMaintanceType(e.target.value)}
                />
                <SubmitButton onClick={handleAddMaintanceType}>Agregar</SubmitButton>
              </FieldContainer>
              <ConfigList>
                {maintanceTypes.map((type) => (
                  <ConfigItem key={type.id}>
                    {type.name}
                    <DeleteButton onClick={() => handleDeleteMaintanceType(type.id)}>
                      Eliminar
                    </DeleteButton>
                  </ConfigItem>
                ))}
              </ConfigList>
            </ConfigSection>

            {/* Prioridades de Mantenimiento */}
            <ConfigSection>
              <ConfigTitle>Prioridades de Mantenimiento</ConfigTitle>
              <FieldContainer>
                <input
                  type="text"
                  placeholder="Nueva prioridad de mantenimiento"
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                />
                <SubmitButton onClick={handleAddPriority}>Agregar</SubmitButton>
              </FieldContainer>
              <ConfigList>
                {priorities.map((priority) => (
                  <ConfigItem key={priority.id}>
                    {priority.name}
                    <DeleteButton onClick={() => handleDeletePriority(priority.id)}>
                      Eliminar
                    </DeleteButton>
                  </ConfigItem>
                ))}
              </ConfigList>
            </ConfigSection>

            {/* Tipos de Transporte */}
            <ConfigSection>
              <ConfigTitle>Tipos de Transporte</ConfigTitle>
              <FieldContainer>
                <input
                  type="text"
                  placeholder="Nuevo tipo de transporte"
                  value={newTransportType}
                  onChange={(e) => setNewTransportType(e.target.value)}
                />
                <SubmitButton onClick={handleAddTransportType}>Agregar</SubmitButton>
              </FieldContainer>
              <ConfigList>
                {transportTypes.map((type) => (
                  <ConfigItem key={type.id}>
                    {type.name}
                    <DeleteButton onClick={() => handleDeleteTransportType(type.id)}>
                      Eliminar
                    </DeleteButton>
                  </ConfigItem>
                ))}
              </ConfigList>
            </ConfigSection>
          </div>
        </FormContainer>
      </ContentContainer>
    </MainContainer>
  );
};

export default InternalConfig;