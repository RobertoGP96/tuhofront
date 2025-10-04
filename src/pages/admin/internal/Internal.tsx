import {useEffect, useState} from "react";
import styled from "styled-components";


import { useParams } from "react-router-dom";
import { getAllAreas, getAllDepartments } from "../../../services/internal/internal.procedures.api";
import FeedingComponent from "../../../components/internal/FeedingComponent";
import AccommodationComponent from "../../../components/internal/AccommodationComponent";
import TransportComponent from "../../../components/internal/TransportComponent";
import MaintanceComponent from "../../../components/internal/MaintanceComponent";
import type { Area, Department } from "../../../types/internal/general";
import type { FeedingProcedure } from "../../../types/internal/feeding";
import type { AccommodationProcedure } from "../../../types/internal/accomodation";
import type { TransportProcedure } from "../../../types/internal/transport";
import type { MaintanceProcedure } from "../../../types/internal/mantenice";

const MainContainer = styled.div`
  display: flex;
  height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const Footer = styled.footer`
  text-align: center;
  padding: 10px 0;
  background-color: #f8f9fa;
  color: #000;
`;

function Internal() {
  const params = useParams()
  const [departments, setDepartments] = useState<Department[]>([])
  const [areas, setAreas] = useState<Area[]>([])
  
  // Estados para manejar los procedimientos
  const [feedingProcedures, setFeedingProcedures] = useState<FeedingProcedure[]>([])
  const [accommodationProcedures, setAccommodationProcedures] = useState<AccommodationProcedure[]>([])
  const [transportProcedures, setTransportProcedures] = useState<TransportProcedure[]>([])
  const [maintanceProcedures, setMaintanceProcedures] = useState<MaintanceProcedure[]>([])

  // Procedimientos iniciales vacíos para el modo form
  const createInitialFeedingProcedure = (): FeedingProcedure => ({
    id: 0,
    state: "PENDIENTE",
    user: null,
    department: departments[0] || { id: 0, name: "", area: null },
    area: areas[0] || { id: 0, name: "" },
    notes: [],
    nombre_tramite: "Trámite de Alimentación",
    feeding_type: "A",
    start_day: new Date().toISOString().split('T')[0],
    end_day: new Date().toISOString().split('T')[0],
    description: "",
    ammount: 0,
    feeding_days: [],
    document: ""
  })

  const createInitialAccommodationProcedure = (): AccommodationProcedure => ({
    id: 0,
    state: "PENDIENTE",
    user: null,
    department: departments[0] || { id: 0, name: "", area: null },
    area: areas[0] || { id: 0, name: "" },
    notes: [],
    nombre_tramite: "Tramite de Alojamiento",
    accommodation_type: "A",
    start_day: new Date().toISOString().split('T')[0],
    end_day: new Date().toISOString().split('T')[0],
    description: "",
    guests: [],
    feeding_days: [],
    document: ""
  })

  const createInitialTransportProcedure = (): TransportProcedure => ({
    id: 0,
    state: "PENDIENTE",
    user: null,
    department: departments[0] || { id: 0, name: "", area: null },
    area: areas[0] || { id: 0, name: "" },
    notes: [],
    nombre_tramite: "Tramite de Transporte",
    procedure_type: null,
    departure_time: new Date().toISOString(),
    return_time: new Date().toISOString(),
    departure_place: "",
    return_place: "",
    passengers: 1,
    description: "",
    plate: "",
    round_trip: false,
    document: ""
  })

  const createInitialMaintanceProcedure = (): MaintanceProcedure => ({
    id: 0,
    state: "PENDIENTE", 
    user: null,
    department: departments[0] || { id: 0, name: "", area: null },
    area: areas[0] || { id: 0, name: "" },
    notes: [],
    nombre_tramite: "Tramite de Mantenimiento",
    procedure_type: null,
    priority: null,
    description: "",
    picture: null,
    document: ""
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseDepartments = await getAllDepartments();
        const responseAreas = await getAllAreas();
        setDepartments(responseDepartments.data)
        setAreas(responseAreas.data)
      } catch (error) {
        console.error("Error al obtener los datos", error);
      }
    };

    fetchData();
  }, []);

  const renderForm = () => {
    switch (params.procedure) {
      case "feeding":
        return (
          <FeedingComponent 
            mode="form"
            procedure={createInitialFeedingProcedure()}
            setProcedures={setFeedingProcedures}
            departments={departments} 
            areas={areas}
          />
        );
      case "accommodation":
        return (
          <AccommodationComponent 
            mode="form"
            procedure={createInitialAccommodationProcedure()}
            setProcedures={setAccommodationProcedures}
            departments={departments} 
            areas={areas}
          />
        );
      case "transport":
        return (
          <TransportComponent 
            mode="form"
            procedure={createInitialTransportProcedure()}
            setProcedures={setTransportProcedures}
            departments={departments} 
            areas={areas}
          />
        );
      case "maintance":
        return (
          <MaintanceComponent 
            mode="form"
            procedure={createInitialMaintanceProcedure()}
            setProcedures={setMaintanceProcedures}
            departments={departments} 
            areas={areas}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MainContainer>
      <ContentContainer>
        {renderForm()}
        <Footer>Trámites Universidad de Holguín © 2024.</Footer>
      </ContentContainer>
    </MainContainer>
  );
}

export default Internal;