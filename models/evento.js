// IMPORTS
// SQL
const Sql = require("../infra/sql");

class Evento {
  constructor(
    id,
    name,
    description,
    date_init,
    categoryId,
    typeId,
    typeName,
    date_end,
    image,
    criadorId,
    creatorName,
    creatorSurname,
    creatorOccupation
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.date_init = date_init;
    this.categoryId = categoryId;
    this.typeId = typeId;
    //atributos não obrigatorios
    this.date_end = date_end;
    this.image = image;
    this.criadorId = criadorId;
    this.typeName = typeName;
    this.creatorName = creatorName;
    this.creatorSurname = creatorSurname;
    this.creatorOccupation = creatorOccupation;
  }

  //atualizar evento
  static async atualizarEvento(e, res) {
    await Sql.conectar(async (sql) => {
      try {
        await sql.query(
          "UPDATE Event SET event_name = ?, event_desc = ?, event_dateInit = ?, event_img = ?, category_id = ?, event_dateEnd = ?, event_type_id = ?, event_creator_id = ? WHERE event_id = ?",
          [
            e.name,
            e.description,
            e.date_init,
            e.image,
            e.categoryId,
            e.date_end,
            e.typeId,
            e.criadorId,
            e.id,
          ]
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao atualizar evento: ${err}`,
        });
      }

      return res.status(201).send({
        message: "Evento alterado com sucesso!",
      });
    });
  }

  //criar evento
  static async criarEvento(e, res) {
    let message;
    if (!e.name || !e.description || !e.date_init) {
      message = `Erro: Preencha os campos obrigatórios`;
      return res.status(400).send({ message });
    }

    await Sql.conectar(async (sql) => {
      try {
        await sql.query(
          "INSERT INTO event (event_name, event_desc, event_dateInit, event_img, category_id, event_dateEnd, event_type_id, event_creator_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            e.name,
            e.description,
            e.date_init,
            e.image,
            parseInt(e.categoryId),
            e.date_end,
            parseInt(e.typeId),
            e.criador,
          ]
        );
      } catch (e) {
        if (e.code) {
          switch (e.code) {
            case "ER_DUP_ENTRY":
              message = `Erro ao criar evento`;
              return res.status(400).send({ message });

            default:
              throw e;
          }
        } else {
          throw e;
        }
      }

      return res.status(201).send({
        message: "Evento criado com sucesso!",
      });
    });
  }

  //deletar evento
  static async deletarEvento(id, res) {
    await Sql.conectar(async (sql) => {
      try {
        await sql.query(`DELETE FROM event WHERE event_id = ${id}`);
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao deletar evento: ${err}`,
        });
      }

      return res.status(200).send({
        message: "Evento deletado com sucesso.",
      });
    });
  }

  //listar eventos - lista em ordem de data crescente.
  static async listarEventos(res) {
    let lista = [];

    await Sql.conectar(async (sql) => {
      try {
        lista = await sql.query(
          "SELECT event_id, event_name, event_dateInit, event_img, et.event_type_name FROM event e inner join event_type et on e.event_type_id = et.event_type_id ORDER BY event_dateInit ASC"
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao listar eventos: ${err}`,
        });
      }

      return res.status(201).send(lista);
    });
  }

  //listar inscritos de um evento
  static async listarInscritos(id, res) {
    let lista = [];

    await Sql.conectar(async (sql) => {
      try {
        lista = await sql.query(
          "SELECT event_invite_list.user_id FROM event_invite_list WHERE event_id = ? and event_confirm = TRUE;",
          [id]
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao listar Inscritos: ${err}`,
        });
      }

      return res.status(200).send(lista);
    });
  }

  //listar convidados de um evento
  static async listarConvidados(id, res) {
    let lista = [];

    await Sql.conectar(async (sql) => {
      try {
        lista = await sql.query(
          "SELECT event_invite_list.user_id FROM event_invite_list WHERE event_id = ? and event_confirm = FALSE;",
          [id]
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao listar Inscritos: ${err}`,
        });
      }

      return res.status(200).send(lista);
    });
  }

  //listar TODAS as infos de um evento
  static async listarInfo(id, res) {
    if (!id) return res.status(400).send({ message: "Evento não encontrado" });

    await Sql.conectar(async (sql) => {
      let info = await sql.query(
        "select event_id, event_name, event_desc, event_dateInit, event_img, e.category_id, ec.category_name,  event_dateEnd, e.event_type_id, event_creator_id, et.event_type_name, u.user_name, u.user_surname, u.user_job from event e inner join event_type et on e.event_type_id = et.event_type_id inner join event_category ec on ec.category_id = e.category_id inner join user u on u.user_id = e.event_creator_id where event_id = ?;",
        [parseInt(id)]
      );
      let row = info[0];

      if (!info || !info.length)
        return res
          .status(400)
          .send({ message: "Erro ao recuperar informações do evento" });

      let e = new Evento();
      e.name = row.event_name;
      e.description = row.event_desc;
      e.date_init = row.event_dateInit;
      e.date_end = row.event_dateEnd;
      e.image = row.event_img;
      e.categoryId = row.category_id;
      e.categoriaNome = row.category_name;
      e.typeId = row.event_type_id;
      e.typeName = row.event_type_name;
      e.criadorId = row.event_creator_id;
      e.creatorName = row.user_name;
      e.creatorSurname = row.user_surname;
      e.creatorOccupation = row.user_job;

      return res.status(200).send({ e });
    });
  }

  //invitar usuario
  static async convidarUsuario(id_evento, id_usuario, res) {
    await Sql.conectar(async (sql) => {
      try {
        await sql.query(
          "INSERT INTO Event_invitation_list (event_id, user_id, event_confirm) VALUES (?, ?, FALSE)",
          [id_evento, id_usuario]
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao convidar usuário. ${err}`,
        });
      }

      return res.status(200).send({
        message: "Usuário convidado com sucesso.",
      });
    });
  }

  //listar evento por categoria
  static async listarEventosCategoria(cat_id, res) {
    let lista = [];

    await Sql.conectar(async (sql) => {
      try {
        lista = await sql.query(
          "SELECT * FROM event WHERE category_id = ? ORDER BY event_dateInit ASC",
          [cat_id]
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao listar eventos: ${err}`,
        });
      }

      return res.status(201).send(lista);
    });
  }

  //Confirmar Invite Evento
  static async confirmarConvite(id_evento, id_usuario, res) {
    await Sql.conectar(async (sql) => {
      try {
        await sql.query(
          "UPDATE Event_invitation_list SET event_confirm = TRUE WHERE event_id = ? and user_id = ?",
          [id_evento, id_usuario]
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao confirmar convite. ${err}`,
        });
      }

      return res.status(200).send({
        message: "Convite aceito com sucesso.",
      });
    });
  }

  //listar todas as categorias disponiveis
  static async listarCategorias(res) {
    let lista = [];

    await Sql.conectar(async (sql) => {
      try {
        lista = await sql.query(
          "select category_id, category_name from event_category;"
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao listar categorias: ${err}`,
        });
      }

      return res.status(201).send(lista);
    });
  }

  static async listarTipos(res) {
    let lista = [];

    await Sql.conectar(async (sql) => {
      try {
        lista = await sql.query(
          "select event_type_id, event_type_name from event_type;"
        );
      } catch (err) {
        return res.status(400).send({
          message: `Erro ao listar tipo de eventos: ${err}`,
        });
      }

      return res.status(201).send(lista);
    });
  }
}

module.exports = Evento;
