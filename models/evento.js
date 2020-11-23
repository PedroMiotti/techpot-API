"use strict";

// IMPORTS
    // Express
    const express = require('express');
    const router = express.Router();
    const Sql = require('../infra/sql');


class Evento {
    constructor(id, nome, descricao, data_inicio, categoriaId, tipoId, data_fim,  imagemUrl, criador){
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.data_inicio = data_inicio;
        this.categoriaId = categoriaId;
        this.tipoId = tipoId;
        //atributos não obrigatorios
        this.data_fim = data_fim;
        this.imagemUrl = imagemUrl;
        this.criador = criador;
        
    }

    //atualizar evento 
    static async atualizarEvento(e, res){
        await Sql.conectar(async (sql) => {
            try{
                await sql.query("UPDATE Event SET event_name = ?, event_desc = ?, event_dateInit = ?, event_img = ?, category_id = ?, event_dateEnd = ?, eventType_id = ?, event_creator_id = ? WHERE event_id = ?", [e.nome, e.descricao, e.data_inicio, e.imagemUrl, e.categoriaId, e.data_fim, e.tipoId, e.criador, e.id]);
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao atualizar evento: ${err}`
                })
                
            }

            return res.status(201).send({
                message: "Evento alterado com sucesso!"
            });  

        })
        
    };

    //criar evento
    static async criarEvento(e, res){
        await Sql.conectar(async (sql) =>{ 
            try{

                await sql.query("INSERT INTO event (event_name, event_desc, event_dateInit, event_img, category_id, event_dateEnd, eventType_id, event_creator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [e.nome, e.descricao, e.data_inicio, e.imagemUrl, e.categoriaId, e.data_fim, e.tipoId, e.criador]);

            }catch(err){

                if (e.code) {
					switch (e.code) {
						case "ER_DUP_ENTRY":
                            message = `Erro ao criar evento`;
                            return res.status(400).send({ message })
							
						default:
							throw e;
					}
				} else {
					throw e;
                }
            }

            return res.status(201).send({
                message: "Evento criado com sucesso!"
            });  
            
        });
        
    }

    //deletar evento
    static async deletarEvento(id, res){
        await Sql.conectar(async (sql) =>{
            try{
                await sql.query(`DELETE FROM event WHERE event_id = ${id}`);
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao deletar evento: ${err}`
                })

            }

            return res.status(200).send({
                message: "Evento deletado com sucesso."
            })
            

        });
    }

    
        


    //listar eventos - lista em ordem de data crescente. 
    static async listarEventos(res){
        let lista = [];

        await Sql.conectar(async (sql) =>{
            try{
                lista = await sql.query("SELECT event_id, event_name, event_dateInit, event_img, et.eventType_name FROM event e inner join event_type et on e.eventType_id = et.eventType_id ORDER BY event_dateInit ASC");
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao listar eventos: ${err}`
                })

            }

            return res.status(201).send( lista );  
             

        });


        
    }
        
    //listar inscritos de um evento 
    static async listarInscritos(id, res){
        let lista = [];

        await Sql.conectar(async (sql) =>{
            try{
                lista = await sql.query("SELECT event_invitation_list.user_id FROM event_invitation_list WHERE event_id = ? and event_confirm = TRUE;", [id]);
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao listar Inscritos: ${err}`
                })

            }

            return res.status(200).send(lista)
            

        });

        
    }

    //listar convidados de um evento 
    static async listarConvidados(id, res){
        let lista = [];

        await Sql.conectar(async (sql) =>{
            try{
                lista = await sql.query("SELECT event_invitation_list.user_id FROM event_invitation_list WHERE event_id = ? and event_confirm = FALSE;", [id]);
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao listar Inscritos: ${err}`
                })

            }

            return res.status(200).send(lista)
            

        });

        
    }

    //listar TODAS as infos de um evento 
    static async listarInfo(id, res){
        let lista = [];
        await Sql.conectar(async (sql) => {
            
            try{
                lista = await sql.query("select event_id, event_name, event_desc, event_dateInit, event_img, category_id, event_dateEnd, e.eventType_id, event_creator_id, et.eventType_name from event e inner join event_type et on e.eventType_id = et.eventType_id  where event_id = ?;", [id]);
                
            }
            catch(err){
                return res.status(400).send({
                    message: "Erro ao listar informações do evento"
                })

            }

            return res.status(200).send(lista);
        })
    }


    //invitar usuario 
    static async convidarUsuario(id_evento, id_usuario, res){
        await Sql.conectar(async (sql) =>{
            try{
                await sql.query("INSERT INTO Event_invitation_list (event_id, user_id, event_confirm) VALUES (?, ?, FALSE)", [id_evento, id_usuario] );
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao convidar usuário. ${err}`
                })

            }

            return res.status(200).send({
                message: "Usuário convidado com sucesso."
            })
            

        });
    }

    //listar evento por categoria 
    static async listarEventosCategoria(cat_id, res){
        let lista = [];

        await Sql.conectar(async (sql) =>{
            try{
                lista = await sql.query("SELECT * FROM event WHERE category_id = ? ORDER BY event_dateInit ASC", [cat_id]);
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao listar eventos: ${err}`
                })

            }

            return res.status(201).send( lista );  
             

        });


        
    }


    //Confirmar Invite Evento 
    static async confirmarConvite(id_evento, id_usuario, res){
        await Sql.conectar(async (sql) =>{
            try{
                await sql.query("UPDATE Event_invitation_list SET event_confirm = TRUE WHERE event_id = ? and user_id = ?", [id_evento, id_usuario] );
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao confirmar convite. ${err}`
                })

            }

            return res.status(200).send({
                message: "Convite aceito com sucesso."
            })
            

        });
    }

    //listar todas as categorias disponiveis
    static async listarCategorias(res){
        let lista = [];

        await Sql.conectar(async (sql) =>{
            try{
                lista = await sql.query("select category_id, category_name from event_category;");
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao listar categorias: ${err}`
                })

            }

            return res.status(201).send( lista );  
             

        });

    }

    static async listarTipos(res){
        let lista = [];

        await Sql.conectar(async (sql) =>{
            try{
                lista = await sql.query("select eventType_id, eventType_name from event_type;");
            }
            catch(err){
                return res.status(400).send({
                    message: `Erro ao listar tipo de eventos: ${err}`
                })
            }

            return res.status(201).send( lista );
        });
    }


}


module.exports = Evento;