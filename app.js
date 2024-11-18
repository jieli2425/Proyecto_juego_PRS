const express = require('express');
const app = express();


app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.get('/', (req, res)=>res.send('Comienza el juego'));

app.get('/api/consultarEstatPartida/codiPartida', (req, res)=>res.send(alumnes));
app.get('/api/alumnes/:codi', (req, res)=>{
    let alumne = alumnes.find(a =>a.codi===parseInt(req.params.codi));
    if (!alumne) res.status(404, 'error');
    res.send(alumne);
});

app.post('/api/iniciarJoc/codiPartida', (req, res)=>{
    console.log('tenemos a tu madre');
    console.log(req.body.codi);
    console.log(req.body.nom);
    alumnes.push({codi:parseInt(req.body.codi), nom: req.body.nom});
    console.log(alumnes);
    res.send('tot perfecte');
});

app.delete('/api//acabarJoc/codiPartida', (req, res)=>{
    let alumne = alumnes.find(a =>a.codi===parseInt(req.params.codi));
    let pos = alumne.indexOf(alumne);
    alumne.splice(pos, 1);
    //splice modifica y slice crea una nueva matriz
    res.send('borrado');
});

app.put('/app//moureJugador/codiPartida/jugador/tipusMoviment', (req, res)=>{
    let alumne = alumnes.find(a =>a.codi===parseInt(req.params.codi));
    alumne.codi = parseInt(req.body.codi);
    alumne.nom = req.body.nom;
    res.send('mamon cambiado');
})

app.listen(3000, ()=>console.log('inici servidor'));