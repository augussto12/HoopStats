HoopStats – Plataforma Web de NBA

HoopStats es una aplicación web desarrollada en Angular que permite explorar información actualizada de la NBA de forma intuitiva, visual y dinámica.
El sistema reúne estadísticas de equipos, jugadores y partidos, junto con funcionalidades interactivas como favoritos, predicciones y un modo Fantasy, creando una experiencia completa para fanáticos y usuarios casuales.

La plataforma combina datos reales obtenidos desde la API de la NBA con un backend local simulado mediante JSON Server, lo que permite gestionar usuarios, favoritos, predicciones y equipos Fantasy de forma ágil y práctica.


Características principales
    Equipos

-Visualización de todos los equipos NBA.

-Filtros y buscador por nombre.

-Detalle completo del equipo: conferencia, división, roster y estadísticas.


    Jugadores

Lista de jugadores por equipo.

Perfil individual con estadísticas y datos relevantes.

Buscador global de jugadores.


    Partidos

Partidos del día, en vivo, próximos y finalizados.

Filtro por fecha.

Historial de enfrentamientos entre dos equipos (Head-to-Head).

Sección de detalles con estadísticas del partido.


    Clasificaciones (Standings)

Tabla de conferencias Este y Oeste.

Rendimiento, rachas y posiciones actualizadas.


    Favoritos

Guardar equipos y jugadores en una lista personalizada.

Eliminar favoritos en cualquier momento.


    Sistema de Predicciones

Los usuarios pueden:

Realizar predicciones para partidos programados.

Ganar puntos según la precisión del resultado.

Consultar una tabla general de clasificación de predicciones.


    Fantasy Team

Modo interactivo estilo “Fantasy NBA”:

Crear un equipo de 5 jugadores reales sin exceder un presupuesto inicial.

Consultar puntos acumulados según rendimiento real.

Ver la clasificación general entre usuarios.


    Gestión de usuarios

Registro con contraseña encriptada (bcrypt).

Login persistente mediante localStorage.

Edición del perfil.

Eliminación de cuenta y datos asociados.

Rutas protegidas mediante AuthGuard.


    Interfaz y experiencia de usuario

UI moderna, clara y responsiva.

Navegación fluida sin recargar la página.

Indicadores visuales, loaders y mensajes de estado.


    Tecnologías utilizadas

Angular 20+

TypeScript

HTML / CSS

API-Sports NBA v2 (datos oficiales en tiempo real)

JSON Server (simulación de base de datos local)

bcryptjs (encriptación de contraseñas)

Angular Router + Guards (protección de rutas)

LocalStorage (persistencia ligera)

 Cómo ejecutar el proyecto
1️ Instalar dependencias
npm install

2️ Iniciar el frontend
ng serve

Abrir en:

http://localhost:4200/

3 Iniciar JSON Server
json-server --watch db.json --port 3000

    Estructura del proyecto

/features - módulos principales (equipos, jugadores, fantasy, predicciones, etc.)

/components - vistas generales como Home, Login, Register.

/services - conexión API, auth, favoritos, predicciones.

/guards - protección de rutas.

