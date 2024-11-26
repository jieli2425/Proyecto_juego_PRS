const baseUrl = 'http://172.20.17.189:3000';

function unirse() {
    const idPartida = document.getElementById('idPartida').value;
    const jugador = document.getElementById('jugador').value;


    fetch(`${baseUrl}/api/juego`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPartida, jugador })
    })
    .then(response => response.text())
    .then(data => {
        alert(data);

        if (data.includes('Partida creada') || data.includes('Jugador 2 registrado')) {
            document.getElementById('registro').style.display = 'none';
            document.getElementById('juego').style.display = 'block';
        }
    })
    .catch(error => console.error('Error:', error));
}

function mover() {
    const idPartida = document.getElementById('idPartida').value;
    const jugador = document.getElementById('jugador').value;
    const eleccion = document.getElementById('movimiento').value;

    fetch(`${baseUrl}/api/mover`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idPartida, jugador, eleccion })
    })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => console.error('Error:', error));
}

function consultarEstado() {
    const idPartida = document.getElementById('idPartida').value;

    fetch(`${baseUrl}/api/estado/${idPartida}`)
        .then(response => response.json())
        .then(data => alert(JSON.stringify(data)))
        .catch(error => console.error('Error:', error));
}


function acabarPartida() {
    const codiPartida = document.getElementById('codiPartida').value;
    fetch(`${baseUrl}/api/acabarPartida/${codiPartida}`, {
        method: 'DELETE'
    })
        .then(response => response.text())
        .then(data => alert(data))
        .catch(error => console.error('Error:', error));
}