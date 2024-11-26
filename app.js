const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let options = {
    piedra: { piedra: "draw", papel: "defeat", tijera: "victory" },
    papel: { papel: "draw", tijera: "defeat", piedra: "victory" },
    tijera: { tijera: "draw", piedra: "defeat", papel: "victory" }
};

function evaluarResultado(eleccion1, eleccion2) {
    if (eleccion1 === eleccion2) return "Empate";
    return options[eleccion1][eleccion2] === "victory" ? "¡Ganaste!" : "Perdiste";
}

let jugadores = {}; // { nombre: { eleccion: null } }
let partidas = {}; // { idPartida: { jugador1, jugador2, estado, resultados } }

app.get('/', (req, res) => res.send('¡Bienvenido al juego de Piedra, Papel o Tijera!'));

app.get('/api/jugadores', (req, res) => {
    const listaJugadores = Object.keys(jugadores);
    if (listaJugadores.length === 0) {
        return res.send('No hay jugadores registrados');
    }
    res.json({ jugadores: listaJugadores });
});

// Consultar resultados
app.get('/api/resultados/:idPartida', (req, res) => {
    const idPartida = req.params.idPartida;
    const partida = partidas[idPartida];

    if (!partida) return res.status(404).send('Partida no encontrada');

    const { jugador1, jugador2 } = partida;
    const eleccion1 = jugadores[jugador1].eleccion;
    const eleccion2 = jugadores[jugador2].eleccion;

    if (!eleccion1 || !eleccion2) {
        return res.send('Esperando elecciones de ambos jugadores');
    }

    const resultado = evaluarResultado(eleccion1, eleccion2);
    partida.resultados = resultado;
    res.send(resultado);
});

// Registrar jugador
app.post('/api/registrar', (req, res) => {
    const { nombre } = req.body;

    if (!nombre) return res.status(400).send('Falta el nombre del jugador');
    if (jugadores[nombre]) return res.status(400).send('El nombre ya está registrado');

    jugadores[nombre] = { eleccion: null };

    const response = Object.keys(jugadores).map(jugador => ({ jugadores: jugador }));

    res.json(response);
});

// Iniciar partida
app.post('/api/iniciarJoc', (req, res) => {
    const { jugador1, jugador2 } = req.body;

    if (!jugadores[jugador1] || !jugadores[jugador2]) {
        return res.status(400).send('Ambos jugadores deben estar registrados');
    }

    const idPartida = `${jugador1}-${jugador2}`;
    partidas[idPartida] = { jugador1, jugador2, estado: 'En curso', resultados: null };

    res.send(`Partida iniciada entre ${jugador1} y ${jugador2}`);
});

// Realizar movimiento
app.put('/api/mover', (req, res) => {
    const { codiPartida, jugador, tipusMoviment } = req.body;

    const partida = partidas[codiPartida];
    if (!partida) return res.status(404).send('Partida no encontrada');

    if (jugador !== partida.jugador1 && jugador !== partida.jugador2) {
        return res.status(400).send('El jugador no pertenece a esta partida');
    }

    if (!['piedra', 'papel', 'tijera'].includes(tipusMoviment)) {
        return res.status(400).send('Movimiento inválido');
    }

    jugadores[jugador].eleccion = tipusMoviment;
    res.send(`Jugador ${jugador} ha elegido ${tipusMoviment}`);
});

// Finalizar partida
app.delete('/api/acabarPartida/:idPartida', (req, res) => {
    const idPartida = req.params.idPartida;
    if (!partidas[idPartida]) return res.status(404).send('Partida no encontrada');

    delete partidas[idPartida];
    res.send('Partida eliminada con éxito');
});

// Configuración para escuchar en la IP `172.20.17.147`
app.listen(3000, '172.20.17.189', () => {
    console.log('Servidor iniciado en http://172.20.17.189:3000');
});
