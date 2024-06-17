const mongoose = require("mongoose");

const connection =async()=>{

    try{
        await mongoose.connect("mongodb://localhost:27017/mi_redsocial");

        console.log("Conectado Correctamente a bd: mi_redsocial");
        
    }catch(error){
        console.log(error);
        throw new Error("No se pudo conectar a la bd");
    }
}

module.exports=connection
