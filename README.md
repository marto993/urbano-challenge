# Urbano Challenge - Solución Técnica

**Dev:** Martín Di Geronimo  
**Stack:** React + NestJS + PostgreSQL + Docker  

---

## Cómo levantar el proyecto

```bash
# 1. Clonar repositorio y copiar ejemplo de variables de entorno
git clone https://github.com/marto993/urbano-challenge.git
cd nest-react-admin
cp .env.example .env

# 2. Ajustar variables de entorno en .env

# 3. Levantar todo
docker compose up --build

# 4. Acceder desde el navegador
http://localhost:3000
# Usuario: admin / admin123
```

---

## El proceso de resolución

Comencé analizando el archivo `docker-compose.yml`, que es el punto de entrada para entender cómo se orquesta todo el proyecto. Lo primero que me llamó la atención fue la cantidad de configuraciones hardcodeadas: credenciales de base de datos, puertos, y otros valores que deberían estar externalizados. Anoté esto como algo a resolver más adelante, ya que no impedía la ejecución inmediata del proyecto.

### Primer error: Dockerfile mal referenciado

El archivo del backend se llamaba `dockerfile` (con 'd' minúscula) cuando Docker esperaba `Dockerfile`. Corregí esto y continué.

### Segundo error: Puerto del backend no expuesto

Al revisar la configuración del backend en el docker-compose, noté que el servicio no exponía ningún puerto al host. El backend escuchaba internamente en el puerto 5000, pero sin mapear este puerto, el frontend no podría comunicarse con la API. Agregué el mapeo `"5000:5000"` y esto resolvió la comunicación entre frontend y backend.

### Tercer error: Falta de persistencia de datos

La base de datos PostgreSQL no tenía ningún volumen asociado, lo que significaba que cada vez que ejecutara `docker compose down`, todos los datos se perderían. Implementé un volumen nombrado (`postgres_data`) para resolver esto.

### Cuarto error: Incompatibilidad de versiones de Node.js

Con estos cambios, intenté levantar el proyecto completo. El frontend falló con errores de incompatibilidad causados por PostCSS. Aquí comenzó la búsqueda de la versión correcta de Node.js (dado que asumí que el proyecto DEBÍA funcionar tal cual estaba). 

Modifiqué el Dockerfile del frontend hasta encontrar la versión de Node compatible:
- Node.js v22: falló
- Node.js v20: falló  
- Node.js v18: falló
- **Node.js v16: funcionó correctamente**

Hice una pequeña investigación y llegué a la conclusión de que el problema se da por el uso de Create React App 4.0.3 y PostCSS 7, que ya no son compatibles con versiones modernas de Node.

Repetí el proceso con el backend, aunque aquí tuve suerte: funcionó con Node.js v22 sin problemas. Decidí mantener v16 en el backend por consistencia.

### Centralización de configuración

Una vez que el proyecto compilaba y corría, me dediqué a resolver el problema de configuración que había identificado al principio. Centralicé todas las variables de entorno en un único archivo `.env` en la raíz del proyecto, eliminé el `.env` local del backend, y configuré el `docker-compose.yml` para propagar estas variables a cada servicio. Esto incluyó mover las credenciales hardcodeadas del usuario admin (que estaban directamente en `main.ts`) a variables de entorno configurables.

### Error en flujo de autenticación

Luego de trasladar toda la configuración a variables de entorno y levantar el proyecto, noté que existe un error al ingresar a la pantalla de login sin autenticar: en la consola del navegador el frontend indica un error 401. Esto es un error que debe corregirse. Revisando el código encontré un mal uso de una instancia de Axios.

### Problema de formateo de archivos

Cuando quise volver a compilar y desplegar el proyecto me encontré con errores de formato en los archivos. Lo que sucede es que en mi PC trabajo con Windows cuyos archivos tienen finales de línea CRLF, pero el contenedor Linux espera LF. 

La solución fue agregar un script `format` que ejecuta `npx prettier --write .` en el flujo del Dockerfile, justo después de `yarn install` y antes de `yarn build`. Esto normaliza todos los archivos antes de compilar y elimina el problema de compatibilidad entre sistemas operativos.

---

## Problemas críticos de seguridad identificados

Teniendo el proyecto funcional, decidí revisar más en detalle el código en búsqueda de errores graves. Encontré los siguientes:

### 1. Exposición de refresh token en consola

```typescript
// frontend/src/services/ApiService.ts:19
console.log(token);  // ← Peligroso!
```

**Impacto:** Cualquiera con acceso a la consola puede copiar el token y secuestrar la sesión.

### 2. Refresh token con vida exageradamente larga

El refresh token cuenta con una vida útil de 1 año, lo cual es peligroso y poco aconsejable. Lo normal es que expire luego de 1 semana (o menos).

### 3. No existe sistema de logging robusto

Aquí debo mencionar dos malas prácticas:

**Uso de console.log():** No es recomendado en producción ya que incrementa notablemente los tiempos de carga y ejecución.

**Falta de log centralizado:** Es necesario contar con un log centralizado que permita dar respuesta rápida a incidencias. Mi recomendación personal es utilizar **Pino**.

---

## Trabajo opcional: Aplicación de estilos de marca

Apliqué los estilos propuestos como opcionales. Para ello extendí la configuración de Tailwind con los valores proporcionados y luego los asigné a los controles correspondientes.

---

## Conclusión

El proyecto se encuentra en un **estado completamente funcional** y está listo para desplegar con Docker. 

Sin embargo, presenta **vulnerabilidades de seguridad críticas** que deben ser tenidas en cuenta. La mayoría de vulnerabilidades vienen por dependencias desactualizadas, especialmente aquellas del frontend que obligan a utilizar Node 16.

### Recomendaciones

**Backend:** Puede actualizarse poco a poco siguiendo las guías de migración de la documentación oficial de NestJS.

**Frontend:** Aconsejo **rehacerlo desde cero** ya que utiliza Create React App (obsoleto, costoso e imposible de mantener a largo plazo). Mi recomendación personal es utilizar **Vite**.