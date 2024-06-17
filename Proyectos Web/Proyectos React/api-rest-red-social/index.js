//Importar dependencias
const connection =require("./database/connection");
const express=require("express");
const cors=require("cors");

//Mensaje de bienvenida
console.log("API NODE para RED SOCIAL arrancada")

//Conexion a bbdd
connection();

//Crear servidor node
const app=express();
const puerto=3900;

//Configurar cors
app.use(cors());

//Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//Cargar conf rutas
const UserRoutes=require("./routes/user");
const PublicationRoutes=require("./routes/publication");
const FollowRoutes=require("./routes/follow");

app.use("/api", UserRoutes);
app.use("/api", PublicationRoutes);
app.use("/api", FollowRoutes);

//Ruta de prueba
app.get("/ruta-prueba", (req,res)=>{
    return res.status(200).json(
        {
            "id":1,
            "nombre":Jesus,
            "web":"google.com"
        }
    );
})

//Poner servidor a escuchar peticiones http
app.listen(puerto, () =>{
    console.log("Servidor de node corriendo en el puerto: ",puerto);
});