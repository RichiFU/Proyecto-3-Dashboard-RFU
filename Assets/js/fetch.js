// Exportar funciones que consumen una api

// Funcion api de dolar
export const fetchDollarData = async () => {
    const response = await fetch("https://mindicador.cl/api/dolar");
    const data = await response.json();
    return data;
};

// Funcion api de euro
export const fetchEuroData = async () => {
    const response = await fetch("https://mindicador.cl/api/euro");
    const data = await response.json();
    return data;
};