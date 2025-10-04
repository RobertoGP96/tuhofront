import styled from "styled-components";
import { FaTrash } from "react-icons/fa";
import { DeleteButton } from "../../styles/styles";


const GuestTableContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 10px;
  margin-bottom: 10px;
  width: 100%;

  input,
  select {
    padding: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    outline: none;

    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 5px rgba(0, 82, 150, 0.5);
    }
  }
`;

interface Guest {
  name: string;
  sex: string;
  identification: string;
}

interface GuestTableProps {
  guests: Guest[];
  handleGuestChange: (index: number, field: keyof Guest, value: string) => void;
  addGuest: () => void;
  removeGuest: (index: number) => void;
  editable?: boolean;
}

function GuestTable({
  guests,
  handleGuestChange,
  addGuest,
  removeGuest,
  editable = true,
}: GuestTableProps) {
  return (
    <div>
      {editable && (
        <button
          type="button"
          onClick={addGuest}
          style={{
            backgroundColor: "var(--primary)",
            color: "#fff",
            border: "none",
            padding: "10px 15px",
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px",
          }}
        >
          Agregar Huesped
        </button>
      )}
      {guests.map((guest, index) => (
        <GuestTableContainer key={index}>
          <input
            type="text"
            placeholder="Nombre y Apellidos"
            value={guest.name}
            onChange={(e) => handleGuestChange(index, "name", e.target.value)}
            disabled={!editable}
          />
          <select
            value={guest.sex}
            onChange={(e) => handleGuestChange(index, "sex", e.target.value)}
            disabled={!editable}
          >
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
          </select>
          <input
            type="text"
            placeholder="Carnet de Identidad"
            value={guest.identification}
            onChange={(e) =>
              handleGuestChange(index, "identification", e.target.value)
            }
            disabled={!editable}
          />
          {editable && (
            <DeleteButton
              onClick={() => removeGuest(index)}
            >
              <FaTrash />
            </DeleteButton>
          )}
        </GuestTableContainer>
      ))}
    </div>
  );
}

export default GuestTable;