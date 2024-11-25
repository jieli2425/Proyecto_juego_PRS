const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Variables para almacenar datos
let jugadores = {}; // Almacenar los jugadores por IP
let partidas = {}; // Almacenar las partidas activas

// Ruta inicial
app.get('/', (req, res) => res.send('¡Bienvenido al juego de Piedra, Papel o Tijera!'));

// Registrar jugador
app.post('/api/registrar', (req, res) => {
    const ip = req.ip;
    const nombre = req.body.nombre;

    if (!nombre) {
        return res.status(400).send('Falta el nombre del jugador');
    }

    if (jugadores[ip]) {
        return res.status(400).send('Ya estás registrado');
    }

    jugadores[ip] = { nombre, eleccion: null };
    res.send(`Jugador ${nombre} registrado con éxito desde la IP ${ip}`);
});

// Iniciar una partida entre dos jugadores
app.post('/api/iniciarPartida', (req, res) => {
    const jugador1 = req.body.jugador1;
    const jugador2 = req.body.jugador2;

    if (!jugadores[jugador1] || !jugadores[jugador2]) {
        return res.status(400).send('Ambos jugadores deben estar registrados');
    }

    const idPartida = `${jugador1}-${jugador2}`;
    partidas[idPartida] = { jugador1, jugador2, estado: 'En curso', resultados: null };

    res.send(`Partida iniciada entre ${jugadores[jugador1].nombre} y ${jugadores[jugador2].nombre}`);
});

// Realizar una jugada
app.post('/api/jugar', (req, res) => {
    const ip = req.ip;
    const eleccion = req.body.eleccion;

    if (!['piedra', 'papel', 'tijera'].includes(eleccion)) {
        return res.status(400).send('Elección inválida');
    }

    if (!jugadores[ip]) {
        return res.status(400).send('No estás registrado');
    }

    jugadores[ip].eleccion = eleccion;
    res.send(`Has elegido ${eleccion}`);
});

// Evaluar resultado
app.get('/api/resultados/:idPartida', (req, res) => {
    const idPartida = req.params.idPartida;
    const partida = partidas[idPartida];

    if (!partida) {
        return res.status(404).send('Partida no encontrada');
    }

    const { jugador1, jugador2 } = partida;
    const eleccion1 = jugadores[jugador1]?.eleccion;
    const eleccion2 = jugadores[jugador2]?.eleccion;

    if (!eleccion1 || !eleccion2) {
        return res.send('Esperando elecciones de ambos jugadores');
    }

    let resultado;

    if (eleccion1 === eleccion2) {
        resultado = 'Empate';
    } else if (
        (eleccion1 === 'piedra' && eleccion2 === 'tijera') ||
        (eleccion1 === 'papel' && eleccion2 === 'piedra') ||
        (eleccion1 === 'tijera' && eleccion2 === 'papel')
    ) {
        resultado = `${jugadores[jugador1].nombre} gana`;
    } else {
        resultado = `${jugadores[jugador2].nombre} gana`;
    }

    partida.resultados = resultado;
    res.send(resultado);
});

// Eliminar partida
app.delete('/api/acabarPartida/:idPartida', (req, res) => {
    const idPartida = req.params.idPartida;

    if (!partidas[idPartida]) {
        return res.status(404).send('Partida no encontrada');
    }

    delete partidas[idPartida];
    res.send('Partida eliminada con éxito');
});

// Iniciar servidor
app.listen(3000, () => console.log('Servidor iniciado en el puerto 3000'));