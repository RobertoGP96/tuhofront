import styled from "styled-components";

export const MainContainer = styled.div`
  display: flex;
  height: 100vh;
`;

export const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

export const FormContainer = styled.div`
  background: #ffffff;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto 50px;
`;

export const Title = styled.h1`
  color: var(--primary);
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 20px;
`;

export const Text = styled.p`
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  margin: 20px 0;
`;

export const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: center;
`;

export const FieldContainer = styled.div`
  margin-bottom: 20px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
    color: var(--primary);
  }

  input,
  select,
  textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    outline: none;

    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 5px rgba(0, 82, 150, 0.5);
    }
  }

  textarea {
    resize: none;
    height: 100px;
  }

  .check {
    display: flex;
    align-items: center;

    input[type="checkbox"] {
      width: 50px;
    }

  }
`;

export const SubmitButton = styled.button`
  background-color: var(--primary);
  color: #ffffff;
  border: none;
  padding: 15px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  width: 100%;

  &:hover {
    background-color: #005296;
  }
`;

export const AddGuestButton = styled.button`
  background-color: var(--primary);
  color: #ffffff;
  border: none;
  padding: 10px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 10px;

  &:hover {
    background-color: #005296;
  }
`;

export const SidebarContainer = styled.div`
  width: 35%;
  display: flex;
  flex-direction: column;
  padding: 10px 0 0;
  margin: 0 auto;
  min-height: 100vh;
`;

export const TabsContainer = styled.div`
  display: flex;
`

export const Tab = styled.button`
  padding: 10px;
  cursor: pointer;
  border: none;
  color: ${(props) => (props.$active ? "var(--white)" : "var(--primary)")};
  background: none;
  font-weight: bold;
  background-color: ${(props) => (props.$active ? "var(--primary)" : "var(--white)")};
  border-top-right-radius: 20px;
  border-top-left-radius: 20px;
  width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all .3s ease-out;

  &:hover {
    background-color: var(--blue);
    color: var(--white);
  }
`;

export const ProcedureList = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--primary);
  padding: 10px;
`;

export const ProcedureItem = styled.div`
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
  background-color: ${(props) => (props.$selected ? "var(--white)" : "transparent")};
  color: ${(props) => (props.$selected ? "var(--primary)" : "var(--white)")};
  display: flex;
  align-items: center;
  transition: all .3s ease-out;

  &:hover {
    background-color: var(--white);
    color: var(--primary);
  }
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

export const StateBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

export const StateButton = styled.button`
  position: relative;
  padding: 10px 20px;
  width: 100%;
  border: none;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${(props) => (props.$active ? "white" : "#333")};
  background-color: ${(props) =>
    props.$active
      ? getStateColor(props.children, true)
      : getStateColor(props.children, false)};
  clip-path: polygon( 0 0, 10% 50%, 0 100%, 90% 100%, 100% 50%, 90% 0);
  margin-right: -15px; /* Superposición para conectar las flechas */
  z-index: ${(props) => (props.$active ? 1 : 0)};

  &:hover {
    background-color: ${(props) => getStateColor(props.children, true)};
    color: white;
  }

  &:first-child {
    clip-path: polygon(0 0,90% 0,100% 50%,90% 100%,0 100%,0 0);
  }

  &:last-child {
    margin-right: 0; /* El último botón no necesita superposición */
    clip-path: polygon(0 0,10% 50%,0 100%,100% 100%,100% 0);
  }
`;

/* Función para asignar colores según el estado */
const getStateColor = (state, active) => {
  switch (state) {
    case "Pendiente":
      return active ? "#FFC107" : "#FFF"; // Amarillo
    case "Aprobado":
      return active ? "#28A745" : "#FFF"; // Verde
    case "Finalizado":
      return active ? "#6C757D" : "#FFF"; // Gris
    case "Cancelado":
      return active ? "#DC3545" : "#FFF"; // Rojo
    case "Rechazado":
      return active ? "#DC3545" : "#FFF"; 
    default:
      return active ? "#007BFF" : "#FFF"; // Azul por defecto
  }
};



// Estilos para el diálogo
export const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const DialogContainer = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

export const DialogTitle = styled.h2`
  color: var(--primary);
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

export const DialogTextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  resize: none;
  height: 100px;
  margin-bottom: 20px;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 5px rgba(0, 82, 150, 0.5);
  }
`;

export const DialogButtons = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

export const DialogButton = styled.button`
  background-color: ${(props) => (props.$primary ? "var(--primary)" : "#ddd")};
  color: ${(props) => (props.$primary ? "#ffffff" : "#333")};
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 5px;
  flex: 1;

  &:hover {
    background-color: ${(props) => (props.$primary ? "#005296" : "#ccc")};
  }
`;



// Estilos para el contenedor de notas
export const NotesContainer = styled.div`
  margin-block: 20px;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

// Título de las notas
export const NotesTitle = styled.h3`
  color: var(--primary);
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 15px;
`;

// Lista de notas
export const NotesList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

// Elemento individual de la lista de notas
export const NoteItem = styled.li`
  margin-bottom: 15px;
  padding: 10px;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }
`;

// Texto del estado en la nota
export const NoteState = styled.span`
  font-weight: bold;
  color: var(--primary);
`;

// Texto de la descripción en la nota
export const NoteDescription = styled.p`
  margin: 5px 0 0;
  font-size: 1.2 rem;
`;


// Sección de configuración
export const ConfigSection = styled.div`
  margin-bottom: 40px;
`;

// Título de la sección
export const ConfigTitle = styled.h2`
  color: var(--primary);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
`;

// Lista de elementos de configuración
export const ConfigList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

// Elemento individual de la lista
export const ConfigItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;

  &:last-child {
    border-bottom: none;
  }
`;

export const PrintButton = styled.a`
  background-color: var(--primary);
  color: #ffffff;
  text-decoration: none;
  border: none;
  padding: 10px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 10px;

  &:hover {
    background-color: #005296;
  }
`