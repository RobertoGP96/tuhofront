import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  FormContainer,
  Title,
  FieldGrid,
  FieldContainer,
  SubmitButton,
  NotesContainer,
  NotesTitle,
  NotesList,
  NoteItem,
  NoteState as StyledNoteState,
  NoteDescription,
  PrintButton,
} from "../../styles/styles";
import StateBar from "./StateBar";
import StateChangeDialog from "./StateChangeDialog";

import { toast } from "react-hot-toast";
import { capitalize } from "../../services/internal/utils";
import { getAllMaintancePriorities, getAllMaintanceProceduresTypes, getMaintanceProcedurePDFUrl, patchMaintanceProcedure, createMaintanceProcedure } from "../../services/internal/internal.procedures.api";
import type { Area, Department, ProcedureState } from "../../types/internal/general";
import type { MaintanceProcedure, MaintanceProcedureType, MaintancePriority } from "../../types/internal/mantenice";

interface MaintanceFormData {
  procedure_type: string;
  priority: string;
  description: string;
  department: string;
  area: string;
  document: FileList | null;
  picture: FileList | null;
}

interface MaintanceComponentProps {
  mode?: "form" | "details" | "user";
  procedure?: MaintanceProcedure | null;
  onStateChange?: (newState: string) => void;
  setProcedures?: React.Dispatch<React.SetStateAction<MaintanceProcedure[]>>;
  departments: Department[];
  areas: Area[];
}

function MaintanceComponent({
  mode = "form", // "form", "details", o "user"
  procedure = null,
  onStateChange,
  setProcedures,
  departments,
  areas,
}: MaintanceComponentProps) {
  const { register, handleSubmit, reset, watch } = useForm<MaintanceFormData>();
  const [editable, setEditable] = useState(mode === "form" || (mode === "user" && procedure?.state === "PENDIENTE"));
  const [procedureTypes, setProcedureTypes] = useState<MaintanceProcedureType[]>([]);
  const [priorities, setPriorities] = useState<MaintancePriority[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingState, setPendingState] = useState<ProcedureState>("PENDIENTE");

  // Nuevo: Estado para el área seleccionada
  const selectedArea = watch("area");

  // Filtrar departamentos asociados al área seleccionada
  const filteredDepartments = selectedArea
    ? departments.filter(dep =>
        selectedArea === dep.area?.id?.toString()
      )
    : [];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const procedureTypesResponse = await getAllMaintanceProceduresTypes();
        setProcedureTypes(procedureTypesResponse.data);

        const prioritiesResponse = await getAllMaintancePriorities();
        setPriorities(prioritiesResponse.data);
      } catch (error) {
        console.error("Error al obtener los datos del servidor:", error);
      }
    };

    fetchData();
    reset({
      procedure_type: procedure?.procedure_type?.id?.toString() || "",
      priority: procedure?.priority?.id?.toString() || "",
      description: procedure?.description || "",
      department: procedure?.department?.id?.toString() || "",
      area: procedure?.area?.id?.toString() || "",
      document: null, // Reiniciar el campo de archivo
      picture: null, // Reiniciar el campo de imagen
    });
    if (mode === "details" || mode === "user") {
      setEditable(mode === "user" && procedure?.state === "PENDIENTE");
    }
  }, [procedure, mode, reset]);

  const handleStateChange = async (newState: ProcedureState) => {
    if (mode === "user" || !procedure) return;
    const currentState = procedure.state;

    // Definir las transiciones permitidas
    const allowedTransitions: Record<ProcedureState, ProcedureState[]> = {
      PENDIENTE: ["APROBADO", "RECHAZADO"],
      APROBADO: ["CANCELADO", "FINALIZADO"],
      CANCELADO: [],
      RECHAZADO: [],
      FINALIZADO: [],
    };

    // Verificar si la transición es válida
    if (!allowedTransitions[currentState]?.includes(newState)) {
      toast.error(`No se puede cambiar el estado de ${capitalize(currentState)} a ${capitalize(newState)}`);
      return;
    }

    // Abrir el diálogo para agregar una nota
    setPendingState(newState);
    setIsDialogOpen(true);
  };

  const handleDialogConfirm = async (description: string) => {
    if (!procedure) return;
    setIsDialogOpen(false);

    const payload: Record<string, unknown> = { state: pendingState };
    if (description) {
      payload.notes = [
        ...procedure.notes,
        { state: pendingState, description, id: Date.now() }, // Temporal ID
      ];
    }

    await toast.promise(
      patchMaintanceProcedure(procedure.id, payload)
        .then(() => {
          onStateChange?.(pendingState);
          setProcedures?.((prevProcedures) =>
            prevProcedures.map((p) =>
              p.id === procedure.id ? { ...p, state: pendingState } : p
            )
          );
        }),
      {
        loading: "Cambiando estado...",
        success: <b>Estado cambiado a "{capitalize(pendingState)}" exitosamente.</b>,
        error: <b>Error al cambiar el estado del trámite.</b>,
      }
    );
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const onSubmit = async (data: MaintanceFormData) => {
    if (!procedure && (mode === "user" && editable)) return;
    
    try {
      const { picture, document, ...restData } = data;
      let response: { data: MaintanceProcedure };

      if (mode === "user" && editable) {
        // Actualizar el trámite existente
        const updatePayload = {
          procedure_type: parseInt(restData.procedure_type),
          priority: parseInt(restData.priority),
          description: restData.description,
          department: parseInt(restData.department),
          area: parseInt(restData.area),
        } as unknown as Partial<MaintanceProcedure>;
        
        response = await toast.promise(
          patchMaintanceProcedure(procedure!.id, updatePayload),
          {
            loading: "Actualizando trámite...",
            success: <b>Trámite de mantenimiento actualizado exitosamente</b>,
            error: <b>Error al actualizar el trámite de mantenimiento</b>,
          }
        );
        setProcedures?.((prevProcedures) =>
          prevProcedures.map((p) =>
            p.id === procedure!.id ? { ...p, ...response.data } : p
          )
        );
      } else {
        // Crear un nuevo trámite
        response = await toast.promise(
          createMaintanceProcedure({
            procedure_type: parseInt(restData.procedure_type),
            priority: parseInt(restData.priority),
            description: restData.description,
            department: parseInt(restData.department),
            area: parseInt(restData.area),
            nombre_tramite: "Tramite de Mantenimiento",
          } as unknown as MaintanceProcedure),
          {
            loading: "Creando trámite...",
            success: <b>Trámite de mantenimiento creado exitosamente</b>,
            error: <b>Error al crear el trámite de mantenimiento</b>,
          }
        );
        reset();
      }

      if ((picture && picture[0]) || (document && document[0])) {
        const submissionData = new FormData();
        if (picture && picture[0]) submissionData.append("picture", picture[0]);
        if (document && document[0]) submissionData.append("document", document[0]);
        // Para FormData necesitamos usar una función específica de archivos
        // Por ahora omitimos esta funcionalidad hasta que se implemente en la API
        // await toast.promise(
        //   patchMaintanceProcedure(response.data.id, submissionData as any),
        //   {
        //     loading: "Agregando archivos...",
        //     success: <b>Archivos agregados exitosamente</b>,
        //     error: <b>Error al agregar los archivos</b>,
        //   }
        // );
      }
    } catch (error) {
      // El error ya es manejado por toast.promise, pero puedes dejar el log para debug
      console.error(
        mode === "user" && editable
          ? "Error al actualizar el trámite de mantenimiento:"
          : "Error al crear el trámite de mantenimiento:",
        error
      );
    }
  };

  return (
    <FormContainer>
      <Title>
        {mode === "form" ? "Trámite de Mantenimiento" : "Detalles del Trámite de Mantenimiento"}
      </Title>

      {mode !== "form" && (
        <>
          <StateBar
            currentState={procedure?.state || "PENDIENTE"}
            onStateChange={handleStateChange}
            readOnly={mode === "user"} // Barra de estado en modo "read-only" si es "user"
          />
          <StateChangeDialog
            isOpen={isDialogOpen}
            onClose={handleDialogClose}
            onConfirm={handleDialogConfirm}
            newState={capitalize(pendingState)}
            requirePlate={false}
          />
        </>
      )}

      {procedure?.notes && procedure?.notes.length > 0 && (
        <NotesContainer>
          <NotesTitle>Notas</NotesTitle>
          <NotesList>
            {procedure.notes.map((note, index) => (
              <NoteItem key={index}>
                <StyledNoteState>Estado:</StyledNoteState> {capitalize(note.state)} <br />
                <NoteDescription>
                  {note.description || "Sin descripción"}
                </NoteDescription>
              </NoteItem>
            ))}
          </NotesList>
        </NotesContainer>
      )}

      <form
        onSubmit={editable ? handleSubmit(onSubmit) : undefined}
        encType="multipart/form-data"
      >

        <FieldContainer>
          <label>Tipo de Mantenimiento</label>
          <select
            {...register("procedure_type")}
            defaultValue={editable && mode === "user" ? procedure?.procedure_type?.id : undefined}
            value={!editable ? procedure?.procedure_type?.id : undefined}
            disabled={mode === "details" || !editable}
          >
            <option value="">Seleccione un tipo de Mantenimiento</option>
            {procedureTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </FieldContainer>

        <FieldGrid>
          <FieldContainer>
            <label>Área</label>
            <select
              {...register("area")}
              defaultValue={procedure?.area?.id || ""}
              disabled={mode === "details" || !editable}
            >
              <option value="">Seleccione su Área</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </FieldContainer>
          <FieldContainer>
            <label>Departamento</label>
            <select
              {...register("department")}
              value={procedure?.department?.id || ""}
              disabled={!selectedArea || mode === "details" || !editable}
            >
              <option value="">Seleccione su Departamento</option>
              {filteredDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </FieldContainer>
        </FieldGrid>

        <FieldContainer>
          <label>Descripción</label>
          <textarea
            {...register("description")}
            defaultValue={editable && mode === "user" ? procedure?.description : undefined}
            value={!editable ? procedure?.description : undefined}
            disabled={mode === "details" || !editable}
          />
        </FieldContainer>

        <FieldContainer>
          <label>Prioridad</label>
          <select
            {...register("priority")}
            defaultValue={editable && mode === "user" ? procedure?.priority?.id : undefined}
            value={!editable ? procedure?.priority?.id : undefined}
            disabled={mode === "details" || !editable}
          >
            <option value="">Seleccione una prioridad</option>
            {priorities.map((priority) => (
              <option key={priority.id} value={priority.id}>
                {priority.name}
              </option>
            ))}
          </select>
        </FieldContainer>

        {procedure?.picture && (
          <FieldContainer>
            <label>Imagen</label>
            <img src={procedure.picture} alt="Imagen del trámite" />
          </FieldContainer>
        )}

        {procedure?.document && (
          <FieldContainer>
            <label>Documento</label>
            <a href={procedure.document} target="_blank" rel="noopener noreferrer">
              Ver Documento
            </a>
          </FieldContainer>
        )}

        {editable && (
          <>
            <FieldContainer>
              <label>Imagen (opcional)</label>
              <input type="file" {...register("picture")} />
            </FieldContainer>

            <FieldContainer>
              <label>Documento (opcional)</label>
              <input type="file" {...register("document")} />
            </FieldContainer>
          </>
        )}

        {mode === "form" && <SubmitButton type="submit">Enviar</SubmitButton>}
        {mode === "user" && editable && (
          <SubmitButton type="submit">
            Guardar Cambios
          </SubmitButton>
        )}
        {mode === "details" && (
          <PrintButton
            href={getMaintanceProcedurePDFUrl(procedure?.id || 0)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Imprimir PDF
          </PrintButton>
        )}
      </form>
    </FormContainer>
  );
}

export default MaintanceComponent;