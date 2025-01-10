const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Opciones de movimientos
let opciones = {
    piedra: { piedra: "empate", papel: "perdido", tijera: "victoria" },
    papel: { papel: "empate", tijera: "perdido", piedra: "victoria" },
    tijera: { tijera: "empate", piedra: "perdido", papel: "victoria" }
};

let partidas = {}; // { idPartida: { jugador1, jugador2, eleccion1, eleccion2, estado} }

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Crear o acceder a una partida
app.post('/api/iniciarJoc/:idPartida', (req, res) => {
    const { idPartida } = req.params;
    const { jugador } = req.body;

    if (!idPartida || !jugador) {
        return res.status(400).json({ error: 'Faltan datos: idPartida o jugador' });
    }

    if (!partidas[idPartida]) {
        if (jugador === 'jugador1') {
            partidas[idPartida] = {
                jugador1: jugador,
                jugador2: null,
                eleccion1: null,
                eleccion2: null,
                estado: 'esperando',
                turno: 'jugador1'
            };
            return res.json({ idPartida: idPartida, mensaje: 'Partida creada. Esperando jugador 2.' });
        } else {
            return res.status(404).json({ error: 'Partida no encontrada' });
        }
    }

    if (partidas[idPartida].jugador2 === null && jugador === 'jugador2') {
        partidas[idPartida].jugador2 = jugador;
        partidas[idPartida].estado = 'en curso';
        return res.json({ idPartida: idPartida, mensaje: 'Jugador 2 registrado. ¡Comienza el juego!' });
    }

    return res.status(400).json({ error: 'La partida ya está completa o no puedes unirte como este jugador' });
});

// Realizar movimiento
app.put('/api/moureJugador/:idPartida/:jugador/:eleccion', (req, res) => {
    const { idPartida, jugador, eleccion } = req.params;

    if (!['piedra', 'papel', 'tijera'].includes(eleccion)) {
        return res.status(400).send('Movimiento inválido');
    }

    const partida = partidas[idPartida];
    if (!partida) return res.status(404).send('Partida no encontrada');

    if (jugador !== partida.turno) {
        return res.status(400).send('No es tu turno. Espera a que el jugador1 haga su elección.');
    }

    if (jugador === partida.jugador1) partida.eleccion1 = eleccion;
    else if (jugador === partida.jugador2) partida.eleccion2 = eleccion;
    else return res.status(400).send('Jugador no pertenece a esta partida');

    partida.turno = jugador === 'jugador1' ? 'jugador2' : 'jugador1';

    if (partida.eleccion1 && partida.eleccion2) {
        const resultado = evaluarResultado(partida.eleccion1, partida.eleccion2, partida.jugador1, partida.jugador2);
        partida.estado = resultado;

        partida.eleccion1 = null;
        partida.eleccion2 = null;

        return res.send(`Resultado: ${resultado}. ¡Selecciona otra opción!`);
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
    const resultado = opciones[eleccion1][eleccion2];
    if (resultado === "empate") return "Empate";
    return resultado === "victoria" ? `${jugador1} gana` : `${jugador2} gana`;
}

// Finalizar partida
app.delete('/api/acabarJoc/:idPartida', (req, res) => {
    const { idPartida } = req.params;

    if (!partidas[idPartida]) return res.status(404).send('Partida con el ID no ha encontrada');

    delete partidas[idPartida];
    res.send('Partida eliminada con éxito');
});

// Configuración para escuchar en la IP 172.20.17.147
app.listen(3000, () => {
    console.log('Servidor iniciado en http://192.168.1.199:3000');
});
