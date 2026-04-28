import { randomUUID } from 'crypto';
import express from 'express';
const app = express();
const PORT = 3000;
app.use(express.json());


// Propiedades: titulo, genero, plataforma, anio, desarrollador, calificacion
let videojuegos = [
  {
    id: randomUUID(),
    titulo: "The Legend of Zelda: Breath of the Wild",
    genero: "aventura",
    plataforma: "Nintendo Switch",
    anio: 2017,
    desarrollador: "Nintendo",
    calificacion: 9.8,
  },
  {
    id: randomUUID(),
    titulo: "God of War",
    genero: "accion",
    plataforma: "PS4",
    anio: 2018,
    desarrollador: "Santa Monica Studio",
    calificacion: 9.5,
  },
  {
    id: randomUUID(),
    titulo: "Minecraft",
    genero: "sandbox",
    plataforma: "PC",
    anio: 2011,
    desarrollador: "Mojang",
    calificacion: 9.0,
  },
  {
    id: randomUUID(),
    titulo: "Hollow Knight",
    genero: "accion",
    plataforma: "PC",
    anio: 2017,
    desarrollador: "Team Cherry",
    calificacion: 9.2,
  },
  {
    id: randomUUID(),
    titulo: "Stardew Valley",
    genero: "simulacion",
    plataforma: "PC",
    anio: 2016,
    desarrollador: "ConcernedApe",
    calificacion: 9.3,
  },
];

// Campos obligatorios para crear un videojuego
const CAMPOS_REQUERIDOS = ["titulo", "genero", "plataforma", "anio", "desarrollador", "calificacion"];

// Helpers de respuesta
const ok = (res, data, status = 200) => res.status(status).json({ ok: true, data });
const err = (res, mensaje, status = 400) => res.status(status).json({ ok: false, error: mensaje });

// GET /  — Info de la API
app.get("/", (req, res) => {
  ok(res, {
    mensaje: "API de Videojuegos",
    version: "1.0.0",
    endpoints: {
      "GET    /api/videojuegos":            "Listar todos (filtro: ?genero=accion&plataforma=PC)",
      "GET    /api/videojuegos/:id":        "Obtener uno por ID",
      "POST   /api/videojuegos":            "Crear nuevo videojuego",
      "PUT    /api/videojuegos/:id":        "Reemplazar videojuego completo",
      "PATCH  /api/videojuegos/:id":        "Actualizar campos específicos",
      "DELETE /api/videojuegos/:id":        "Eliminar videojuego",
    },
  });
});
 
// GET /api/videojuegos  — Listar con filtros opcionales
// Query params soportados: genero, plataforma
// Ejemplo: GET /api/videojuegos?genero=accion&plataforma=PC
app.get("/api/videojuegos", (req, res) => {
  try {
    const { genero, plataforma } = req.query;
 
    let resultado = [...videojuegos];
 
    if (genero) {
      resultado = resultado.filter(
        (v) => v.genero.toLowerCase() === genero.toLowerCase()
      );
    }
 
    if (plataforma) {
      resultado = resultado.filter(
        (v) => v.plataforma.toLowerCase() === plataforma.toLowerCase()
      );
    }
 
    ok(res, resultado);
  } catch (e) {
    err(res, "Error interno del servidor", 500);
  }
});
 

// GET /api/videojuegos/:id  — Obtener uno
app.get("/api/videojuegos/:id", (req, res) => {
  try {
    const juego = videojuegos.find((v) => v.id === req.params.id);
    if (!juego) return err(res, `Videojuego con id '${req.params.id}' no encontrado`, 404);
    ok(res, juego);
  } catch (e) {
    err(res, "Error interno del servidor", 500);
  }
});
 

// POST /api/videojuegos  — Crear nuevo
app.post("/api/videojuegos", (req, res) => {
  try {
    const body = req.body;
 
    // Validación: campos obligatorios
    const faltantes = CAMPOS_REQUERIDOS.filter((campo) => body[campo] === undefined);
    if (faltantes.length > 0) {
      return err(res, `Faltan los siguientes campos obligatorios: ${faltantes.join(", ")}`, 400);
    }
 
    const nuevo = {
      id: randomUUID(),
      titulo:        body.titulo,
      genero:        body.genero,
      plataforma:    body.plataforma,
      anio:          body.anio,
      desarrollador: body.desarrollador,
      calificacion:  body.calificacion,
    };
 
    videojuegos.push(nuevo);
    ok(res, nuevo, 201);
  } catch (e) {
    err(res, "Error interno del servidor", 500);
  }
});

// PUT /api/videojuegos/:id  — Reemplazar COMPLETO
// Requiere todos los campos (excepto id)
app.put("/api/videojuegos/:id", (req, res) => {
  try {
    const index = videojuegos.findIndex((v) => v.id === req.params.id);
    if (index === -1) return err(res, `Videojuego con id '${req.params.id}' no encontrado`, 404);
 
    const body = req.body;
    const faltantes = CAMPOS_REQUERIDOS.filter((campo) => body[campo] === undefined);
    if (faltantes.length > 0) {
      return err(
        res,
        `PUT requiere todos los campos. Faltan: ${faltantes.join(", ")}`,
        400
      );
    }
 
    const reemplazado = {
      id:            videojuegos[index].id, // conservamos el mismo id
      titulo:        body.titulo,
      genero:        body.genero,
      plataforma:    body.plataforma,
      anio:          body.anio,
      desarrollador: body.desarrollador,
      calificacion:  body.calificacion,
    };
 
    videojuegos[index] = reemplazado;
    ok(res, reemplazado);
  } catch (e) {
    err(res, "Error interno del servidor", 500);
  }
});
 
// PATCH /api/videojuegos/:id  — Actualizar parcialmente
// Solo modifica los campos que se envían
app.patch("/api/videojuegos/:id", (req, res) => {
  try {
    const index = videojuegos.findIndex((v) => v.id === req.params.id);
    if (index === -1) return err(res, `Videojuego con id '${req.params.id}' no encontrado`, 404);
 
    if (!req.body || Object.keys(req.body).length === 0) {
      return err(res, "El body no puede estar vacío para PATCH", 400);
    }
 
    // No permitir cambiar el id
    const { id: _ignorado, ...cambios } = req.body;
 
    videojuegos[index] = { ...videojuegos[index], ...cambios };
    ok(res, videojuegos[index]);
  } catch (e) {
    err(res, "Error interno del servidor", 500);
  }
});
 
// DELETE /api/videojuegos/:id  — Eliminar
app.delete("/api/videojuegos/:id", (req, res) => {
  try {
    const index = videojuegos.findIndex((v) => v.id === req.params.id);
    if (index === -1) return err(res, `Videojuego con id '${req.params.id}' no encontrado`, 404);
 
    const eliminado = videojuegos.splice(index, 1)[0];
    ok(res, { mensaje: "Videojuego eliminado correctamente", videojuego: eliminado });
  } catch (e) {
    err(res, "Error interno del servidor", 500);
  }
});
 
// 404 — Ruta no encontrada (debe ir al final)
app.use((req, res) => {
  res.status(404).json({
    error:      "Ruta no encontrada",
    ruta:       req.originalUrl,
    metodo:     req.method,
    sugerencia: "Visita / para ver los endpoints disponibles",
  });
});
 
// Iniciar servidor
app.listen(PORT, () => {
  console.log(`API de Videojuegos corriendo en http://localhost:${PORT}`);
});