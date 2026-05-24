import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    stages: [
        { duration: '30s', target: 100 }, // Sube rápido a 100 usuarios (Pico)
        { duration: '1m', target: 100 },  // Se mantiene el pico
        { duration: '30s', target: 0 },   // Baja
    ],
    thresholds: {
        'http_req_duration': ['p(95)<1000'], // Latencia esperada: menor a 1 segundo
        'http_req_failed': ['rate<0.05'],    // Tasa de error tolerada: < 5%
    },
};

export default function () {
    let res = http.get('https://miscelaneasdavid.shop/');
    check(res, { 
        'Servidor Responde OK (200)': (r) => r.status === 200 
    });
    sleep(1);
}

export function handleSummary(data) {
    return { "reporte_2_Pico_Trafico.html": htmlReport(data, { title: 'Escenario 2: Pico de Tráfico (Black Friday)' }) };
}