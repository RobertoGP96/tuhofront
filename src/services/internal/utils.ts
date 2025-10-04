export function formatToDatetimeLocal(dateString:string) {
    if (!dateString) return ""; // Manejar valores nulos o indefinidos
  
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Mes en formato 2 dígitos
    const day = String(date.getDate()).padStart(2, "0"); // Día en formato 2 dígitos
    const hours = String(date.getHours()).padStart(2, "0"); // Horas en formato 2 dígitos
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Minutos en formato 2 dígitos
  
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

export const capitalize = (str:string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();