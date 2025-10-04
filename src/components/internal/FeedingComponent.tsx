import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
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
  NoteDescription,
  PrintButton,
} from "../../styles/styles";
import Table from "./Table";
import StateBar from "./StateBar";
import StateChangeDialog from "./StateChangeDialog";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { capitalize } from "../../services/internal/utils";
import { createFeedingProcedure, getFeedingProcedurePDFUrl, patchFeedingProcedure } from "../../services/internal/internal.procedures.api";
import type { Area, Department, NoteState, ProcedureState } from "../../types/internal/general";
import type { FeedingDays, FeedingProcedure } from "../../types/internal/feeding";

interface FeedingFormData {
  feeding_type: string;
  start_day: string;
  end_day: string;
  description: string;
  ammount: number;
  department: string;
  area: string;
  document: FileList | null;
}

interface FeedingComponentProps {
  mode: "form" | "details" | "user";
  procedure: FeedingProcedure;
  onStateChange?: (newState: string) => void;
  setProcedures: React.Dispatch<React.SetStateAction<FeedingProcedure[]>>;
  departments: Department[];
  areas: Area[];
}

function FeedingComponent({
  mode,
  procedure,
  onStateChange,
  setProcedures,
  departments,
  areas,
}: FeedingComponentProps) {
  const { register, handleSubmit, reset, watch } = useForm<FeedingFormData>();
  const [feedingDays, setFeedingDays] = useState(procedure?.feeding_days || []);
  const [editable, setEditable] = useState(mode === "form" || (mode === "user" && procedure?.state === "PENDIENTE"));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingState, setPendingState] = useState<ProcedureState | "">("");
  const [startDay, setStartDay] = useState(procedure?.start_day ? new Date(procedure.start_day) : null);
  const [endDay, setEndDay] = useState(procedure?.end_day ? new Date(procedure.end_day) : null);
  const [ammount, setAmmount] = useState(procedure?.ammount || 0);

  // Nuevo: Estado para el área seleccionada
  const selectedArea = watch("area");

  // Filtrar departamentos asociados al área seleccionada
  const filteredDepartments = selectedArea
    ? departments.filter(dep =>
        dep.area?.id == parseInt(selectedArea)
      )
    : [];

  useEffect(() => {
    reset({
      feeding_type: procedure?.feeding_type || "",
      start_day: procedure?.start_day || "",
      end_day: procedure?.end_day || "",
      description: procedure?.description || "",
      ammount: procedure?.ammount || 0,
      department: procedure?.department?.id?.toString() || "",
      area: procedure?.area?.id?.toString() || "",
      document: null, // Reiniciar el campo de archivo
    });
    if (mode === "details" || mode === "user") {
      setFeedingDays(procedure?.feeding_days || []);
      setEditable(mode === "user" && procedure?.state === "PENDIENTE");
    }
  }, [procedure, mode, reset]);

  useEffect(() => {
    // Solo recalcula si todos los valores están definidos
    if (startDay && endDay && ammount) {
      const days: FeedingDays[] = [];
      const start = new Date(startDay);
      const end = new Date(endDay);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: d,
          breakfast: ammount,
          lunch: ammount,
          dinner: ammount,
          snack: ammount,
        });
      }
      setFeedingDays(days);
    } else {
      setFeedingDays([]);
    }
  }, [startDay, endDay, ammount]);

  const handleStateChange = async (newState: ProcedureState) => {
    if (mode === "user") return;
    const currentState = procedure?.state;

    // Definir las transiciones permitidas
    const allowedTransitions: Record<ProcedureState, ProcedureState[]> = {
      PENDIENTE: ["APROBADO", "RECHAZADO"],
      APROBADO: ["CANCELADO", "FINALIZADO"],
      CANCELADO: [],
      RECHAZADO: [],
      FINALIZADO: [],
    };

    // Verificar si la transición es válida
    if (!allowedTransitions[currentState as ProcedureState].includes(newState)) {
      toast.error(`No se puede cambiar el estado de ${capitalize(currentState as ProcedureState)} a ${capitalize(newState)}`);
      return;
    }

    // Abrir el diálogo para agregar una nota
    setPendingState(newState);
    setIsDialogOpen(true);
  };

  const handleDialogConfirm = async (description: string) => {
    setIsDialogOpen(false);

    const payload: Partial<FeedingProcedure> = { state: pendingState as ProcedureState };
    if (description) {
      payload.notes = [
        ...procedure.notes,
        { id: Date.now(), state: pendingState as ProcedureState, description },
      ];
    }

    await toast.promise(
      patchFeedingProcedure(procedure.id, payload)
        .then(() => {
          // Actualizar el estado del trámite en el frontend
          onStateChange?.(pendingState as string);
          setProcedures((prevProcedures) =>
            prevProcedures.map((p) =>
              p.id === procedure.id ? { ...p, state: pendingState as ProcedureState } : p
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

  const handleStartDayChange = (date: Date | null) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const minStart = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    if (date && date < minStart) {
      toast.error("La fecha de inicio debe ser al menos el día siguiente al actual.");
      setStartDay(null);
      return;
    }
    setStartDay(date);
    if (endDay && date && endDay <= date) {
      setEndDay(null);
    }
  };

  const handleEndDayChange = (date: Date | null) => {
    if (!startDay) {
      toast.error("Seleccione primero la fecha de inicio.");
      setEndDay(null);
      return;
    }
    if (!date) return;
    
    const minEnd = new Date(startDay.getTime() + 24 * 60 * 60 * 1000);
    if (date < minEnd) {
      toast.error("La fecha de fin debe ser al menos un día después de la fecha de inicio.");
      setEndDay(null);
      return;
    }
    setEndDay(date);
  };

  const onSubmit = async (data: FeedingFormData) => {
    try {
      const { document, ...restData } = data;
      let response;

      const formattedStartDay = startDay ? startDay.toISOString().split("T")[0] : "";
      const formattedEndDay = endDay ? endDay.toISOString().split("T")[0] : "";

      if (mode === "user" && editable) {
        // Actualizar el trámite existente
        if (typeof procedure?.id === "number") {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const patchPayload: any = {
            ...restData,
            start_day: formattedStartDay,
            end_day: formattedEndDay,
            feeding_days: feedingDays,
          };
          
          response = await toast.promise(
            patchFeedingProcedure(procedure.id, patchPayload),
            {
              loading: "Actualizando trámite...",
              success: <b>Trámite de alimentación actualizado exitosamente</b>,
              error: <b>Error al actualizar el trámite de alimentación</b>,
            }
          );
          setProcedures((prevProcedures) =>
            prevProcedures.map((p) =>
              p.id === procedure.id ? { ...p, ...patchPayload } : p
            )
          );
        } else {
          toast.error("No se puede actualizar el trámite: ID no definido.");
          return;
        }
      } else {
        // Crear un nuevo trámite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createPayload: any = {
          ...restData,
          description: restData.description,
          ammount: ammount,
          start_day: formattedStartDay,
          end_day: formattedEndDay,
          feeding_days: feedingDays,
          nombre_tramite: "Trámite de Alimentación",
        };
        
        response = await toast.promise(
          createFeedingProcedure(createPayload),
          {
            loading: "Creando trámite...",
            success: <b>Trámite de alimentación creado exitosamente</b>,
            error: <b>Error al crear el trámite de alimentación</b>,
          }
        );
        reset();
        setFeedingDays([]);
      }

      if (document && document[0]) {
        const submissionData = new FormData();
        submissionData.append("document", document[0]);
        await toast.promise(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          patchFeedingProcedure(response.data.id, submissionData as any),
          {
            loading: "Agregando documento...",
            success: <b>Documento agregado exitosamente</b>,
            error: <b>Error al agregar el documento</b>,
          }
        );
      }
    } catch (error) {
      // El error ya es manejado por toast.promise, pero puedes dejar el log para debug
      console.error(
        mode === "user" && editable
          ? "Error al actualizar el trámite de alimentación:"
          : "Error al crear el trámite de alimentación:",
        error
      );
    }
  };

  return (
    <FormContainer>
      <Title>
        {mode === "form" ? "Trámite de Alimentación" : "Detalles del Trámite de Alimentación"}
      </Title>

      {mode !== "form" && (
        <>
          <StateBar
            currentState={procedure?.state as NoteState}
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
                <span>
                  Estado:
                </span>
                {capitalize(note.state)} <br />
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
          <label>Tipo de Alimentación</label>
          <select
            {...register("feeding_type")}
            defaultValue={editable && mode === "user" ? procedure?.feeding_type : undefined}
            value={!editable ? procedure?.feeding_type : undefined}
            disabled={mode === "details" ? true : !editable}
          >
            <option value="" disabled>Seleccione un tipo de Alimentación</option>
            <option value="A">Restaurante Especializado</option>
            <option value="B">Hotelito de posgrado</option>
          </select>
        </FieldContainer>

        <FieldGrid>
          <FieldContainer>
            <label>Área</label>
            <select
              {...register("area")}
              defaultValue={procedure?.area?.id || ""}
              disabled={mode === "details" ? true : !editable}
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
              disabled={(!selectedArea && mode === "form") || mode === "details" || !editable}
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

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <FieldGrid>
            <FieldContainer>
              {mode === "details" ? (
                <>
                  <label>Fecha de Inicio</label>
                  <div>
                    {procedure?.start_day
                      ? new Date(procedure.start_day).toLocaleDateString()
                      : "No especificada"}
                  </div>
                </>
              ) : (
                <DatePicker
                  label="Fecha de Inicio"
                  value={startDay}
                  onChange={handleStartDayChange}
                  minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                  disabled={!editable}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              )}
            </FieldContainer>
            <FieldContainer>
              {mode === "details" ? (
                <>
                  <label>Fecha de Fin</label>
                  <div>
                    {procedure?.end_day
                      ? new Date(procedure.end_day).toLocaleDateString()
                      : "No especificada"}
                  </div>
                </>
              ) : (
                <DatePicker
                  label="Fecha de Fin"
                  value={endDay}
                  onChange={handleEndDayChange}
                  minDate={startDay ? new Date(startDay.getTime() + 24 * 60 * 60 * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000)}
                  disabled={!editable || !startDay}
                  slotProps={{
                    textField: { fullWidth: true }
                  }}
                />
              )}
            </FieldContainer>
          </FieldGrid>
        </LocalizationProvider>

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
          <label>Cantidad</label>
          <input
            type="number"
            {...register("ammount", { valueAsNumber: true })}
            defaultValue={editable && mode === "user" ? procedure?.ammount : undefined}
            value={editable ? ammount : procedure?.ammount || ""}
            disabled={mode === "details" || !editable}
            onChange={e => setAmmount(Number(e.target.value))}
          />
        </FieldContainer>

        {feedingDays.length > 0 && (
          <FieldContainer>
            <label>Días de Alimentación</label>
            <Table
              data={feedingDays}
              setData={setFeedingDays}
              editable={mode === "form" || editable}
              ammount={ammount}
            />
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
            href={getFeedingProcedurePDFUrl(procedure?.id as number)}
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

export default FeedingComponent;
