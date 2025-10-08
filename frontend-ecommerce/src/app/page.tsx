'use client'; // Directiva para indicar que este es un componente de cliente

import { useEffect } from 'react';

export default function Home() {

  // useEffect se ejecuta cuando el componente se carga en el navegador
  useEffect(() => {
    console.log("Intentando obtener productos desde la API...");

    // Hacemos una llamada fetch al endpoint público de tu backend
    fetch('https://api.localhost/api/productos')
      .then(response => {
        if (!response.ok) {
          throw new Error('La respuesta de la red no fue exitosa');
        }
        return response.json();
      })
      .then(data => {
        console.log("¡Productos recibidos con éxito!", data);
      })
      .catch(error => {
        console.error("Error al obtener los productos:", error);
      });
  }, []); // El array vacío asegura que esto solo se ejecute una vez

  return (
    <main>
      <h1>Simulacro de E-commerce (PWA)</h1>
      <p>Abre la consola del desarrollador (F12) para ver los resultados de la llamada a la API.</p>
    </main>
  );
}