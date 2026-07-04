# Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# Project setup

```bash
$ npm install
```

# Requerimientos

## Generales

Archivo `.env` en la raíz del proyecto:

```bash
# Configuración del Servidor
PORT=3000

# URL del Sistema B
SISTEMA_B_URL=http://localhost:3001/sync

# Configuración KMS (Vault)
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=root
VAULT_TRANSIT_KEY=kms-transporte

# Configuración Keycloak
KEYCLOAK_URL=http://localhost:8080/realms/TransporteRealm/protocol/openid-connect/auth
KEYCLOAK_REALM=TransporteRealm
KEYCLOAK_CLIENT_ID=portal-usuario
KEYCLOAK_CLIENT_SECRET=
```

Levantar infraestructura central (Keycloak, LDAP, phpLDAPadmin, Vault):

```bash
docker compose up -d
```

## Keycloak

Con la siguiente configuración:

### 1. Realm y Login
* **Realm:** `TransporteRealm` obligatorio.
* **Verify Email:** Desactivado (`OFF`).

### 2. Clientes (Clients)
* **portal-usuario (Sistema A):** `Client Authentication: ON`, `Standard Flow: ON`, URL: `http://localhost:3000`.
* **administrador_transporte (Sistema B):** `Client Authentication: ON`, `Standard Flow: ON`, URL: `http://localhost:3001`.

### 3. Roles y Usuarios
* **Rol:** `operador_transporte`.
* **Usuario:** `operador1` con Email verificado, contraseña fija (`Temporary: OFF`) y el rol asignado.

### 4. Seguridad (2FA)
* **Políticas de Autorización:** OTP activado a nivel global.
* **Acción obligatoria:** `Configure OTP` en el usuario para forzar escaneo de QR.

## HashiCorp Vault

El contenedor opera en modo `-dev` (todo vive en memoria). Se requiere recrear la configuración criptográfica (motor de secretos y la llave kms-transporte) con cada reinicio del servicio mediante los siguientes comandos:

```bash
docker exec -e VAULT_ADDR=[http://127.0.0.1:8200](http://127.0.0.1:8200) -it vault_transporte vault secrets enable transit

docker exec -e VAULT_ADDR=[http://127.0.0.1:8200](http://127.0.0.1:8200) -it vault_transporte vault write -f transit/keys/kms-transporte
```

## Compilación y ejecución del sistema

```bash
$ npm run start:dev
```