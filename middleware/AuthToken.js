//JWT
    const jwt = require('jsonwebtoken');


// --> Check if the user is logged in or not
const authToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if(authHeader == null) return res.status(401).send({message: "Não autorizado"}) 
    
    jwt.verify(authHeader, process.env.JWT_SECRET, (err) => {
        if(err) return res.status(401).send({message: "Não autorizado"});

        next();
    })
    
}