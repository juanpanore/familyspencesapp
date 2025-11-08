// Esta interfaz define el "contrato" de los datos
// que esperamos de la API

// Esto representa el JSON que tu API devuelve: { "ranking": { "Ana": 150, "Pedro": 80 } }
export interface RankingResponse {
  ranking: { [key: string]: number }; // Un objeto con llaves string y valores number
}

// Esto es lo que usaremos en el HTML para el podio
export interface RankingEntry {
  name: string;
  value: number;
}