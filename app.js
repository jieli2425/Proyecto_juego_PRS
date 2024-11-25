const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let options = {
    rock: {
        rock: "draw",
        paper: "defeat",
        scissor: "victory"
    },
    paper: {
        paper: "draw",
        rock: "victory",
        scissor: "defeat"
    },
    scissor: {
        scissor: "draw",
        paper: "victory",
        rock: "defeat"
    }
};

function evaluarResultado(eleccion1, eleccion2) {
    if (eleccion1 === eleccion2) {
        return "Empate";
    }

    let resultado = options[eleccion1][eleccion2];

    if (resultado === "victory") {
        return "¡Ganaste!";
    } else if (resultado === "defeat") {
        return "Perdiste";
    } else {
        return "Empate";
    }
}

let jugadores = {};
let partidas = {};

app.get('/', (req, res) => res.send('¡Bienvenido al juego de Piedra, Papel o Tijera!'));

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

app.post('/api/iniciarJoc/:codiPartida', (req, res) => {
    const jugador1 = req.body.jugador1;
    const jugador2 = req.body.jugador2;

    if (!jugadores[jugador1] || !jugadores[jugador2]) {
        return res.status(400).send('Ambos jugadores deben estar registrados');
    }

    const idPartida = `${jugador1}-${jugador2}`;
    partidas[idPartida] = { jugador1, jugador2, estado: 'En curso', resultados: null };

    res.send(`Partida iniciada entre ${jugadores[jugador1].nombre} y ${jugadores[jugador2].nombre}`);
});

app.put('/moureJugador/:codiPartida/:jugador/:tipusMoviment', (req, res) => {
    const { codiPartida, jugador, tipusMoviment } = req.params;

    const partida = partidas[codiPartida];
    if (!partida) {
        return res.status(404).send('Partida no encontrada');
    }

    if (jugador !== partida.jugador1 && jugador !== partida.jugador2) {
        return res.status(400).send('El jugador no está en esta partida');
    }

    if (!['piedra', 'papel', 'tijera'].includes(tipusMoviment)) {
        return res.status(400).send('Movimiento inválido');
    }

    jugadores[jugador].eleccion = tipusMoviment;

    res.send(`Jugador ${jugador} ha elegido ${tipusMoviment} en la partida ${codiPartida}`);
});

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

    let resultado = evaluarResultado(eleccion1, eleccion2);
    partida.resultados = resultado;
    res.send(resultado);
});

app.delete('/api/acabarPartida/:idPartida', (req, res) => {
    const idPartida = req.params.idPartida;

    if (!partidas[idPartida]) {
        return res.status(404).send('Partida no encontrada');
    }

    delete partidas[idPartida];
    res.send('Partida eliminada con éxito');
});

app.listen(3000, () => console.log('Servidor iniciado en el puerto 3000'));
