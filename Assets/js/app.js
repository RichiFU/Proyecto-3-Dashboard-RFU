// Importar las funciones desde fetch.js
import { fetchDollarData, fetchEuroData } from "./fetch.js";

// Se almacena fechas, valoresDolar y ValoresEuro en arreglos vacios
let fechas = [];
let valoresDolar = [];
let valoresEuro = [];
let chartInstance = null;  // La variable chartInstance se inicializa con el valor null

const rgbaRedColor = "rgba(255, 0, 0, 0.5)"; // Rojo
const rgbaBlueColor = "rgba(0, 0, 255, 0.5)"; // Azul
const rgbaOrangeColor = "rgba(255, 165, 0, 0.5)"; // Naranja
const rgbaGreenColor = "rgba(0, 128, 0, 0.5)"; // Verde

// Funcion para obtener las fechas de inicio y fin ingresadas por el usuario
function getSelectedDates() {
    const startDateInput = document.getElementById("startDate");
    const endDate = new Date(document.getElementById("endDate").value);

    let startDate;

    //  La fecha de inicio (startDate) se establecera en la fecha que el usuario seleccione
    if (startDateInput.value) {
        startDate = new Date(startDateInput.value);
    } else {
        const currentDate = new Date();
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        // Establece en el dia de inicio al 1er dia del mes actual
        startDateInput.valueAsDate = startDate; // Actualiza el valor del campo de fecha
    }

    return { startDate, endDate };
}

// Funcion para verificar el rango de fechas
function validarRangoFechas(startDate, endDate) {
    const unaSemanaEnMS = 7 * 24 * 60 * 60 * 1000; // Milisegundos en una semana
    const dosMesesEnMS = 60 * 24 * 60 * 60 * 1000; // Milisegundos en dos meses

    const diferenciaFechas = endDate - startDate;

    if (diferenciaFechas < unaSemanaEnMS) {
        // Menos de una semana, retorna falso
        return false;
    } else if (diferenciaFechas > dosMesesEnMS) {
        // Mas de dos meses, retorna falso
        return false;
    }

    // Rango valido, retorna verdadero
    return true;
}

// Funcion para filtrar los datos de la API por fecha
function filterDataByDateRange(data, startDate, endDate) {
    return data.serie.filter((item) => {
        const fecha = new Date(item.fecha); //Convierte la propiedad fecha de cada elemento en un objeto Date para poder comparar las fechas.
        // Compara la fecha de cada elemento (fecha) con la fecha de inicio (startDate) y la fecha de fin (endDate).
        return fecha >= startDate && fecha <= endDate;
    });
}

// Funcion que actualiza y personaliza el grafico para mostrar valores del dolar y euro con colores especificos basados en sus valores
function updateChart() {
    chartInstance.data.labels = fechas;
    chartInstance.data.datasets[0].data = valoresDolar; // se esta haciendo referencia al primer conjunto de datos 
    chartInstance.data.datasets[1].data = valoresEuro; // se esta haciendo referencia al segundo conjunto de datos 

    // Aplicar colores para el dolar (rojo y azul)
    chartInstance.data.datasets[0].backgroundColor = fechas.map((fecha) => {
        //Busca la posición (indice) de la fecha especifica en el arreglo fechas y la almacena en la constante valor
        const valor = valoresDolar[fechas.indexOf(fecha)];
        // Si el valor es mayor a 865 se pinta de color rojo, de lo contrario se pinta azul
        return valor > 865 ? rgbaRedColor : rgbaBlueColor;
    });

    // Aplicar colores para el euro (naranja y verde)
    chartInstance.data.datasets[1].backgroundColor = fechas.map((fecha) => {
        const valor = valoresEuro[fechas.indexOf(fecha)];
        return valor > 935 ? rgbaOrangeColor : rgbaGreenColor;
    });

    chartInstance.update();
}

// Funcion para eliminar la hora de las fechas
function formatDates(dates) {
    return dates.map((fecha) => fecha.slice(0, 10));
}

// Funcion para crear el gráfico
function createChart() {
    const ctx = document.getElementById("myChart");
    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels: fechas, // Eje X
            datasets: [
                {
                    label: "Valor Dólar en CLP",
                    data: valoresDolar, // Eje Y
                    borderWidth: 1.5,
                    backgroundColor: fechas.map((fecha) => {
                        const valor = valoresDolar[fechas.indexOf(fecha)];
                        return valor > 865 ? rgbaRedColor : rgbaBlueColor;
                    }),
                    borderColor: ["#000000"],
                },
                {
                    label: "Valor Euro en CLP",
                    data: valoresEuro, // Eje Y
                    borderWidth: 1.5,
                    backgroundColor: fechas.map((fecha) => {
                        const valor = valoresEuro[fechas.indexOf(fecha)];
                        return valor > 935 ? rgbaOrangeColor : rgbaGreenColor
                    }),
                    borderColor: ["#000000"],
                },
            ],
        },
        options: {
            responsive: true, // Habilita la opción de gráfico responsive
            maintainAspectRatio: false,
            // ...
            layout: {
                padding: 20,
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            plugins: {
                title: {
                    display: true,
                    text: "Precio Dólar y Euro",
                    font: {
                        size: 24,
                    },
                    padding: {
                        top: 20,
                        bottom: 30,
                    },
                },
                legend: {
                    labels: {
                        font: {
                            size: 20,
                        },
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            let label = context.dataset.label || "";
                            if (label) {
                                label += ": ";
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + "°";
                            }
                            return label;
                        },
                    },
                },
            },
        },
    });
}

// Funcion asincrona principal que se llama al momento de generar el grafico
async function renderData() {
    const { startDate, endDate } = getSelectedDates();

    // Si validarRangoFechas no cumple con la condicion:
    if (!validarRangoFechas(startDate, endDate)) {
        alert("El rango de fechas debe ser de al menos una semana y como máximo dos meses.");
        return;
    }


    // Obtener datos del dolar
    const dollarData = await fetchDollarData();
    const filteredDollarData = filterDataByDateRange(dollarData, startDate, endDate);
    fechas = formatDates(filteredDollarData.map((dolar) => dolar.fecha));
    valoresDolar = filteredDollarData.map((dolar) => dolar.valor);

    // Obtener datos del euro
    const euroData = await fetchEuroData();
    const filteredEuroData = filterDataByDateRange(euroData, startDate, endDate);
    valoresEuro = filteredEuroData.map((euro) => euro.valor);

    // Si chartInstance tiene un valor distinto a null, undefined o false.
    if (chartInstance) {
        updateChart(); // Se actualiza grafico

    } else {
        createChart(); // De lo contrario se crea un grafico
    }
}

// Evento de carga de la página
window.addEventListener("load", () => {
    const generateButton = document.getElementById("generateChart");
    generateButton.addEventListener("click", renderData);
});

// Llamar a renderData
renderData();
