const express = require('express');
const path = require('path');
const app = express();
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let opciones = {
    piedra: { piedra: "empate", papel: "perdido", tijera: "victoria" },
    papel: { papel: "empate", tijera: "perdido", piedra: "victoria" },
    tijera: { tijera: "empate", piedra: "perdido", papel: "victoria" }
};

let partidas = {};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/iniciarJoc/:idPartida', (req, res) => {
    const { idPartida } = req.params;

    const { jugador } = req.body;

    if (!idPartida || !jugador) {
        return res.status(400).json({ error: 'Faltan datos: ID o jugador' });
    }

    if (!partidas[idPartida]) {
        if (jugador === 'jugador1') {
            partidas[idPartida] = {
                jugador1: jugador,
                jugador2: null,
                victorias1: 0,
                victorias2: 0,
                eleccion1: null,
                eleccion2: null,
                estado: 'esperando',
                turno: 'jugador1'
            };
            return res.json({ idPartida: idPartida, mensaje: 'Partido creado. Esperando jugador 2.' });
        } else {
            return res.status(404).json({ error: 'Partido no encontrado' });
        }
    }

    if (partidas[idPartida].jugador2 === null && jugador === 'jugador2') {
        partidas[idPartida].jugador2 = jugador;
        partidas[idPartida].estado = 'en curso';
        return res.json({ idPartida: idPartida, mensaje: 'Jugador 2 unido. ¡Comienza la partida!' });
    }

    return res.status(400).json({ error: 'El partido esta lleno' });
});

function reiniciarPartida(idPartida) {
    if (partidas[idPartida]) {
        partidas[idPartida].estado = 'finalizado';

        delete partidas[idPartida];
    }
}

app.put('/api/moureJugador/:idPartida/:jugador/:eleccion', (req, res) => {
    const { idPartida, jugador, eleccion } = req.params;

    if (!['piedra', 'papel', 'tijera'].includes(eleccion)) {
        return res.status(400).send('Movimiento inválido');
    }

    const partida = partidas[idPartida];
    if (!partida) return res.status(404).send('Partido no encontrado');

    if (jugador !== partida.turno) {
        return res.status(400).send('No es tu turno. Espera a que el jugador1 elija.');
    }

    if (jugador === partida.jugador1) partida.eleccion1 = eleccion;
    else if (jugador === partida.jugador2) partida.eleccion2 = eleccion;
    else return res.status(400).send('Jugador no pertenece a esta partida');

    partida.turno = jugador === 'jugador1' ? 'jugador2' : 'jugador1';

    if (partida.eleccion1 && partida.eleccion2) {
        const resultado = comprobarResultado(partida.eleccion1, partida.eleccion2, partida.jugador1, partida.jugador2, idPartida);
        partida.estado = resultado;

        if (partida.victorias1 === 3) {
            reiniciarPartida(idPartida);
            return res.send(`${partida.jugador1} ha ganado 3 partidas. ¡El partido ha finalizado!`);
        } else if (partida.victorias2 === 3) {
            reiniciarPartida(idPartida);
            return res.send(`${partida.jugador2} ha ganado 3 partidas. ¡El partido ha finalizado!`);
        }

        partida.eleccion1 = null;
        partida.eleccion2 = null;

        return res.send(`Resultado: ${resultado}. Elije`);
    }

    res.send('Esperando al jugador...');
});

app.get('/api/consultarEstatPartida/:idPartida', (req, res) => {
    const { idPartida } = req.params;
    const partida = partidas[idPartida];

    if (!partida) return res.status(404).send('Partido no encontrado');

    res.json({ estado: partida.estado, victorias1: partida.victorias1, victorias2: partida.victorias2 });
});

function comprobarResultado(eleccion1, eleccion2, jugador1, jugador2, idPartida) {
    const resultado = opciones[eleccion1][eleccion2];
    if (resultado === "empate") return "Empate";

    if (resultado === "victoria") {
        partidas[idPartida].victorias1++;
        return `${jugador1} gana`;
    } else {
        partidas[idPartida].victorias2++;
        return `${jugador2} gana`;
    }
}

app.delete('/api/acabarJoc/:idPartida', (req, res) => {
    const { idPartida } = req.params;

    if (!partidas[idPartida]) return res.status(404).send('El ID del partido no ha sido encontrado');

    delete partidas[idPartida];
    res.send('Partido eliminado con éxito');
});

app.listen(3000, () => {
    console.log('Servidor iniciado en http://172.20.17.173:3000');
});