# Anexo B. Runbook de Operaciones y Despliegue DevSecOps

**Proyecto:** Arquitectura DevSecOps focalizada en el modelo Zero-Trust para Pymes.
**Autor:** David Gustavo Medina Ardila

**Nota Aclaratoria:** El presente anexo documenta el paso a paso de las acciones ejecutadas durante la implementación de la infraestructura, sirviendo como una guía del camino ideal recorrido. Es importante tener en cuenta que, con el paso del tiempo o debido a la actualización de versiones de las herramientas utilizadas (como Docker, Dokploy o Tailscale), podrían producirse errores de compatibilidad al intentar replicar este entorno; por lo tanto, el alcance de este manual se limita al paso a paso exacto realizado y validado en la fecha de este proyecto. Por motivos de seguridad de la información, se utilizan direcciones IP, correos electrónicos y nombres de usuario de ejemplo (ej. `adminpyme`, `usuario@ejemplo.com`, `203.0.113.50`), los cuales representan de forma ilustrativa los valores reales utilizados en producción.

---

## Fase 1: Aprovisionamiento y Hardening Inicial

El objetivo de esta fase fue asegurar el sistema operativo base del Servidor Privado Virtual (VPS), disminuyendo vectores de ataque de fuerza bruta y estableciendo un canal de acceso remoto seguro.

### 1.1. Creación de Llaves Criptográficas (Local)
**[Entorno: Terminal Local del Administrador]**

Para eliminar la dependencia de contraseñas vulnerables, se procedió a generar un par de llaves criptográficas desde el equipo local del administrador antes de interactuar con el servidor.

1. Se generó la llave SSH utilizando el algoritmo de curva elíptica Ed25519 (recomendado por su alta seguridad y rendimiento):
   ```bash
   ssh-keygen -t ed25519 -C "admin@ejemplo.com"
   ```

2. Se transfirió la llave pública resultante al servidor VPS, utilizando las credenciales temporales de superusuario (`root`) provistas inicialmente por el proveedor de infraestructura (Contabo):
   ```bash
   ssh-copy-id -i ~/.ssh/id_ed25519.pub root@203.0.113.50
   ```

### 1.2. Creación de Usuario Administrativo
**[Entorno: Terminal del VPS (Conexión SSH como root)]**

En cumplimiento con el Principio de Menor Privilegio, se inhabilitó el uso operativo del superusuario, creando un perfil con permisos limitados para la administración diaria.

1. Se ingresó al servidor y se creó el nuevo usuario administrativo (`adminpyme`):
   ```bash
   adduser adminpyme
   ```

2. Se añadió a este usuario al grupo `sudo` para permitirle ejecutar tareas de configuración de forma controlada:
   ```bash
   usermod -aG sudo adminpyme
   ```

3. Se migró el directorio de llaves SSH autorizadas desde el perfil `root` al nuevo usuario, ajustando los permisos de propiedad correspondientes para no perder el acceso con la llave generada en el paso anterior:
   ```bash
   rsync --archive --chown=adminpyme:adminpyme ~/.ssh /home/adminpyme
   ```

### 1.3. Restricción del Servicio SSH
**[Entorno: Terminal del VPS (Conexión SSH con el nuevo usuario)]**

Con el acceso del nuevo usuario garantizado mediante llave criptográfica, se procedió a blindar el servicio de conexión remota del sistema operativo.

1. Se abrió el archivo de configuración principal del demonio SSH:
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```

2. Dentro del archivo, se localizaron y modificaron explícitamente las siguientes directivas para bloquear accesos por contraseña e inhabilitar de forma definitiva los intentos de inicio de sesión del usuario `root`:
   ```text
   PermitRootLogin no
   PasswordAuthentication no
   ```

3. Finalmente, se guardaron los cambios y se reinició el servicio para aplicar las nuevas políticas de seguridad:
   ```bash
   sudo systemctl restart sshd
   ```

## Fase 2: Acceso Zero-Trust (Tailscale), Firewall (UFW) y Whitelisting de Cloudflare

El objetivo de esta fase es integrar el servidor a una red privada virtual cifrada (VPN) y posteriormente blindar la capa de red pública, bloqueando el tráfico directo y delegando la seguridad perimetral a Cloudflare.

### 2.1. Implementación de la Red Malla Cifrada (Tailscale)
**[Entorno: Terminal del VPS]**

Para lograr el modelo Zero-Trust, se instaló el agente de Tailscale. Esto integra el servidor a una red privada virtual cifrada (WireGuard), otorgándole una IP privada y un dominio interno (MagicDNS).

1. Se ejecutó el script de instalación oficial de Tailscale:
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   ```

2. Se autenticó e inicializó el nodo en la red de la organización:
   ```bash
   sudo tailscale up
   ```

> **IMPORTANTE - NUEVO MÉTODO DE ACCESO SSH:** 
> A partir de este momento, la conexión SSH directa a la IP pública del servidor queda inhabilitada. El acceso remoto ahora exige estar conectado a la VPN de Tailscale en el equipo cliente local y utilizar el par de llaves criptográficas. 
> 
> El comando de conexión pasa a utilizar el MagicDNS de Tailscale:
> ```bash
> ssh adminpyme@vmi2897387.taila142d4.ts.net
> ```
> *(Nota: En caso de no tener la VPN activa o carecer de la llave privada, la conexión será rechazada por el servidor con un error de "Connection timed out" o "Permission denied").*

*(Ver evidencia visual del funcionamiento de las llaves ssh y Tailscale: Acceso ssh al servidor - `assets/acceso_ssh_con_vpn.png` -`assets/acceso_ssh_sin_vpn.png` )*

### 2.2. Políticas de Acceso (ACLs) en Tailscale
**[Entorno: Panel de Administración Web de Tailscale]**

Para automatizar los futuros despliegues (CI/CD), se modificaron las Listas de Control de Acceso (ACLs) en el panel de control de Tailscale, autorizando a los "Runners" de GitHub Actions a ingresar temporalmente a la red privada.

1. Se definió la etiqueta `tag:ci` y se le otorgaron permisos para comunicarse con los recursos de la red:
   ```json
   {
       "tagOwners": {
           "tag:ci": ["davidgustavomedinaardila@gmail.com"]
       },
       "acls": [
           // Permite al pipeline de GitHub conectarse al servidor VPS
           {"action": "accept", "src": ["tag:ci"], "dst": ["*:*"]},
           // Permite a los dispositivos del administrador comunicarse entre sí
           {"action": "accept", "src": ["*"], "dst": ["*:*"]}
       ]
   }
   ```
   *(Ver evidencia visual en Anexos: Configuración de Access controls de Tailscale - `assets/access_controls.png`)*

### 2.3. Configuración DNS y Reglas WAF en Cloudflare
**[Entorno: Panel de Administración Web de Cloudflare]**

Antes de cerrar el servidor con el firewall, se configuró el proxy inverso en la nube para interceptar todo el tráfico hacia los dominios públicos.

1. Se configuraron los registros DNS en Cloudflare apuntando a la IP pública del VPS (`86.48.19.148`) con el "Proxy status" habilitado para ocultar la IP real del servidor y delegar la resolución:
   - **Registro A:** Para el dominio raíz (`miscelaneasdavid.shop`).
   - **Registro A:** Para el subdominio de almacenamiento de objetos MinIO (`s3`).
   - **Registro CNAME:** Para enrutar el prefijo `www` hacia el dominio raíz.
   
   *(Ver evidencia visual en Anexos: Configuración de Registros DNS - `assets/cloudflare_dns.png`)*

2. Se activó el cifrado SSL/TLS en modo "Full (strict)" para forzar el cifrado de extremo a extremo entre Cloudflare y el servidor.

    *(Ver evidencia visual en Anexos: Configuración de cifrado full-strict - `assets/cifrado_full_strict.png`)*

3. Se implementaron políticas estrictas en el Firewall de Aplicaciones Web (WAF) para mitigar vectores de ataque antes de que alcancen el VPS:
   - **Allow CORS (Skip):** Permite peticiones `OPTIONS` preflight entre el Frontend y el Backend.
   - **Block Basic Bots:** Despliega un desafío interactivo a peticiones sin navegador válido (ej. `curl`, `wget`).
   - **Protección API:** Bloquea peticiones al Backend cuyo origen no sea el dominio autorizado.
   - **Rate Limit Anti-Fraude:** Limita las peticiones a endpoints sensibles (Checkout/Auth) para evitar ataques de fuerza bruta.

### 2.4. Aislamiento de la Interfaz VPN y Automatización de Whitelisting (UFW)
**[Entorno: Terminal del VPS (Vía conexión VPN de Tailscale)]**

Para evitar ataques de denegación de servicio (DDoS) directos, se configuró el firewall UFW para denegar todo el tráfico público por defecto, permitiendo únicamente el tráfico de Cloudflare y el tráfico interno de la VPN.

1. Se configuró UFW para confiar implícitamente en el tráfico de Tailscale (`tailscale0`):
   ```bash
   sudo ufw allow in on tailscale0
   sudo ufw allow out on tailscale0
   ```

2. Se creó y ejecutó un script en Bash (`configurar_ufw_cloudflare.sh`) para descargar dinámicamente las IPs oficiales de Cloudflare y agregarlas al firewall para los puertos 80 y 443:
   ```bash
   #!/bin/bash
   # Eliminar reglas abiertas previas si existen
   sudo ufw delete allow 80/tcp
   sudo ufw delete allow 443/tcp

   # Descargar listas oficiales de IPs de Cloudflare
   wget https://www.cloudflare.com/ips-v4 -O ips-v4
   wget https://www.cloudflare.com/ips-v6 -O ips-v6

   # Iterar sobre las IPv4 e IPv6 agregándolas a UFW
   for ip in `cat ips-v4`; do
     sudo ufw allow proto tcp from $ip to any port 80,443
   done

   for ip in `cat ips-v6`; do
     sudo ufw allow proto tcp from $ip to any port 80,443
   done

   # Habilitar el Firewall y limpiar temporales
   sudo ufw --force enable
   sudo ufw reload
   rm ips-v4 ips-v6
   ```

3. Se otorgaron permisos de ejecución al script y se aplicó la configuración:
   ```bash
   chmod +x configurar_ufw_cloudflare.sh
   sudo ./configurar_ufw_cloudflare.sh
   ```
*(Evidencia del archivo en el repositorio: Script para lista blanca de Cloudflare - `assets/configurar_ufw_cloudflare.sh`)*
## Fase 3: Resolución de Conflicto de Enrutamiento Egress (NAT)

Al establecer una política de denegación global por defecto en UFW, se genera un efecto secundario a nivel del kernel de Linux: las interfaces de red virtuales creadas por Docker pierden su capacidad de enrutar tráfico saliente hacia internet (Egress). Esto impediría, por ejemplo, que el Backend se comunique con la API de Mercado Pago o que el orquestador descargue imágenes desde repositorios externos.

### 3.1. Enmascaramiento de IPs de Docker (IP Masquerading)
**[Entorno: Terminal del VPS]**

Para solucionar la falta de conectividad saliente de los contenedores, se aplicaron reglas de enmascaramiento dinámico (NAT) utilizando `iptables`. Esto le indica al sistema operativo que traduzca las direcciones IP privadas de los contenedores a la IP pública del servidor VPS al momento de solicitar salida a la red pública.

1. Se habilitó el reenvío de paquetes (Forwarding) por defecto y se crearon las reglas NAT para las subredes típicas que utiliza Docker (clases A, B y C privadas):
   ```bash
   sudo iptables -P FORWARD ACCEPT
   sudo iptables -t nat -A POSTROUTING -s 172.16.0.0/12 -j MASQUERADE
   sudo iptables -t nat -A POSTROUTING -s 192.168.0.0/16 -j MASQUERADE
   sudo iptables -t nat -A POSTROUTING -s 10.0.0.0/8 -j MASQUERADE
   ```

### 3.2. Persistencia de las Reglas NAT
**[Entorno: Terminal del VPS]**

Por defecto, las reglas configuradas directamente en `iptables` son volátiles y se borran si el servidor se reinicia. Para garantizar la resiliencia de la infraestructura ante posibles reinicios por mantenimiento o fallos, se instaló un paquete de persistencia.

1. Se actualizó el índice del gestor de paquetes y se instaló el servicio `iptables-persistent`:
   ```bash
   sudo apt update
   sudo apt install iptables-persistent -y
   ```

2. Se guardaron explícitamente las reglas actuales (incluyendo las creadas en el paso anterior) en la configuración de arranque del sistema:
   ```bash
   sudo netfilter-persistent save
   ```

## Fase 4: Orquestación (Dokploy) y Enrutamiento Zero-Trust

El objetivo de esta fase es implementar el motor de orquestación de contenedores, establecer los túneles inversos para acceder a las interfaces administrativas y desplegar las aplicaciones asegurando que ningún puerto crítico quede expuesto a internet, saltándose el firewall.

### 4.1. Instalación del Orquestador (Dokploy)
**[Entorno: Terminal del VPS]**

Se procedió con la instalación de Dokploy, un orquestador de código abierto que provee una interfaz gráfica de gestión y maneja dinámicamente el proxy inverso nativo (Traefik).

1. Se ejecutó el script de instalación oficial, el cual aprovisiona automáticamente el motor de Docker y Docker Compose:
   ```bash
   curl -sSL https://dokploy.com/install.sh | sh
   ```
*(Nota: Al finalizar la instalación, Dokploy queda escuchando de forma interna en el puerto 3000).*

### 4.2. Asignación de Dominios Privados (Tailscale Serve)
**[Entorno: Terminal del VPS]**

Dado que el firewall UFW bloquea todos los puertos de administración pública, se utilizó la funcionalidad `serve` del nodo de Tailscale. Esto crea túneles inversos desde el DNS cifrado de Tailscale (MagicDNS) hacia los puertos locales (`localhost`) del servidor.

1. Se enrutó el tráfico del orquestador Dokploy (Puerto HTTPS de Tailscale 8443 -> Local 3000):
   ```bash
   sudo tailscale serve --bg --https=8443 localhost:3000
   ```

2. Se enrutó el tráfico del Dashboard Administrativo de Angular (Puerto HTTPS 4200 -> Local 4200):
   ```bash
   sudo tailscale serve --bg --https=4200 localhost:4200
   ```

3. Se enrutó el tráfico de la consola administrativa de MinIO S3 (Puerto HTTPS 9001 -> Local 9001):
   ```bash
   sudo tailscale serve --bg --https=9001 localhost:9001
   ```

De esta forma, las rutas definitivas y seguras del sistema, accesibles única y exclusivamente con la VPN activada, son:
- **Dokploy:** `https://vmi2897387.taila142d4.ts.net:8443`
- **Dashboard Administrativo:** `https://vmi2897387.taila142d4.ts.net:4200`
- **MinIO Console:** `https://vmi2897387.taila142d4.ts.net:9001`

Nota: Estas URL fueron las generadas en el proyecto , claramente si se intenta replicar el ejercicio en otro entorno o servidor , las direcciones cambian , ya que Tailscale asigna un dominio diferente.

Cabe resaltar que para los servicios publicos se hace obligatorio dentro de cada servicio en Dokploy configurar sus respectivos dominios , como se pueden ver en las evidencias : (`assets/dominio_ecommerce.png`)  (`assets/dominio_backend.png`) (`assets/dominio_minIO.png`)

### 4.3. Despliegue de Servicios (Protección de Puertos y Recursos)
**[Entorno: Panel Web de Dokploy / Repositorio de Código]**

Dentro de la interfaz de Dokploy, cada componente se desplegó como una aplicación tipo "Compose". La decisión arquitectónica más crítica en este punto fue la *Protección* de *puertos*: al mapear los puertos usando el prefijo `127.0.0.1:`, se evita que el daemon de Docker modifique directamente `iptables` y exponga los servicios a internet, forzando a que todo el tráfico pase obligatoriamente por el proxy interno o por Tailscale.

Además, se establecieron límites rígidos de memoria (`mem_limit`) para evitar que escenarios de alto tráfico (como los demostrados en las pruebas de k6) colapsen la RAM del VPS (OOM Killer).

A continuación, se muestran las partes fundamentales de la configuración de cada servicio. *(Nota: Los archivos `docker-compose.yml` completos, incluyendo la declaración de redes personalizadas y variables de entorno, se encuentran en el repositorio de código de la investigación).*

**A. Dashboard Administrativo (Angular):**
El panel privado solo escucha peticiones provenientes del interior del VPS en el puerto 4200.
```yaml
services:
  dashboard:
    image: ghcr.io/dagus21/tienda-dashboard:latest
    container_name: dashboard-privado
    restart: always
    mem_limit: 128m
    ports:
      # 127.0.0.1 -> Solo escucha dentro del VPS (Privado)
      - "127.0.0.1:4200:80"
```
*(Evidencia del archivo en el repositorio: Archivo docker-compose Dahsboard - `assets/docker_compose_dashboard.yml`)*


**B. Backend API RESTful (Spring Boot):**
Se limitó el consumo máximo de memoria RAM a 2GB y se reservó un mínimo de 1GB para garantizar estabilidad.
```yaml
services:
  backend:
    image: ghcr.io/dagus21/tienda-backend:latest
    container_name: backend-compose
    restart: always
    mem_limit: 2048m
    mem_reservation: 1024m
    ports:
      - "127.0.0.1:8080:8080"
```
*(Evidencia del archivo en el repositorio: Archivo docker-compose Backend - `assets/docker_compose_Backend.yml`)*

**C. E-Commerce Público (Next.js):**
```yaml
services:
  ecommerce:
    image: ghcr.io/dagus21/tienda-ecommerce:latest
    container_name: ecommerce-compose
    restart: always
    mem_limit: 1024m
    ports:
      - "127.0.0.1:3001:3000"
```
*(Evidencia del archivo en el repositorio: Archivo docker-compose ecommerce - `assets/docker_compose_ecommerce.yml`)*

**D. Almacenamiento de Objetos (MinIO):**
Se separó estrictamente el tráfico de la API pública S3 (Puerto 9000, protegido por el WAF de Cloudflare) del panel de administración web (Puerto 9001, protegido por Tailscale).
```yaml
services:
  minio:
    image: minio/minio:latest
    container_name: minio
    restart: always
    mem_limit: 1024m
    command: server /data --console-address ":9001"
    ports:
      - "127.0.0.1:9001:9001"  # Consola web (Solo red privada VPN)
      - "9000:9000"            # API S3 (Para carga y lectura de imágenes)
```
*(Evidencia del archivo en el repositorio: Archivo docker-compose minIO - `assets/docker_compose_minIO.yml`)*

## Fase 5: Automatización CI/CD (GitHub Actions)

El objetivo de esta fase final es establecer un flujo de Integración y Despliegue Continuo (CI/CD) que contribuya a la inmutabilidad de los artefactos y permita actualizaciones sin tiempo de inactividad (Zero Downtime). Para mantener el modelo Zero-Trust, el agente de automatización (Runner) debe ingresar a la VPN antes de interactuar con el servidor.

### 5.1. Generación de Credenciales y Webhooks
**[Entorno: Plataformas de GitHub, Tailscale y Dokploy]**

Para que los sistemas interactúen de forma segura, se generaron tokens de acceso con el principio de menor privilegio.

1. **Token de GitHub (PAT) para Dokploy:** Se generó un *Personal Access Token* en GitHub con el alcance `read:packages`. Este token se configuró en la sección *Docker Registries* de Dokploy, permitiendo al servidor VPS descargar imágenes privadas desde `ghcr.io`.
2. **Credenciales OAuth de Tailscale:** En el panel de Tailscale, se generó un cliente OAuth con permisos de escritura (`Devices: Write`) y se le asignó la etiqueta `tag:ci` (previamente autorizada en las ACLs en la Fase 2). Se obtuvieron el `Client ID` y el `Client Secret`.
3. **Webhooks de Dokploy:** Dentro de la interfaz de Dokploy, en la pestaña de inicio de cada aplicación (Backend, E-commerce, Dashboard), se generaron las URLs de Webhook utilizadas para disparar el reinicio automático de los contenedores.

### 5.2. Configuración de GitHub Secrets
**[Entorno: Repositorio de Código en GitHub]**

Para evitar la exposición de credenciales en el código fuente, se almacenaron los siguientes valores cifrados en la sección *Secrets and variables* > *Actions* del repositorio:

- `VPS_HOST`: Dirección IP privada asignada al servidor VPS por Tailscale.
- `VPS_USER`: Nombre del usuario administrador (`adminpyme`).
- `SSH_PRIVATE_KEY`: Llave criptográfica Ed25519 generada en la Fase 1.
- `TS_OAUTH_CLIENT_ID` y `TS_OAUTH_SECRET`: Credenciales del bot de Tailscale.
- `BACKEND_WEBHOOK_URL`, `ECOMMERCE_WEBHOOK_URL`, `DASHBOARD_WEBHOOK_URL`: URLs de disparo de Dokploy.

*(Evidencia visual de los secretos en el repositorio: Archivo docker-compose minIO - `assets/secrets_github.png`)*

### 5.3. Implementación del Pipeline de Despliegue
**[Entorno: Archivo `.github/workflows/deploy.yml`]**

Se desarrolló el pipeline automatizado. La ejecución de este flujo consta de cuatro etapas principales: empaquetado de contenedores, conexión a la red Zero-Trust, forzado de actualización vía SSH y reinicio mediante webhooks.

A continuación, se detalla el fragmento crítico del pipeline encargado del despliegue seguro en el servidor. *(Nota: El archivo YAML completo, incluyendo las fases de build, caché y push hacia el registro de contenedores (GHCR), se encuentra documentado en el repositorio de código de la investigación).*

```yaml
      # ----------------------------------------------------------------
      # FASE DE DESPLIEGUE SEGURO (ESTRATEGIA ZERO-TRUST)
      # ----------------------------------------------------------------
      
      # 1. Conectar el Runner efímero a la VPN de la infraestructura
      - name: Connect to Tailscale
        uses: tailscale/github-action@v2
        with:
          oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
          oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
          tags: tag:ci

      # 2. Conexión SSH a través de la VPN para actualizar imágenes
      - name: Force Pull New Images
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            echo "🔐 Autenticando Docker con GitHub Container Registry..."
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            echo "⬇️ Forzando descarga de imágenes nuevas..."
            docker pull ghcr.io/${{ steps.strings.outputs.owner_lc }}/tienda-backend:latest
            docker pull ghcr.io/${{ steps.strings.outputs.owner_lc }}/tienda-ecommerce:latest
            docker pull ghcr.io/${{ steps.strings.outputs.owner_lc }}/tienda-dashboard:latest
            
            echo "🧹 Limpiando imágenes huérfanas para liberar espacio..."
            docker image prune -f

      # 3. Disparo de Webhooks para reinicio (Zero Downtime)
      - name: Trigger Dokploy Redeploy
        run: |
          echo "🚀 Reiniciando Backend..."
          curl -k -X POST '${{ secrets.BACKEND_WEBHOOK_URL }}'
          
          echo "🚀 Reiniciando E-commerce..."
          curl -k -X POST '${{ secrets.ECOMMERCE_WEBHOOK_URL }}'
          
          echo "🚀 Reiniciando Dashboard..."
          curl -k -X POST '${{ secrets.DASHBOARD_WEBHOOK_URL }}'
          
          echo "✅ ¡Despliegue limpio y seguro completado!"
```