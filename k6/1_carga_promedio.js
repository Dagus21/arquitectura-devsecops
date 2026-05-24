import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export const options = {
    stages: [
        { duration: '30s', target: 20 }, // Sube a 20 usuarios
        { duration: '1m', target: 20 },  // Se mantiene 1 minuto
        { duration: '30s', target: 0 },  // Baja a 0
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'], // Latencia esperada: menor a 500ms
        'http_req_failed': ['rate<0.01'],   // Tasa de error esperada: < 1%
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
    return { "reporte_1_Carga_Promedio.html": htmlReport(data, { title: 'Escenario 1: Carga Promedio' }) };
}