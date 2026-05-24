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