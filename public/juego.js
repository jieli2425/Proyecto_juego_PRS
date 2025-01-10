const baseUrl = 'http://192.168.1.199:3000';
let jugadorActivo = '';
let idPartida = '';

function mostrarFormulario(jugador) {
    document.getElementById('seleccionJugador').style.display = 'none';
    if (jugador === 'jugador1') {
        document.getElementById('formJugador1').style.display = 'block';
    } else {
        document.getElementById('formJugador2').style.display = 'block';
    }
}


function reiniciarInterfaz() {
    // Mostrar la selección de jugador
    document.getElementById('seleccionJugador').style.display = 'block';

    // Ocultar los formularios y secciones del juego
    document.getElementById('formJugador1').style.display = 'none';
    document.getElementById('formJugador2').style.display = 'none';
    document.getElementById('juego').style.display = 'none';
    document.getElementById('codigoPartida1').style.display = 'none';
    document.getElementById('menuPartida').style.display = 'none';

    // Limpiar textos dinámicos
    document.getElementById('codigoGenerado').innerHTML = '';
    document.getElementById('jugadorActivo').innerHTML = 'Jugador:';

    // Reiniciar variables globales
    jugadorActivo = '';
    idPartida = '';

    document.getElementById('resultado').style.display = 'none';
    document.getElementById('mensajeResultado').innerText = '';
}
function nuevaeleccion() {
    reiniciarInterfaz();
}
function crearPartida() {
    idPartida = document.getElementById('codigoPartidaInput').value.trim();

    if (!idPartida || isNaN(idPartida)) {
        alert('Por favor ingresa un código válido.');
        return;
    } else {
        alert('Partida creada con éxito');
    }

    fetch(`${baseUrl}/api/iniciarJoc/${idPartida}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugador: 'jugador1' })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('codigoPartida1').style.display = 'block';
            document.getElementById('codigoGenerado').innerHTML = idPartida;

            document.getElementById('formJugador1').style.display = 'none';
            document.getElementById('juego').style.display = 'block';
            jugadorActivo = 'jugador1';

            document.getElementById('jugadorActivo').innerHTML = 'Jugador 1';

            // Mostrar el menú de la partida
            document.getElementById('menuPartida').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function unirsePartida() {
    idPartida = document.getElementById('codigoPartida').value.trim();

    if (!idPartida || isNaN(idPartida)) {
        alert('Por favor ingresa un código de partida válido.');
        return;
    }

    fetch(`${baseUrl}/api/iniciarJoc/${idPartida}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugador: 'jugador2' })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    alert(errorData.error || 'Error al unirse a la partida');
                    document.getElementById('juego').style.display = 'none';
                    return;
                });
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                alert('Jugador 2 se ha unido a la partida.');
                document.getElementById('formJugador2').style.display = 'none';
                document.getElementById('juego').style.display = 'block';
                jugadorActivo = 'jugador2';

                document.getElementById('jugadorActivo').innerHTML = 'Jugador 2';

                // Mostrar el menú de la partida
                document.getElementById('menuPartida').style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function realizarMovimiento(eleccion) {
    fetch(`${baseUrl}/api/moureJugador/${idPartida}/${jugadorActivo}/${eleccion}`, {
        method: 'PUT'
    })
        .then(response => response.text())
        .then(data => {
            // Si el mensaje incluye 'No es tu turno' o algún error, muestra el mensaje en el cuadro pequeño
            document.getElementById('resultado').style.display = 'block';
            document.getElementById('mensajeResultado').innerText = data;
        })
        .catch(error => console.error('Error:', error));
}


function consultarEstado() {
    fetch(`${baseUrl}/api/consultarEstatPartida/${idPartida}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('resultado').style.display = 'block';
            document.getElementById('mensajeResultado').innerText = `Estado: ${data.estado}`;
        })
        .catch(error => console.error('Error:', error));
}

function acabarPartida() {
    fetch(`${baseUrl}/api/acabarJoc/${idPartida}`, {
        method: 'DELETE'
    })
        .then(response => response.text())
        .then(data => {
            document.getElementById('resultado').style.display = 'block';
            document.getElementById('mensajeResultado').innerText = data;
            
            reiniciarInterfaz();
        })
        .catch(error => console.error('Error:', error));
}
