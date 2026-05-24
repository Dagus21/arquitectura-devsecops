import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    stages: [
        { duration: '1m', target: 200 }, // Sube a 200
        { duration: '1m', target: 400 }, // Sube a 400
        { duration: '1m', target: 600 }, // Sube a 600 (Aquí el VPS de Contabo debería sufrir)
        { duration: '30s', target: 0 },  // Fin de la prueba
    ]
};

export default function () {
    let res = http.get('https://miscelaneasdavid.shop/');
    
    // Aquí medimos la "Tasa de Error"
    check(res, { 
        'Estado Normal (200)': (r) => r.status === 200,
        'Protección WAF / Rate Limit (429/403)': (r) => r.status === 429 || r.status === 403,
        'Colapso del Servidor (500/502/504)': (r) => r.status >= 500 
    });
    sleep(1); // Importante dejar este sleep de 1 seg para medir el RPS real por usuario
}

export function handleSummary(data) {
    return { "reporte_3_Punto_Quiebre.html": htmlReport(data, { title: 'Escenario 3: Punto de Quiebre' }) };
}