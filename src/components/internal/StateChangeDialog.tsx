import React from "react";
import {
  DialogOverlay,
  DialogContainer,
  DialogTitle,
  DialogTextArea,
  DialogButtons,
  DialogButton,
} from "../../styles/styles";

interface StateChangeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (description: string, plate: string) => void;
  newState: string;
  requirePlate: boolean;
}

const StateChangeDialog: React.FC<StateChangeDialogProps> = ({ isOpen, onClose, onConfirm, newState, requirePlate }) => {
  const [description, setDescription] = React.useState("");
  const [plate, setPlate] = React.useState("");

  const handleConfirm = () => {
    if (requirePlate && !plate.trim()) {
      alert("Debe ingresar la matrícula del vehículo.");
      return;
    }
    onConfirm(description.trim(), plate.trim());
    setDescription("");
    setPlate("");
  };

  const handleCancel = () => {
    setDescription(""); // Limpiar el campo después de cancelar
    setPlate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <DialogOverlay>
      <DialogContainer>
        <DialogTitle>Cambiar estado a "{newState}"</DialogTitle>
        <p>Opcional: Agrega una nota para este cambio de estado.</p>
        <DialogTextArea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Escribe una nota (opcional)"
        />
        {requirePlate && (
          <div style={{ margin: "16px 0" }}>
            <label>
              Matrícula del vehículo:
              <input
                type="text"
                value={plate}
                onChange={e => setPlate(e.target.value)}
                placeholder="Ej: B 123 456"
                style={{ marginLeft: 8, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
                maxLength={10}
              />
            </label>
          </div>
        )}
        <DialogButtons>
          <DialogButton onClick={handleCancel}>Cancelar</DialogButton>
          <DialogButton onClick={handleConfirm} $primary>
            Confirmar
          </DialogButton>
        </DialogButtons>
      </DialogContainer>
    </DialogOverlay>
  );
};

export default StateChangeDialog;