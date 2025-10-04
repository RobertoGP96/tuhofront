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
import Table from "./Table";
import GuestTable from "./GuestTable";
import StateBar from "./StateBar";
import StateChangeDialog from "./StateChangeDialog";
import {
  createAccommodationProcedure,
  patchAccommodationProcedure,
  getAccommodationProcedurePDFUrl,
} from "../../services/internal/internal.procedures.api";
import { toast } from "react-hot-toast";
import { capitalize } from "../../services/internal/utils";
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { AccommodationProcedure } from "../../types/internal/accomodation";
import type { Area, Department, Guest, NoteState as NoteStateType } from "../../types/internal/general";

interface AccommodationFormData {
  accommodation_type: string;
  start_day: string;
  end_day: string;
  description: string;
  department: string;
  area: string;
  document: FileList | null;
}

interface AccomodationComponentProps {
  mode: "form" | "details" | "user";
  procedure: AccommodationProcedure;
  onStateChange?: (newState: string) => void;
  setProcedures: React.Dispatch<React.SetStateAction<AccommodationProcedure[]>>;
  departments: Department[];
  areas: Area[];
}

function AccommodationComponent({
  mode = "form", // "form", "details", o "user"
  procedure,
  onStateChange,
  setProcedures,
  departments,
  areas,
}: AccomodationComponentProps) {
  const { register, handleSubmit, reset, watch } = useForm<AccommodationFormData>();
  const [feedingDays, setFeedingDays] = useState(procedure?.feeding_days || []);
  const [guests, setGuests] = useState(procedure?.guests || []);
  const [editable, setEditable] = useState(mode === "form" || (mode === "user" && procedure?.state === "PENDIENTE"));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingState, setPendingState] = useState<NoteStateType>("PENDIENTE");
  const [startDay, setStartDay] = useState(procedure?.start_day ? new Date(procedure.start_day) : null);
  const [endDay, setEndDay] = useState(procedure?.end_day ? new Date(procedure.end_day) : null);
  const [showFeedingDays, setShowFeedingDays] = useState(false);

  useEffect(() => {
    reset({
      accommodation_type: procedure?.accommodation_type || "",
      start_day: procedure?.start_day || "",
      end_day: procedure?.end_day || "",
      description: procedure?.description || "",
      department: procedure?.department?.id?.toString() || "",
      area: procedure?.area?.id?.toString() || "",
      document: null, // Reiniciar el campo de archivo
    });
    if (mode === "details" || mode === "user") {
      setFeedingDays(procedure?.feeding_days || []);
      setGuests(procedure?.guests || []);
      setEditable(mode === "user" && procedure?.state === "PENDIENTE");
      setStartDay(procedure?.start_day ? new Date(procedure.start_day) : null);
      setEndDay(procedure?.end_day ? new Date(procedure.end_day) : null);
    }
  }, [procedure, mode, reset]);


  useEffect(() => {
    if (guests.length > 0) {
      setFeedingDays((prevFeedingDays) =>
        prevFeedingDays.map((day) => ({
          ...day,
          breakfast: guests.length,
          lunch: guests.length,
          dinner: guests.length,
          snack: guests.length,
        }))
      );
    }
  }, [guests]);

  const addGuest = () => {
    setGuests([...guests, { name: "", sex: "M", identification: "" }]);
  };

  const handleGuestChange = (index: number, field: keyof Guest, value: string) => {
    const updatedGuests = [...guests];
    updatedGuests[index] = { ...updatedGuests[index], [field]: value };
    setGuests(updatedGuests);
  };

  const handleStateChange = async (newState: NoteStateType) => {
    if (mode === "user") return;
    const currentState = procedure.state;

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

  const handleDialogConfirm = async (description: string) => {
    setIsDialogOpen(false);

    const payload: Partial<AccommodationProcedure> = { state: pendingState };
    if (description) {
      payload.notes = [
        ...procedure.notes,
        { id: Date.now(), state: pendingState, description },
      ];
    }

    if (procedure && procedure.id) {

      await toast.promise(
        patchAccommodationProcedure(procedure.id, payload)
          .then(() => {
            onStateChange?.(pendingState);
            setProcedures((prevProcedures) =>
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
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleStartDayChange = (date: Date | null) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minStart = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    if (date < minStart) {
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

  const onSubmit = async (data: AccommodationFormData) => {
    try {
      const { document, ...restData } = data;
      let response;

      const formattedStartDay = startDay ? startDay.toISOString().split("T")[0] : "";
      const formattedEndDay = endDay ? endDay.toISOString().split("T")[0] : "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        ...restData,
        start_day: formattedStartDay,
        end_day: formattedEndDay,
        guests: guests,
        nombre_tramite: "Trámite de Hospedaje" as const,
      };

      if (showFeedingDays) {
        payload.feeding_days = feedingDays;
      }

      if (mode === "user" && editable && procedure.id) {
        response = await toast.promise(
          patchAccommodationProcedure(procedure.id, payload),
          {
            loading: "Actualizando trámite...",
            success: <b>Trámite de hospedaje actualizado exitosamente</b>,
            error: <b>Error al actualizar el trámite de hospedaje</b>,
          }
        );
        setProcedures((prevProcedures) =>
          prevProcedures.map((p) =>
            p.id === procedure.id ? { ...p, ...payload } : p
          )
        );
      } else {
        response = await toast.promise(
          createAccommodationProcedure(payload),
          {
            loading: "Creando trámite...",
            success: <b>Trámite de hospedaje creado exitosamente</b>,
            error: <b>Error al crear el trámite de hospedaje</b>,
          }
        );
        reset();
        setFeedingDays([]);
        setGuests([]);
      }

      if (document && document[0]) {
        const submissionData = new FormData();
        submissionData.append("document", document[0]);
        await toast.promise(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          patchAccommodationProcedure(response.data.id as number, submissionData as any),
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
          ? "Error al actualizar el trámite de hospedaje:"
          : "Error al crear el trámite de hospedaje:",
        error
      );
    }
  };

  // Nuevo: Estado para el área seleccionada
  const selectedArea = watch("area");

  // Filtrar departamentos asociados al área seleccionada
  const filteredDepartments = selectedArea
    ? departments.filter(dep =>
      dep.area?.id == parseInt(selectedArea)
    )
    : [];

  useEffect(() => {
    if (startDay && endDay && guests.length > 0) {
      const days = [];
      const start = new Date(startDay);
      const end = new Date(endDay);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        days.push({
          date: new Date(d),
          breakfast: guests.length,
          lunch: guests.length,
          dinner: guests.length,
          snack: guests.length,
        });
      }
      setFeedingDays(days);
    } else {
      setFeedingDays([]);
    }
  }, [startDay, endDay, guests]);

  return (
    <FormContainer>
      <Title>
        {mode === "form" ? "Trámite de Hospedaje" : "Detalles del Trámite de Hospedaje"}
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
            requirePlate={pendingState === "FINALIZADO"}
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
          <label>Tipo de Hospedaje</label>
          <select
            {...register("accommodation_type")}
            defaultValue={editable && mode === "user" ? procedure?.accommodation_type : undefined}
            value={!editable ? procedure?.accommodation_type : undefined}
            disabled={mode === "details" || !editable}
          >
            <option value="">Seleccione un tipo de Hospedaje</option>
            <option value="A">Instalaciones Hoteleras</option>
            <option value="B">Hotelito de posgrado de la UHO</option>
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
                  disabled={(mode as string) === "details" || !editable || !startDay}
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
          <label>Huéspedes</label>
          <GuestTable
            guests={guests}
            handleGuestChange={handleGuestChange}
            addGuest={addGuest}
            editable={mode === "form" || editable}
            removeGuest={(index) => {
              setGuests(prev => prev.filter((_, i) => i !== index));
            }}
          />
        </FieldContainer>

        {editable && <FieldContainer>
          <label className="check">
            <input
              type="checkbox"
              checked={showFeedingDays}
              onChange={e => setShowFeedingDays(e.target.checked)}
              disabled={mode === "details" || !editable}
            />
            {" "}¿Requiere alimentación?
          </label>
        </FieldContainer>}

        {showFeedingDays && feedingDays.length > 0 && (
          <FieldContainer>
            <label>Días de Alimentación</label>
            <Table
              data={feedingDays}
              setData={setFeedingDays}
              editable={mode === "form" || editable}
              ammount={guests.length}
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

        {mode === "details" && procedure?.id && (
          <PrintButton
            href={getAccommodationProcedurePDFUrl(procedure.id)}
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

export default AccommodationComponent;