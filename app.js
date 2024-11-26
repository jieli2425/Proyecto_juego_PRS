const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Opciones de movimientos
let options = {
    piedra: { piedra: "draw", papel: "defeat", tijera: "victory" },
    papel: { papel: "draw", tijera: "defeat", piedra: "victory" },
    tijera: { tijera: "draw", piedra: "defeat", papel: "victory" }
};

let partidas = {}; // { idPartida: { jugador1, jugador2, eleccion1, eleccion2, estado } }

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Crear o acceder a una partida
app.post('/api/iniciarJoc/:idPartida', (req, res) => {
    const { idPartida, jugador } = req.body;

    if (!idPartida || !jugador) {
        return res.status(400).send('Faltan datos: idPartida o jugador');
    }

    if (!partidas[idPartida]) {
        // Crear partida
        partidas[idPartida] = { jugador1: jugador, jugador2: null, eleccion1: null, eleccion2: null, estado: 'esperando' };
        return res.send('Partida creada. Esperando jugador 2.');
    }

    if (partidas[idPartida].jugador2 === null) {
        partidas[idPartida].jugador2 = jugador;
        partidas[idPartida].estado = 'en curso';
        return res.send('Jugador 2 registrado. ¡Comienza el juego!');
    }

    return res.status(400).send('La partida ya está completa');
});

// Realizar movimiento
app.put('/api/moureJugador/:idPartida/:jugador/:eleccion', (req, res) => {
    const { idPartida, jugador, eleccion } = req.params;

    if (!['piedra', 'papel', 'tijera'].includes(eleccion)) {
        return res.status(400).send('Movimiento inválido');
    }

    const partida = partidas[idPartida];
    if (!partida) return res.status(404).send('Partida no encontrada');

    if (jugador === partida.jugador1) partida.eleccion1 = eleccion;
    else if (jugador === partida.jugador2) partida.eleccion2 = eleccion;
    else return res.status(400).send('Jugador no pertenece a esta partida');

    if (partida.eleccion1 && partida.eleccion2) {
        const resultado = evaluarResultado(partida.eleccion1, partida.eleccion2, partida.jugador1, partida.jugador2);
        partida.estado = resultado;
        return res.send(`Resultado: ${resultado}`);
    }

    res.send('Esperando al otro jugador...');
});

// Consultar estado de la partida
app.get('/api/consultarEstatPartida/:idPartida', (req, res) => {
    const { idPartida } = req.params;
    const partida = partidas[idPartida];

    if (!partida) return res.status(404).send('Partida no encontrada');

    res.json({ estado: partida.estado, jugador1: partida.jugador1, jugador2: partida.jugador2 });
});

// Función para evaluar resultados
function evaluarResultado(eleccion1, eleccion2, jugador1, jugador2) {
    const resultado = options[eleccion1][eleccion2];
    if (resultado === "draw") return "Empate";
    return resultado === "victory" ? `${jugador1} gana` : `${jugador2} gana`;
}

// Finalizar partida
app.delete('/api/acabarJoc/:idPartida', (req, res) => {
    const idPartida = req.params.idPartida;
    if (!partidas[idPartida]) return res.status(404).send('Partida no encontrada');

    delete partidas[idPartida];
    res.send('Partida eliminada con éxito');
});

// Configuración para escuchar en la IP 172.20.17.147
app.listen(3000,  () => {
    console.log('Servidor iniciado en http://172.20.17.189:3000');
});