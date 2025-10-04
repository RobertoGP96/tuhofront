import { useState, useEffect } from "react";

import { getAllUserProcedures } from "../../services/internal/internal.procedures.api";
import UserSidebar from "../../components/internal/UserSidebar";
import FeedingComponent from "../../components/internal/FeedingComponent";
import AccommodationComponent from "../../components/internal/AccommodationComponent";
import TransportComponent from "../../components/internal/TransportComponent";
import MaintanceComponent from "../../components/internal/MaintanceComponent";

// Extended procedure with additional API fields
interface ApiProcedure {
  id: number;
  nombre_tramite: string;
  state: string;
  [key: string]: unknown;
}



function MyProcedures() {
  const [procedures, setProcedures] = useState<ApiProcedure[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<ApiProcedure | null>(null);
  const [departments] = useState([]);
  const [areas] = useState([]);

  useEffect(() => {
    const fetchProcedures = async () => {
      try {
        const response = await getAllUserProcedures(); // API para obtener todos los trámites del usuario
        setProcedures(response.data as unknown as ApiProcedure[]);
      } catch (error) {
        console.error("Error al obtener los trámites del usuario:", error);
      }
    };

    fetchProcedures();
  }, []);

  return (
    <div style={{ display: "flex" }}>
      <UserSidebar
        procedures={procedures as never}
        onProcedureSelect={(procedure) => setSelectedProcedure(procedure as unknown as ApiProcedure)}
        selectedProcedure={selectedProcedure as never}
      />
      <div style={{ flex: 1, padding: "20px" }}>
        {selectedProcedure ? (
          selectedProcedure.nombre_tramite === "Trámite de Alimentación" ? (
            <FeedingComponent
              procedure={selectedProcedure as never}
              mode="user"
              onStateChange={(newState: string) =>
                setSelectedProcedure({ ...selectedProcedure, state: newState } as ApiProcedure)
              }
              setProcedures={setProcedures as never}
              departments={departments} areas={areas}
            />
          ) : selectedProcedure.nombre_tramite === "Trámite de Hospedaje" ? (
            <AccommodationComponent
              procedure={selectedProcedure as never}
              mode="user"
              onStateChange={(newState: string) =>
                setSelectedProcedure({ ...selectedProcedure, state: newState } as ApiProcedure)
              }
              setProcedures={setProcedures as never}
              departments={departments} areas={areas}
            />
          ) : selectedProcedure.nombre_tramite === "Trámite de Transporte" ? (
            <TransportComponent
              procedure={selectedProcedure as never}
              mode="user"
              onStateChange={(newState: string) =>
                setSelectedProcedure({ ...selectedProcedure, state: newState } as ApiProcedure)
              }
              setProcedures={setProcedures as never}
              departments={departments} areas={areas}
            />
          ) : selectedProcedure.nombre_tramite === "Trámite de Mantenimiento" ? (
            <MaintanceComponent
              procedure={selectedProcedure as never}
              mode="user"
              onStateChange={(newState: string) =>
                setSelectedProcedure({ ...selectedProcedure, state: newState } as ApiProcedure)
              }
              setProcedures={setProcedures as never}
              departments={departments} areas={areas}
            />
          ) : (
            <div>Detalles del trámite no implementados</div>
          )
        ) : (
          <div>Seleccione un trámite para ver los detalles</div>
        )}
      </div>
    </div>
  );
}

export default MyProcedures;