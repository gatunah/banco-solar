const { Pool } = require("pg");

// CONFIG BD
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "bancosolar",
  password: "admin",
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

//TODOS LOS USUARIOS
const getDataUser = async () => {
  try {
    const result = await pool.query("SELECT * FROM usuarios ORDER BY id ASC");
    return result.rows;
  } catch (error) {
    console.error("Error al obtener datos de usuarios:", error);
  }
};
const getDataTransf = async () => {
  try {
    const result = await pool.query({
      text: "SELECT t.id, t.emisor, t.receptor, usuarioemisor.nombre AS emisor, usuarioreceptor.nombre AS receptor, t.monto, t.fecha FROM transferencias t JOIN usuarios usuarioemisor ON t.emisor = usuarioemisor.id JOIN usuarios usuarioreceptor ON t.receptor = usuarioreceptor.id ORDER BY id ASC",
      rowMode: "array",//FORMATO ARREGLO
  });
    return result.rows;
  } catch (error) {
    console.error("Error al obtener datos de transferencias:", error);
  }
};

// ELIMINAR USUARIO
const eliminarUser = async (id) =>{
  try{
    const consulta={
      text: "DELETE FROM usuarios WHERE id = $1",
      values: [id],
    }
    const result = await pool.query(consulta);
    return result;

  }catch (error){
    console.error("Error al eliminar al usuario:", error);
  }
}
//INSERTAR
const insertarUser = async (datos) => {
  try {
    const consulta = {
      text: "INSERT INTO usuarios (nombre, balance) VALUES ($1, $2);",
      values: datos,
    };
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.error("Error al insertar usuario:", error);
  }
};

//EDITAR
const editarUser = async (datos) => {
  try {
    const consulta = {
      text: "UPDATE usuarios SET nombre = $1, balance = $2 WHERE id = $3;",
      values: Object.values(datos),
    };
    const result = await pool.query(consulta);
    return result;
  } catch (error) {
    console.error("Error al editar usuario:", error);
  }
};
//INSERTAR TRANSFERENCIA
const insertarTransferencia = async (datos) => {
  //console.log(datos);
  try {
    const emisor_id = datos[0];
    const receptor_id = datos[1];
    const monto = datos[2]; 

    await pool.query("BEGIN");

    const emisor = {
      text: "UPDATE usuarios SET balance = balance - $1 WHERE id = $2;",
      values: [monto, emisor_id],
    };
    await pool.query(emisor);
    const receptor = {
      text: "UPDATE usuarios SET balance = balance + $1 WHERE id = $2;",
      values: [monto, receptor_id],
    };
    await pool.query(receptor);
    const transf = {
      text: "INSERT INTO transferencias (emisor, receptor, monto, fecha) VALUES ($1, $2, $3, NOW());",
      values: [emisor_id, receptor_id, monto],
    };
    await pool.query(transf);
    const result = await pool.query("COMMIT");
    return result;
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error al agregar la transferencia:", error);
  }
};
module.exports = { getDataUser, getDataTransf, eliminarUser,  insertarUser, editarUser, insertarTransferencia};
