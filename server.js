const express = require("express");
// const axios = require("axios");
const {
  getDataUser,
  getDataTransf,
  insertarTransferencia,
  insertarUser,
  editarUser,
  eliminarUser,
} = require("./database/connection");
const app = express();
const port = 3002;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

app.use(express.json()); //PARA ACCEDER A req.body

//ESTATICOS
app.use(express.static("public"));
// app.use("/axios", express.static(__dirname + "/node_modules/axios/dist"));
// app.use("/jquery", express.static(__dirname + "/node_modules/jquery/dist"));

//VISTA
app.get("/", async (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//COMPLETAR DATOS USUARIOS
app.get("/usuarios", async (req, res) => {
  try {
    const result = await getDataUser();
    //console.log(result);
    res.json(result); //DEVUELVE JSON
  } catch (error) {
    console.error("Error al obtener getData", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al obtener getData" });
  }
});
//COMPLETAR DATOS TRANSFERENCIAS
app.get("/transferencias", async (req, res) => {
  try {
    const result = await getDataTransf();
    //console.log(result);
    res.json(result); //DEVUELVE JSON
  } catch (error) {
    console.error("Error al obtener datos de transferencias", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error interno al obtener datos de transferencias",
      });
  }
});
// ELIMINAR USUARIO
app.delete("/usuario", async (req, res) => {
  try{
  const { id } = req.query;
  //console.log(id);
  const resultado = await eliminarUser(id);
  res.status(200).json({ success: true, message: "Usuario eliminado" });
  }catch{
    console.error("Error al eliminar Usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al eliminar Usuario" });

  }
})
//INSERTAR
app.post("/usuario", async (req, res) => {
  try {
    const datos = Object.values(req.body);
    const respuesta = await insertarUser(datos);
    res.json(respuesta);
    //console.log(respuesta);
    //console.log(datos);
  } catch (error){
    console.error("Error al insertar usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al insertar usuario" });
  }
});

//EDITAR
app.put("/usuario", async (req, res) => {
  try {
    const { id } = req.query;
    const { name, balance} = req.body;
    //const datos = Object.values(req.body);//OTRA FORMA DE RECOGER BODY
    
    const datosCompletos = {
      nombre: name,
      balance: balance,
      id: id,
    }; //HAY QUE ESTRUCTURAR EL OBJ PARA QUE COINCIDA CON LOS VALORES DE LA TABLA

    const resultado = await editarUser(datosCompletos);
    //console.log(resultado);
    res.status(200).json({ success: true, message: "Usuario editado" });
  } catch (error){
    console.error("Error al editar la canción:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al editar usuario" });
  }
});
//INSERTAR
app.post("/transferencia", async (req, res) => {
  try {
    const { emisor, receptor, monto } = req.body;

    const datos = [
      parseInt(emisor),
      parseInt(receptor),
      parseFloat(monto)
    ];
    const respuesta = await insertarTransferencia(datos);
    res.json(respuesta);
    //console.log(respuesta);
    //console.log(datos);
  } catch (error){
    console.error("Error al insertar usuario:", error);
    res
      .status(500)
      .json({ success: false, message: "Error interno al insertar usuario" });
  }
});
