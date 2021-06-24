"use strict";

// IMPORTS
// Express
const express = require('express');
const router = express.Router();

//MODEL
const Evento = require('../../models/evento');

//Criar Evento - 
router.post("/", async (req, res) =>{
    let e = req.body;

    await Evento.criarEvento(e, res)
});

//listar as categorias disponiveis
router.get("/listar-categorias", async (req, res) =>{
    await Evento.listarCategorias(res);
})

//listar tipos de eventos disponíveis
router.get("/listar-tipos", async(req, res) =>{
    await Evento.listarTipos(res);
})

//listar eventos
router.get("/listar", async (req, res) => {
    await Evento.listarEventos(res);
});

//listar eventos por categoria
router.get("/listar/:catId", async (req, res) => {
    await Evento.listarEventosCategoria(req.params.catId, res);
});

//Deletar evento
router.delete("/:id", async (req, res) => {
    await Evento.deletarEvento(req.params.id, res);
})

//Atualizar Evento 
router.put("/atualizar", async (req, res) =>{
    let e = req.body;

    await Evento.atualizarEvento(e, res);
})

//listar inscritos no evento
router.get("/:id/inscritos", async (req, res) =>{
    await Evento.listarInscritos(req.params.id, res);
})

//listar convidados do evento
router.get("/:id/convidados", async (req, res) =>{
    await Evento.listarConvidados(req.params.id, res);
})


//listar todas as info de um evento
router.get("/:id", async (req,res) =>{
    await Evento.infoEvento(req.params.id, res);
}) 

//convidar usuario
router.post("/:idEvento/convidar/:idUsuario", async (req, res)=>{
    await Evento.convidarUsuario(req.params.idEvento, req.params.idUsuario, res);
})

//aceitar convite evento
router.put("/:idEvento/aceitar-convite/:idUsuario", async (req, res) =>{
    await Evento.confirmarConvite(req.params.idEvento, req.params.idUsuario, res);
})







module.exports = router;
