// IMPORTS
    // NodeMailer
    const nodemailer = require('nodemailer'); 
    // HandleBars
    const hbs = require('nodemailer-express-handlebars');
    // JWT
    const jwt = require('jsonwebtoken');
    // .ENV
    require('dotenv').config();
    // PATH
    const path = require('path');



// Configurando o Transporter do Nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWD
    },
    tls: {
         rejectUnauthorized: false 
    },
})

transporter.use('compile', hbs({
    viewEngine: { extName: '.handlebars', partialsDir: path.resolve(__dirname, "../views/partials"), defaultLayout: false },
    viewPath: path.resolve(__dirname, "../views/partials"),
    layoutsDir: path.resolve(__dirname, '../views/layout'),
}))

const sendConfirmationEmail = (emailUsuario) => {

    const emailToken = jwt.sign({ emailUsuario } , process.env.JWT_EMAIL_SECRET, {expiresIn: 86400}) // Criando Token

    const urlEmail = `http://localhost:4000/usuario/confirmacao/${emailToken}` // Criando url para o usuario clicar

    const emailImagePath = path.join(__dirname, '../assets/img/email.png')
   
    // info dentro do email
    const ConfirmacaoEmail = {
        from: process.env.EMAIL_USER,
        to: emailUsuario,
        subject: 'Confirmacao de email',
        template: 'confirmationEmail',
        context: {
            urlEmail: urlEmail
        },
        attachments: [{
            filename: 'email.png',
            path:  emailImagePath,
            cid: 'email' 
        }]
        
    }
  
    // Enviando o email
    transporter.sendMail(ConfirmacaoEmail, (error, info) => {
        if(error){
            console.log(error)
        }
        else{
            console.log('Email enviado com sucesso -- ' + info.response)
        }

    })


}

module.exports = sendConfirmationEmail

