# ☁️ Guía de Despliegue en Cloudflare (Plan 100% Gratuito y Sin Tarjeta)

Esta guía explica paso a paso cómo desplegar **StudyPlatform** en la infraestructura gratuita de **Cloudflare**, cómo funciona el almacenamiento en **Cloudflare D1 (SQLite)** y cómo ver los **logs en tiempo real** de tu aplicación en producción.

---

## 🏗️ 1. Arquitectura de Despliegue Gratuita

| Componente | Servicio de Cloudflare | Costo | Tarjeta de Crédito | Capacidad |
|---|---|---|---|---|
| **Frontend (SPA React / Vite)** | **Cloudflare Pages** | **$0.00 (Gratis)** | **NO requerida** | Ancho de banda ilimitado, SSL automático, CI/CD desde GitHub |
| **Base de Datos (Cursos, JSON, Progreso)** | **Cloudflare D1** | **$0.00 (Gratis)** | **NO requerida** | 5 GB de almacenamiento SQLite, 5M lecturas/día, 100k escrituras/día |
| **Protección de Red y Anti-DDoS** | **Cloudflare Edge CDN** | **$0.00 (Gratis)** | **NO requerida** | Mitigación ilimitada de ataques DDoS Layer 3/4/7 |

---

## 🚀 2. Despliegue del Frontend en Cloudflare Pages (3 Minutos)

1. Inicia sesión en tu cuenta gratuita de [Cloudflare](https://dash.cloudflare.com/).
2. En el menú lateral izquierdo, ve a **Compute (Workers) > Workers & Pages**.
3. Haz clic en el botón azul **"Create application"** y selecciona la pestaña **"Pages"**.
4. Haz clic en **"Connect to Git"** y autoriza tu cuenta de GitHub `sxamx`.
5. Selecciona el repositorio: `studyplatform`.
6. Configura los parámetros de compilación:
   * **Project name:** `studyplatform`
   * **Framework preset:** `Vite`
   * **Root directory (directorio raíz):** `frontend`
   * **Build command:** `npm run build`
   * **Build output directory:** `dist`
7. Haz clic en **"Save and Deploy"**.

🎉 **¡Listo!** En menos de 45 segundos, Cloudflare compilará tu aplicación y te dará una URL pública con HTTPS gratis (ej. `https://studyplatform.pages.dev`). Cada vez que hagas `git push origin master`, Cloudflare actualizará tu web automáticamente.

---

## 🗄️ 3. Base de Datos Cloudflare D1 (SQLite en el Edge)

Cloudflare D1 es un motor SQLite distribuido que no requiere tarjeta de crédito:

### Crear la base de datos D1:
1. En el menú de Cloudflare, ve a **Workers & Pages > D1 SQL Database**.
2. Haz clic en **"Create Database"** y nómbrala `studyplatform_db`.
3. Para ejecutar la estructura de tablas y el seed inicial:
   ```bash
   npx wrangler d1 execute studyplatform_db --file=backend/src/database/schema.sql
   ```
4. **5 GB de Almacenamiento:** Es suficiente para albergar más de 50,000 cursos completos con cientos de miles de lecciones JSON.

---

## 📜 4. Cómo ver los Logs en Tiempo Real (Live Logs)

Cloudflare te permite ver cada petición y error en vivo sin instalar herramientas externas:

### Opción A: Desde el Panel Web de Cloudflare
1. En el panel de Cloudflare, ve a **Workers & Pages**.
2. Selecciona tu proyecto `studyplatform`.
3. Ve a la pestaña **"Logs"** o **"Real-time Logs"**.
4. Haz clic en el botón **"Begin stream"**.
5. Verás desfilar en tiempo real:
   * Códigos de estado (`200 OK`, `404 Not Found`, `500 Server Error`).
   * Tiempo de respuesta en milisegundos (`ms`).
   * Ruta solicitada (`/api/v1/lessons`, `/api/v1/courses`).

### Opción B: Desde tu Terminal (Streaming en Vivo)
Puedes abrir una consola y ejecutar:
```bash
npx wrangler tail studyplatform
```
Esto mostrará los logs en tu terminal como si estuvieras conectado por SSH a un servidor dedicado.

---

## 🔗 5. Enlaces a Materiales Externos (PDFs, Diapositivas, Videos)

Para adjuntar archivos pesados (PDFs o videos) sin pagar por almacenamiento externo:
1. Sube tu PDF o archivo a **Google Drive**, **GitHub Releases** o **Dropbox**.
2. Obtén el enlace de descarga o visualización público.
3. Agrégalo en cualquier bloque de teoría `info` o `video`:
   ```json
   {
     "type": "info",
     "id": "rec_01",
     "level": "tip",
     "title": "Material de Clase (PDF)",
     "message": "Descarga la guía oficial de ejercicios:",
     "link": {
       "url": "https://drive.google.com/tu-enlace-publico",
       "text": "📄 Descargar Guía de Estudio"
     }
   }
   ```
