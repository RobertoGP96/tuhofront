import styled from "styled-components";
import { toast } from "react-hot-toast";
import type { FeedingDays } from "../../types/internal/feeding";

const TableContainer = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  th {
    background-color: var(--primary);
    color: white;
  }
`;

function Table({data, setData, editable, ammount}:{ data:FeedingDays[], setData:(newData: FeedingDays[])=>void, editable: boolean, ammount:number }) {
  type FeedingField = "breakfast" | "lunch" | "dinner" | "snack";

  const handleInputChange = (index: number, field: FeedingField, value: number) => {
    // Validar que el valor no sea mayor que ammount
    if (ammount && Number(value) > Number(ammount)) {
      toast.error(`No puede ingresar un número mayor a la cantidad de huéspedes (${ammount})`);
      return;
    }
    const updatedData = [...data];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    };
    setData(updatedData);
  };

  const sorted_data = data.sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <TableContainer>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Desayuno</th>
          <th>Almuerzo</th>
          <th>Cena</th>
          <th>Merienda</th>
        </tr>
      </thead>
      <tbody>
        {sorted_data.map((row, index) => (
          <tr key={index}>
            <td>{row.date.toDateString()}</td>
            <td>
              <input
                type="number"
                value={row.breakfast}
                onChange={(e) =>
                  handleInputChange(index, "breakfast", Number(e.target.value))
                }
                disabled={!editable}
                min={0}
                max={ammount || undefined}
              />
            </td>
            <td>
              <input
                type="number"
                value={row.lunch}
                onChange={(e) =>
                  handleInputChange(index, "lunch", Number(e.target.value))
                }
                disabled={!editable}
                min={0}
                max={ammount || undefined}
              />
            </td>
            <td>
              <input
                type="number"
                value={row.dinner}
                onChange={(e) =>
                  handleInputChange(index, "dinner", Number(e.target.value))
                }
                disabled={!editable}
                min={0}
                max={ammount || undefined}
              />
            </td>
            <td>
              <input
                type="number"
                value={row.snack}
                onChange={(e) =>
                  handleInputChange(index, "snack", Number(e.target.value))
                }
                disabled={!editable}
                min={0}
                max={ammount || undefined}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </TableContainer>
  );
}

export default Table;