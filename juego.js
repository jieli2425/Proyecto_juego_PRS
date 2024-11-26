const baseUrl = 'http://172.20.17.189:3000';
let jugadorActivo = '';

// Crear partida
document.getElementById('crearPartida').addEventListener('click', crearPartida);

// Unirse a la partida (Jugador 2)
document.getElementById('unirse').addEventListener('click', unirse);

// Realizar movimiento
document.getElementById('mover').addEventListener('click', mover);

// Consultar estado
document.getElementById('consultarEstado').addEventListener('click', consultarEstado);

// Finalizar partida
document.getElementById('acabarPartida').addEventListener('click', acabarPartida);

// Función para crear partida
function crearPartida() {
    const jugador1 = document.getElementById('jugador1').value;

    if (!jugador1) {
        alert('Por favor ingresa tu nombre como jugador 1.');
        return;
    }

    fetch(`${baseUrl}/api/crearPartida`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugador1 })
    })
    .then(response => response.json())
    .then(data => {
        alert(`Partida creada. Código: ${data.idPartida}`);
        document.getElementById('registro').style.display = 'none';
        document.getElementById('unirse').style.display = 'block';
        localStorage.setItem('idPartida', data.idPartida); // Guarda el código de la partida
        jugadorActivo = 'jugador1'; // Establece quién está jugando
    })
    .catch(error => console.error('Error:', error));
}

// Función para unirse a la partida (Jugador 2)
function unirse() {
    const idPartida = document.getElementById('idPartida').value;
    const jugador2 = document.getElementById('jugador2').value;

    if (!idPartida || !jugador2) {
        alert('Por favor ingresa el código de la partida y tu nombre.');
        return;
    }

    fetch(`${baseUrl}/api/unirsePartida/${idPartida}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugador2 })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
        document.getElementById('unirse').style.display = 'none';
        document.getElementById('juego').style.display = 'block';
        jugadorActivo = 'jugador2'; // Establece quién está jugando
    })
    .catch(error => console.error('Error:', error));
}

// Función para realizar movimiento
function mover() {
    const idPartida = localStorage.getItem('idPartida'); // Recupera el ID desde el almacenamiento
    const jugador = jugadorActivo === 'jugador1' ? document.getElementById('jugador1').value : document.getElementById('jugador2').value;
    const eleccion = document.getElementById('movimiento').value.toLowerCase();

    if (!['piedra', 'papel', 'tijera'].includes(eleccion)) {
        alert('Por favor ingresa un movimiento válido: piedra, papel o tijera.');
        return;
    }

    fetch(`${baseUrl}/api/moureJugador/${idPartida}/${jugador}/${eleccion}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
}

// Función para consultar estado de la partida
function consultarEstado() {
    const idPartida = localStorage.getItem('idPartida');

    if (!idPartida) {
        alert('Por favor ingresa el código de la partida.');
        return;
    }

    fetch(`${baseUrl}/api/consultarEstatPartida/${idPartida}`)
        .then(response => response.json())
        .then(data => alert(JSON.stringify(data)))
        .catch(error => console.error('Error:', error));
}

// Función para finalizar la partida
function acabarPartida() {
    const codiPartida = localStorage.getItem('idPartida');

    if (!codiPartida) {
        alert('Por favor ingresa el código de la partida.');
        return;
    }

    fetch(`${baseUrl}/api/acabarJoc/${codiPartida}`, {
        method: 'DELETE'
    })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Error:', error));
}
