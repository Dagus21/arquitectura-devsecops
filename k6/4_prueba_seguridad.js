import http from 'k6/http';
import { check, sleep } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

// Escenario 4: Prueba de Seguridad, Resiliencia y WAF
export const options = {
    stages: [
        // Rampa de ataque súbita: Simulando un ataque DDoS o de Bots
        { duration: '30s', target: 200 }, 
        { duration: '1m', target: 500 },  // Ataque sostenido
        { duration: '30s', target: 0 },
    ]
};

export default function () {
    // Simulamos un bot intentando iniciar sesión masivamente (Fuerza Bruta)
    const url = 'https://miscelaneasdavid.shop/api/auth/login';
    const payload = JSON.stringify({
        username: 'hacker@bot.com',
        password: 'password123'
    });
    const params = {
        headers: { 'Content-Type': 'application/json' },
    };

    let res = http.post(url, payload, params);
    
    // Aquí el éxito NO es tener 200 OK. 
    // ¡El éxito arquitectónico es que Cloudflare devuelva 429 (Rate Limit) o 403 (Forbidden)!
    check(res, { 
        'Falla de Seguridad (Servidor Vulnerado - 200/401)': (r) => r.status === 200 || r.status === 401,
        'Protección WAF Exitosa (403/429)': (r) => r.status === 403 || r.status === 429,
        'Colapso del VPS (500/502/504)': (r) => r.status >= 500 
    });
    
    // Pausa mínima para bombardear rápidamente y hacer saltar el Rate Limit
    sleep(0.5); 
}

export function handleSummary(data) {
    return { "reporte_4_Seguridad_WAF.html": htmlReport(data, { title: 'Escenario 4: Prueba de Seguridad (DDoS y WAF Activado)' }) };
}