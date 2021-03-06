"use strict";

// IMPORTS
//JWT
const jwt = require("jsonwebtoken");
//Dotenv
require("dotenv").config();
// Axios
const axios = require("axios");
//BcryptJs
const bcrypt = require("bcryptjs");
// SQL
const Sql = require("../infra/sql");
//Helpers
// const sendConfirmationEmail = require("../helpers/AuthEmail");

class Usuario {
  constructor(
    id,
    name,
    bio,
    email,
    password,
    image,
    occupation,
    linkedin,
    github
  ) {
    this.id = id;
    this.name = name;
    this.bio = bio;
    this.email = email;
    this.password = password;
    this.occupation = occupation;
    this.image = image;
    this.linkedin = linkedin;
    this.github = github;
  }

  // --> Gerar token
  static genToken(id, name) {
    let u = new Usuario();
    u.id = id;
    u.name = name;

    const token = jwt.sign({ u }, process.env.JWT_SECRET, {
      expiresIn: 31536000,
    });

    return token;
  }

  // --> Login CAS
  static async loginCas(token, res) {
    if (!token)
      return res.status(400).send({ message: "Ops algo deu errado " });

    axios
      .get(`https://credenciamento.espm.br/ad/token/${token}`)
      .then(async (response) => {
        
        let id_user;

        if (response.data.error === null) {

          return res.status(500).send({message: 'Ops algo deu errado com a sua autenticação'});

        } else {
          await Sql.conectar(async (sql) => {
            let resp = await sql.query(
              "SELECT user_id, user_username, user_email, user_school_email FROM user WHERE user_username = ? OR user_school_email = ? OR user_email = ?",
              [
                response.data.dados.user,
                response.data.dados.emailAcademico,
                response.data.dados.email,
              ]
            );

            let row = resp[0];
            if (!resp || !resp.length) {
              await sql.query(
                "INSERT INTO user (user_name, user_username, user_email, user_school_email, user_isStudent) VALUES (?, ?, ?, ?, ?)",
                [
                  response.data.dados.nome,
                  response.data.dados.user,
                  response.data.dados.email,
                  response.data.dados.emailAcademico,
                  response.data.dados.aluno ? 1 : 0,
                ]
              );
              id_user = await sql.scalar("SELECT last_insert_id()");
            } else {
              await sql.query(
                "UPDATE user SET user_name = ? ,user_username = ?, user_school_email = ? , user_isStudent = ?, user_email = ? WHERE user_id = ?",
                [
                  response.data.dados.nome,
                  response.data.dados.user,
                  response.data.dados.emailAcademico,
                  response.data.dados.aluno ? 1 : 0,
                  response.data.dados.email,
                  row.user_id,
                ]
              );
              id_user = row.user_id;
            }

            return [
              res.cookie(
                "_auth",
                Usuario.genToken(id_user, response.data.dados.nome)
              ),
              res.redirect("http://localhost:3000/"),
            ];
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // --> Efetuar login
  static async login(email, password, res) {
    if (!email || !password)
      return res
        .status(400)
        .send({ message: "Usuário ou password inválidos ! :(" });

    await Sql.conectar(async (sql) => {
      let resp = await sql.query(
        "SELECT user_id, user_name, user_password FROM user WHERE user_email = ? ",
        [email]
      );
      let row = resp[0];

      if (!resp || !resp.length)
        return res
          .status(400)
          .send({ message: "Usuário ou senha inválidos ! :(" });

      const validPassword = bcrypt.compare(password, row.user_password);
      if (!validPassword)
        return res
          .status(400)
          .send({ message: "Usuário ou password inválidos ! :(" });

      const token = Usuario.genToken(row.user_id, row.user_name);

      return res.status(200).send({ token });
    });
  }

  // --> Criar usuario
  static async createUser(u, res) {
    /*

            TODO --> Form validation
            TODO --> Email validation ( Front ? )
            TODO --> Check if email exists on DB and treat duplicate error
            TODO --> Password validation ( Front ? )
            TODO --> Send error message if the email is not found -- Error: No recipients defined (NodeMailer error)
            ? REQUIRED FIELDS --> Nome, email, password;

        */

    let message;
    let statusCode;
    let token;
    let firstAccess;

    await Sql.conectar(async (sql) => {
      try {
        let hash = bcrypt.hashSync(u.senha, parseInt(process.env.SALT_ROUNDS));

        await sql.query(
          "INSERT INTO user (user_name,user_password, user_email, user_img, user_bio, user_occupation, user_github, user_linkedin) VALUES(?, ?, ?, ?, ?, ?, ?, ?)",
          [u.nome, hash, u.email, 1, u.bio, u.occupation, u.github, u.linkedin]
        );

        // sendConfirmationEmail(u.email);

        token = Usuario.genToken(sql.lastInsertedId, u.name);
        statusCode = 201;
        message = `Bem vindo a comunidade TECH ${u.name} !`;
        firstAccess = true;
      } catch (e) {
        if (e.code && e.code === "ER_DUP_ENTRY") {
          message = `Opsss, o email ${u.email} já está em uso, deseja fazer login ou recuperar sua senha ?`;
          token = null;
          statusCode = 400;
          firstAccess = null;
        } else {
          throw e;
        }
      }

      return res.status(statusCode).send({ token, message, firstAccess });
    });
  }

  // --> Excluir conta
  static async deleteAccount(res, id) {
    if (!id)
      return res.status(400).send({ message: "Usuário não encontrado !" });

    await Sql.conectar(async (sql) => {
      await sql.query("DELETE FROM usuario WHERE user_id = ? ", [id]);

      if (sql.linhasAfetadas === 0)
        return res.status(400).send({ message: "Usuário não encontrado !" });

      return res
        .status(200)
        .send({ message: "Usuário excluido com successo !" });
    });
  }

  // --> Info Usuario
  static async infoUser(id) {
    let respMessage;
    let statusCode;

    if (!id){
        respMessage = {  message: "Usuário não encontrado !"  };
        statusCode = 400;
    }

    await Sql.conectar(async (sql) => {
      let resp = await sql.query("SELECT * FROM user WHERE user_id = ?", [id]);
      
      let row = resp[0];
      
      if (!resp || !resp.length){
        respMessage = {  message: "Usuário não encontrado !"  };
        statusCode = 400;
      }
      else{
        let u = new Usuario();
        u.name = row.user_name;
        u.username = row.user_username;
        u.email = row.user_email;
        u.school_email = row.user_school_email;
        u.isStudent = row.user_isStudent;
        u.bio = row.user_bio;
        u.email = row.user_email;
        u.occupation = row.user_occupation;
        u.github = row.user_github;
        u.linkedin = row.user_linkedin;

        respMessage = { u };
        statusCode = 200;
      }
    });

    return {status: statusCode, send: respMessage };
  }

  // --> Editar Usuario
  static async updateUser(id, u, res) {
    let message;
    let statusCode;
    let token;

    console.log(u);
    if (!id)
      return res.status(400).send({ message: "Usuário não encontrado !" });
    // TODO --> Check if id exists

    await Sql.conectar(async (sql) => {
      await sql.query(
        "UPDATE user SET user_name = ?, user_bio = ?, user_occupation= ?, user_github = ?, user_linkedin = ? WHERE user_id = ?",
        [u.nome, u.bio, u.ocupacao, u.github, u.linkedin, parseInt(id)]
      );

      token = Usuario.genToken(parseInt(id), u.name);
      message = "Usuario salvo com sucesso !";

      res.cookie("_auth", token, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        path: "/",
        secure: false,
      });

      return res.status(200).send({ message });
    });
  }

  // --> Confirmar E-mail
  static async updateEmailStatus() {
    // Update on DB email status 0 --> 1
  }
}

module.exports = Usuario;
