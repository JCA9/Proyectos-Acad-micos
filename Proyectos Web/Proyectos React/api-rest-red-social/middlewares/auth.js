//Importar modulos
const jwt = require("jwt-simple");
const moment = require("moment");

//Importar clave secreta
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

//MIDDLEWARE de autenticacion
exports.auth = (req, res, next) => {

    //Comprobar si me llega la cabecera de auth
    if (!req.headers.authorization) {
        return res.status(403).send({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticacion"
        });
    }

    //Limpiar el token
    let token = req.headers.authorization.replace(/['']+/g, '');

    //Decodificar el token
    try {
        let playload = jwt.decode(token, secret);

        //Comprobar expiracion del token
        if (playload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "Token expirado",
                error
            })
        }

        //Agregar datos de usuario a la request
        req.user = playload;

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Token invalido",
            error
        })
    }


    //Pasar a ejecucion de accion
    next();
}