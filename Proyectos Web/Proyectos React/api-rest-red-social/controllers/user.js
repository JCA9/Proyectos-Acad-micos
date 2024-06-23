//Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosPaginate= require("mongoose-paginate-v2");

//Importar modelos
const User = require("../models/user");

//Importar servicios
const jwt = require("../services/jwt");
const user = require("../models/user");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        usuario: req.user
    });
}

// Registro de usuarios
const register = async (req, res) => {
    // Recoger datos de la petición
    let params = req.body;

    // Comprobar que me llegan bien (+ validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {
        console.log("VALIDACION INCORRECTA");
        return res.status(400).json({
            status: "error",
            message: "FALTAN DATOS POR ENVIAR",
        });
    }

    try {
        // Control de usuarios duplicados
        const users = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() }
            ]
        });

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "success",
                message: "El usuario ya existe",
            });
        }

        // Cifrar la contraseña
        let pwd = await bcrypt.hash(params.password, 10);
        params.password = pwd;

        // Asegurar que el email y el nick se guardan en minúsculas
        params.email = params.email.toLowerCase();
        params.nick = params.nick.toLowerCase();

        // Crear objeto de usuario
        let user_to_save = new User(params);

        // Guardar usuario en la bbdd
        const userStored = await user_to_save.save();

        // Devolver el resultado
        return res.status(200).json({
            status: "success",
            message: "Usuario registrado correctamente",
            user: userStored,
        });

    } catch (error) {
        console.error("Error en el registro: ", error);
        return res.status(500).json({
            status: "error",
            message: "Error en el proceso de registro",
        });
    }
}

const login = async (req, res) => {
    //Recoger parametros body
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    //Buscar en la bbdd si existe
    try {
        let user = await User.findOne({ email: params.email })
            // .select({ "password": 0 })
            .exec();

        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "No existe el usuario",
            });
        }

        //Comprobar su contraseña 
        const pwd = bcrypt.compareSync(params.password, user.password)

        if (!pwd) {
            return res.status(400).send({
                status: "Error",
                message: "No te has identificado correctamente"
            });
        }

        //Conseguir Token
        const token = jwt.createToken(user);

        //Eliminar Password del objeto

        //Devolver datos de usaurio

        return res.status(200).send({
            status: "success",
            message: "Te has identificado correctamente",
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            },
            token
        });

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "No existe el usuario",
        });
    }
}

const profile = async (req, res) => {
    //Recibir paramatro del id de usuario por la url
    const id = req.params.id;

    //Consulta para sascar datos del usuario

    try {
        //Devolver el resultado
        const userProfile = await User.findById(id).select({ password: 0, role: 0 });

        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe o hay un error"
            })
        }

        //Posteriormente: devolver informacion de follows
        return res.status(200).send({
            status: "success",
            user: userProfile
        })

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hay un error de consulta"
        })
    }
}

const list = async(req, res) => {
    //  controlar en q pagina estamos
    let page = parseInt(req.params.page) || 1;
 
    //  consulta con mongoose pagination
    // limitar usuarios por pagina
    let itemsPerPage = 5;
 
    // opciones de la paginacion
    const options = {
        page: page,
        limit: itemsPerPage,
        sort: { _id: -1 },
        collation: {
            locale: "es",
        },
        
    };    
 
    try {
        // obtenes los usuarios
        const users = await User.paginate({}, options);
 
        // ontenes el numero total de usuarios
        const total = await User.countDocuments();
 
        // si no existe un usuario devolvermos el error
        if (!users)
            return res.status(404).json({
                status: "Error",
                message: "No se han encontrado usuarios",
            });
 
        // devolver el resultado si todo a salido bien
        return res.status(200).send({
            status: "success",
            users: users.docs,
            page,
            itemsPerPage,
            total,
 
            // redondeamos con ceil el numero de paginas con usuarios a mostrar
            pages: Math.ceil(total / itemsPerPage)
        });
 
    } catch (error) {
        return res.status(404).json({
            status: "Error",
            message: "Hubo un error al obtener los usuarios",
            error: error.message,
        });
    }
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list
}
