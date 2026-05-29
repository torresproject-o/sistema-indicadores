# Sistema de Indicadores (Full-Stack SPA)

Aplicación web (SPA) para la carga y visualización de indicadores mediante archivos CSV o Excel. Desarrollada con Node.js, Express, React, Vite, Bootstrap y PostgreSQL.

## Requisitos Previos
* Node.js (v18+)
* PostgreSQL (v14+)

## Base de Datos
1. Crear una base de datos en PostgreSQL llamada `sistema_indicadores` (o cualquier otro nombre por que se configurará en el archivo de variables de entorno).
2. Ejecutar el script SQL que se encuentra en `database/init.sql` para crear las tablas necesarias e insertar el usuario administrador por defecto (recomiendo crear cuenta en el panel).

**Usuario por defecto:**
* **Email:** `admin@sistema.com`
* **Contraseña:** `admin123`

## Variables de Entorno

### Backend
Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=sistema_indicadores
DB_PASSWORD=tu_contraseña_de_postgres
DB_PORT=5432
JWT_SECRET=supersecretkey_cambiame
```

## Instalación y Ejecución

### 1. Backend
Abre una terminal y navega a la carpeta `backend`:
```bash
cd backend
npm install
npm run dev
```
El servidor backend se ejecutará en `http://localhost:5000`.

### 2. Frontend
Abre otra terminal y navega a la carpeta `frontend`:
```bash
cd frontend
npm install
npm run dev
```
La aplicación React estará disponible en `http://localhost:5173`.

## 📁 Estructura del Proyecto

* `/database`: Script de inicialización SQL.
* `/backend`: API REST (Node.js + Express). Controladores para autenticación, subida de archivos y dashboard.
* `/frontend`: SPA (React + Vite). Componentes, páginas y contexto de autenticación.

## ✨ Funcionalidades
* **Autenticación (Login y registro):** Interfaz limpia con Bootstrap Cards y protección con JWT.
* **Carga de Archivos:** Acepta `.csv` y `.xlsx`, insertando los datos de forma estructurada.
* **Dashboard Principal:** Visualización responsiva de KPIs y gráficos usando Recharts.
