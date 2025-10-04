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
  NoteState,
  NoteDescription,
  PrintButton,
} from "../../styles/styles";
import StateBar from "./StateBar";
import StateChangeDialog from "./StateChangeDialog";

import { toast } from "react-hot-toast";
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { format } from "date-fns";
import { createTransportProcedure, getAllTransportProceduresTypes, getTransportProcedurePDFUrl, patchTransportProcedure } from "../../services/internal/internal.procedures.api";
import { capitalize } from "../../services/internal/utils";
import type { Area, Department, NoteState as NoteStateType } from "../../types/internal/general";
import type { TransportProcedure, TransportProcedureType } from "../../types/internal/transport";

interface TransportFormData {
  procedure_type: string;
  departure_time: string;
  return_time: string;
  departure_place: string;
  return_place: string;
  passengers: number;
  description: string;
  department: string;
  area: string;
  document: FileList | null;
}

interface TransportComponentProps {
  mode?: "form" | "details" | "user";
  procedure: TransportProcedure;
  onStateChange?: (newState: string) => void;
  setProcedures?: React.Dispatch<React.SetStateAction<TransportProcedure[]>>;
  departments: Department[];
  areas: Area[];
}

function TransportComponent({
  mode, // "form", "details", o "user"
  onStateChange,
  procedure,
  setProcedures,
  departments,
  areas,
}: TransportComponentProps) {
  const { register, handleSubmit, reset, watch } = useForm<TransportFormData>();
  const [procedureT, setProcedureT] = useState<TransportProcedure>(procedure);
  const [editable, setEditable] = useState(mode === "form" || (mode === "user" && procedure?.state === "PENDIENTE"));
  
  const [procedureTypes, setProcedureTypes] = useState<TransportProcedureType[]>([]);
  const [plate, setPlate] = useState(procedure?.plate || "");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingState, setPendingState] = useState<NoteStateType | "">("");
  const [departureTime, setDepartureTime] = useState<Date | null>(null);
  const [returnTime, setReturnTime] = useState<Date | null>(null);
  const [roundTrip, setRoundTrip] = useState(procedure?.round_trip || false);

  // Nuevo: Estado para el área seleccionada
  const selectedArea = watch("area");

  // Filtrar departamentos asociados al área seleccionada
  const filteredDepartments = selectedArea
    ? departments.filter(dep =>
        dep.area?.id == parseInt(selectedArea)
      )
    : [];

  useEffect(() => {
    const fetchProcedureTypes = async () => {
      try {
        const response = await getAllTransportProceduresTypes();
        setProcedureTypes(response.data);
      } catch (error) {
        console.error("Error al obtener los tipos de trámite de transporte:", error);
      }
    };

    fetchProcedureTypes();
    reset({
      procedure_type: procedureT?.procedure_type?.id?.toString() || "",
      departure_time: procedureT?.departure_time || "",
      return_time: procedureT?.return_time || "",
      departure_place: procedureT?.departure_place || "",
      return_place: procedureT?.return_place || "",
      passengers: procedureT?.passengers || 0,
      description: procedureT?.description || "",
      department: procedureT?.department?.id?.toString() || "",
      area: procedureT?.area?.id?.toString() || "",
      document: null, // Reiniciar el campo de archivo
    });
    if (mode === "details" || mode === "user") {
      setEditable(mode === "user" && procedureT?.state === "PENDIENTE");
      setPlate(procedureT?.plate || "");
      setDepartureTime(procedureT?.departure_time ? new Date(procedureT.departure_time) : null);
      setReturnTime(procedureT?.return_time ? new Date(procedureT.return_time) : null);
      setRoundTrip(procedureT?.round_trip || false);
    }
  }, [procedureT, mode, reset]);

  const handleUpdatePlate = async () => {
    try {
      await patchTransportProcedure(procedureT.id, { plate });
      setProcedureT((prevProcedure) => ({ ...prevProcedure, plate }));
      toast.success("Matrícula actualizada correctamente");
    } catch (error) {
      toast.error("Error al actualizar la matrícula");
      console.error("Error al actualizar la matrícula:", error);
    }
  };

  const handleStateChange = async (newState: NoteStateType) => {
    if (mode === "user") return;
    const currentState = procedureT.state;

    // Definir las transiciones permitidas
    const allowedTransitions: Record<NoteStateType, NoteStateType[]> = {
      PENDIENTE: ["APROBADO", "RECHAZADO"],
      APROBADO: ["CANCELADO", "FINALIZADO"],
      CANCELADO: [],
      RECHAZADO: [],
      FINALIZADO: [],
    };

    // Verificar si la transición es válida
    if (!allowedTransitions[currentState].includes(newState)) {
      toast.error(`No se puede cambiar el estado de ${capitalize(currentState)} a ${capitalize(newState)}`);
      return;
    }

    // Abrir el diálogo para agregar una nota
    setPendingState(newState);
    setIsDialogOpen(true);
  };

  const handleDialogConfirm = async (description: string, plateInput: string) => {
    setIsDialogOpen(false);

    const payload: Partial<TransportProcedure> = { state: pendingState as NoteStateType };
    if (description) {
      payload.notes = [
        ...procedure.notes,
        { id: Date.now(), state: pendingState as NoteStateType, description },
      ];
    }
    if (pendingState === "APROBADO" && plateInput) {
      payload.plate = plateInput;
    }

    await toast.promise(
      patchTransportProcedure(procedure.id, payload)
        .then(() => {
          onStateChange?.(pendingState as string);
          setProcedures?.((prevProcedures) =>
            prevProcedures.map((p) =>
              p.id === procedure.id
                ? { ...p, state: pendingState as NoteStateType, ...(pendingState === "APROBADO" ? { plate: plateInput } : {}) }
                : p
            )
          );
        }),
      {
        loading: "Cambiando estado...",
        success: <b>Estado cambiado a "{capitalize(pendingState as string)}" exitosamente.</b>,
        error: <b>Error al cambiar el estado del trámite.</b>,
      }
    );
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const onSubmit = async (data: TransportFormData) => {
    try {
      const { document, ...restData } = data;
      let response;

      // Formatea las fechas si existen
      const formattedDepartureTime = departureTime
        ? format(departureTime, "yyyy-MM-dd HH:mm")
        : "";
      const formattedReturnTime = returnTime
        ? format(returnTime, "yyyy-MM-dd HH:mm")
        : "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        ...restData,
        plate,
        departure_time: formattedDepartureTime,
        return_time: formattedReturnTime,
        round_trip: roundTrip,
        nombre_tramite: "Trámite de Transporte" as const,
      };

      if (mode === "user" && editable) {
        response = await toast.promise(
          patchTransportProcedure(procedure.id, payload),
          {
            loading: "Actualizando trámite...",
            success: <b>Trámite de transporte actualizado exitosamente</b>,
            error: <b>Error al actualizar el trámite de transporte</b>,
          }
        );
        setProcedures?.((prevProcedures) =>
          prevProcedures.map((p) =>
            p.id === procedure.id ? { ...p, ...payload } : p
          )
        );
      } else {
        response = await toast.promise(
          createTransportProcedure(payload),
          {
            loading: "Creando trámite...",
            success: <b>Trámite de transporte creado exitosamente</b>,
            error: <b>Error al crear el trámite de transporte</b>,
          }
        );
        reset();
        setPlate("");
      }

      if (document && document[0]) {
        const submissionData = new FormData();
        submissionData.append("document", document[0]);
        await toast.promise(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          patchTransportProcedure(response.data.id, submissionData as any),
          {
            loading: "Agregando documento...",
            success: <b>Documento agregado exitosamente</b>,
            error: <b>Error al agregar el documento</b>,
          }
        );
      }
    } catch (error) {
      console.error(
        mode === "user" && editable
          ? "Error al actualizar el trámite de transporte:"
          : "Error al crear el trámite de transporte:",
        error
      );
    }
  };

  // Validación visual with toast
  const handleReturnTimeChange = (date: Date | null) => {
    if (departureTime && date && date.getTime() <= departureTime.getTime()) {
      toast.error("La fecha y hora de regreso debe ser posterior a la de salida.");
      setReturnTime(null);
      return;
    }
    setReturnTime(date);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      <FormContainer>
        <Title>
          {mode === "form" ? "Trámite de Transporte" : "Detalles del Trámite de Transporte"}
        </Title>

        {mode !== "form" && (
          <>
            <StateBar
              currentState={procedure.state}
              onStateChange={handleStateChange}
              readOnly={mode === "user"} // Barra de estado en modo "read-only" si es "user"
            />
            <StateChangeDialog
              isOpen={isDialogOpen}
              onClose={handleDialogClose}
              onConfirm={handleDialogConfirm}
              newState={capitalize(pendingState)}
              requirePlate={pendingState === "APROBADO"}
            />
          </>
        )}

        {procedure?.notes && procedure?.notes.length > 0 && (
          <NotesContainer>
            <NotesTitle>Notas</NotesTitle>
            <NotesList>
              {procedure.notes.map((note, index) => (
                <NoteItem key={index}>
                  <NoteState>Estado:</NoteState> {capitalize(note.state)} <br />
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
            <label>Tipo de Transporte</label>
            <select
              {...register("procedure_type")}
              defaultValue={editable && mode === "user" ? procedure?.procedure_type?.id : undefined}
              value={!editable ? procedure?.procedure_type?.id : undefined}
              disabled={mode === "details" || !editable}
            >
              <option value="">Seleccione un tipo de Transporte</option>
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
                defaultValue={procedure?.department?.id || ""}
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

          <FieldGrid>
            <FieldContainer>
              {mode === "details" ? (
                <>
                  <label>Hora de Salida</label>
                  <div>
                    {procedure?.departure_time
                      ? format(new Date(procedure.departure_time), "yyyy-MM-dd HH:mm")
                      : "No especificada"}
                  </div>
                </>
              ) : (
                <DateTimePicker
                  label="Hora de Salida"
                  value={departureTime}
                  onChange={setDepartureTime}
                  minDateTime={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                  disabled={(mode as string) === "details" || !editable}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              )}
            </FieldContainer>
            <FieldContainer>
              
              {mode === "details" ? (
                <>
                  <label>Hora de Regreso</label>
                  <div>
                    {procedure?.return_time
                      ? format(new Date(procedure.return_time), "yyyy-MM-dd HH:mm")
                      : "No especificada"}
                  </div>
                </>
              ) : (
                <DateTimePicker
                  label="Hora de Regreso"
                  value={returnTime}
                  onChange={handleReturnTimeChange}
                  minDateTime={
                    departureTime
                      ? new Date(departureTime.getTime() + 60 * 1000) // +1 minuto para evitar igual
                      : new Date(Date.now() + 24 * 60 * 60 * 1000)
                  }
                  disabled={!departureTime || (mode as string) === "details" || !editable}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              )}
            </FieldContainer>
          </FieldGrid>

          <FieldContainer>
            <label>Lugar de Salida</label>
            <input
              type="text"
              {...register("departure_place")}
              defaultValue={editable && mode === "user" ? procedure?.departure_place : undefined}
              value={!editable ? procedure?.departure_place : undefined}
              disabled={mode === "details" || !editable}
            />
          </FieldContainer>

          <FieldContainer>
            <label>Lugar de Destino</label>
            <input
              type="text"
              {...register("return_place")}
              defaultValue={editable && mode === "user" ? procedure?.return_place : undefined}
              value={!editable ? procedure?.return_place : undefined}
              disabled={mode === "details" || !editable}
            />
          </FieldContainer>

          <FieldGrid>
            <FieldContainer>
              <label>Número de Pasajeros</label>
              <input
                type="number"
                {...register("passengers", { valueAsNumber: true })}
                defaultValue={editable && mode === "user" ? procedure?.passengers : undefined}
                value={!editable ? procedure?.passengers : undefined}
                disabled={mode === "details" || !editable}
              />
            </FieldContainer>
            <FieldContainer>
              <label className="check">
                <input
                  type="checkbox"
                  checked={roundTrip}
                  onChange={e => setRoundTrip(e.target.checked)}
                  disabled={mode === "details" || !editable}
                />
                {" "}¿Viaje de ida y vuelta?
              </label>
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

          {/* Matrícula */}
          {mode === "details" && (
            <FieldContainer>
              <label>Matrícula</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="Ingrese la matrícula"
                />
                <SubmitButton type="button" onClick={handleUpdatePlate}>
                  Actualizar
                </SubmitButton>
              </div>
            </FieldContainer>
          )}

          {procedure?.document && (
            <FieldGrid> 
              <FieldContainer>
                <label>Documento</label>
                <a href={procedure.document} target="_blank" rel="noopener noreferrer">
                  Ver Documento
                </a>
              </FieldContainer>
              {
                procedure?.plate && editable && (
                  <FieldContainer>
                    <label>Matrícula</label>
                    <input
                      type="text"
                      value={procedure.plate}
                      disabled
                    />
                  </FieldContainer>
                )
              }
            </FieldGrid>
          )}

          

          {editable && (
            <FieldContainer>
              <label>Documento (opcional)</label>
              <input type="file" {...register("document")} />
            </FieldContainer>
          )}

          {mode === "form" && <SubmitButton type="submit">Enviar</SubmitButton>}
          {mode === "user" && editable && (
            <SubmitButton type="submit">
              Guardar Cambios
            </SubmitButton>
          )}

          {mode === "details" && (
            <PrintButton
              href={getTransportProcedurePDFUrl(procedure.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Imprimir PDF
            </PrintButton>
          )}

        </form>
      </FormContainer>
    </LocalizationProvider>
  );
}

export default TransportComponent;