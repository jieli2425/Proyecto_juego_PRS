const baseUrl = 'http://172.20.17.189:3000';

        function registrarJugador() {
            const nombre = document.getElementById('nombre').value;

            fetch(`${baseUrl}/api/registrar`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            })
            .then(response => response.text())
            .then(data => alert(data))
            .catch(error => console.error('Error:', error));
        }

        function iniciarPartida() {
            const jugador1 = document.getElementById('jugador1').value;
            const jugador2 = document.getElementById('jugador2').value;

            fetch(`${baseUrl}/api/iniciarJoc`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jugador1, jugador2 })
            })
            .then(response => response.text())
            .then(data => alert(data))
            .catch(error => console.error('Error:', error));
        }

        function mover() {
            const codiPartida = document.getElementById('codiPartida').value;
            const jugador = document.getElementById('jugador').value;
            const tipusMoviment = document.getElementById('moviment').value;

            fetch(`${baseUrl}/api/mover`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ codiPartida, jugador, tipusMoviment })
            })
            .then(response => response.text())
            .then(data => alert(data))
            .catch(error => console.error('Error:', error));
        }

        function consultarResultados() {
            const idPartida = document.getElementById('codiPartida').value;
            fetch(`${baseUrl}/api/resultados/${idPartida}`)
                .then(response => response.text())
                .then(data => alert(data))
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