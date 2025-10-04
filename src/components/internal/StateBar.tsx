import { StateBarContainer, StateButton } from "../../styles/styles";
import type { NoteState } from "../../types/internal/general";

type StateBarProps = {
  currentState: NoteState;
  onStateChange: (state: NoteState) => void;
  readOnly?: boolean;
};

type stateOption= {
  name: string,
  value: NoteState
}

function StateBar({ currentState, onStateChange, readOnly = false }: StateBarProps) {
  const states:stateOption[] = [
    { name: "Pendiente", value: "PENDIENTE" },
    { name: "Aprobado", value: "APROBADO" },
    { name: "Cancelado", value: "CANCELADO" },
    { name: "Rechazado", value: "RECHAZADO" },
    { name: "Finalizado", value: "FINALIZADO" },
  ];

  return (
    <StateBarContainer>
      {states.map((state) => (
        <StateButton
          key={state.value}
          $active={currentState === state.value}
          onClick={() => !readOnly && onStateChange(state.value)} // Deshabilitar cambios si es "read-only"
        >
          {state.name}
        </StateButton>
      ))}
    </StateBarContainer>
  );
}

export default StateBar;