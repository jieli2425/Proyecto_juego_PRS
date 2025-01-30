const baseUrl = 'http://172.20.16.49:3000';
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
    document.getElementById('seleccionJugador').style.display = 'block';

    document.getElementById('formJugador1').style.display = 'none';
    document.getElementById('formJugador2').style.display = 'none';
    document.getElementById('juego').style.display = 'none';
    document.getElementById('codigoPartida1').style.display = 'none';
    document.getElementById('menuPartida').style.display = 'none';


    document.getElementById('codigoGenerado').innerHTML = '';
    document.getElementById('jugadorActivo').innerHTML = 'Jugador:';

    jugadorActivo = null;
    idPartida = null;

    document.getElementById('resultado').style.display = 'none';
    document.getElementById('mensajeResultado').innerText = '';
}

function nuevaeleccion() {
    reiniciarInterfaz();
}

function crearPartida() {
    idPartida = document.getElementById('codigoPartidaInput').value.trim();

    if (!idPartida || isNaN(idPartida)) {
        alert('Introduce una ID correcta.');
        return;
    } else {
        alert('Partido creado correctamente');
    }

    fetch(`${baseUrl}/api/iniciarJoc/${idPartida}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jugador: 'jugador1' })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('codigoPartida1').style.display = 'block';
            document.getElementById('codigoGenerado').innerHTML = `${idPartida}`;

            document.getElementById('formJugador1').style.display = 'none';
            document.getElementById('juego').style.display = 'block';
            jugadorActivo = 'jugador1';

            document.getElementById('jugadorActivo').innerHTML = 'Jugador 1';

            document.getElementById('menuPartida').style.display = 'block';
        })
        .catch(error => console.error('Error:', error));
}

function unirsePartida() {
    idPartida = document.getElementById('codigoPartida').value.trim();

    if (!idPartida || isNaN(idPartida)) {
        alert('Introduce una ID correcta.');
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
                    alert(errorData.error || 'No se ha podido unir');
                    document.getElementById('juego').style.display = 'none';
                    return;
                });
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                alert('Jugador 2 se ha unido al partido.');
                document.getElementById('formJugador2').style.display = 'none';
                document.getElementById('juego').style.display = 'block';
                jugadorActivo = 'jugador2';

                document.getElementById('jugadorActivo').innerHTML = 'Jugador 2';

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
            document.getElementById('resultado').style.display = 'block';
            document.getElementById('mensajeResultado').innerText = data;

            setTimeout(() => {
                consultarEstado(); 
            }, 500);
        })
        .catch(error => console.error('Error:', error));
}


function consultarEstado() {
    fetch(`${baseUrl}/api/consultarEstatPartida/${idPartida}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('resultado').style.display = 'block';
            document.getElementById('mensajeResultado').innerText = `Estado: ${data.estado}\nVictorias Jugador 1: ${data.victorias1}\nVictorias Jugador 2: ${data.victorias2}`;
            if (data.estado.includes('Juego terminado')) {
                document.getElementById('resultado').style.display = 'block';
                document.getElementById('mensajeResultado').innerText = data.estado;

                if (data.estado === 'finalizado') {
                    document.getElementById('resultado').style.display = 'block';
                    if (data.victorias1 === 3) {
                        document.getElementById('mensajeResultado').innerText = `${data.jugador1} ha ganado 3 partidas. ¡La partida ha finalizado!`;
                    } else if (data.victorias2 === 3) {
                        document.getElementById('mensajeResultado').innerText = `${data.jugador2} ha ganado 3 partidas. ¡La partida ha finalizado!`;
                    }
                }
            }
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
