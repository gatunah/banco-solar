const setInfoModal = (nombre, balance, id) => {
  $("#nombreEdit").val(nombre);
  $("#balanceEdit").val(balance);
  $("#editButton").attr("onclick", `editUsuario('${id}')`);
};
let usuariosArray = [];
const editUsuario = async (id) => {
  const name = $("#nombreEdit").val();
  const balance = $("#balanceEdit").val();
  try {
    const { data } = await axios.put(`http://localhost:3002/usuario?id=${id}`, {
      name,
      balance,
    });
    
    $("#exampleModal").modal("hide");
    location.reload();
  } catch (e) {
    toastalert("Algo salió mal..." + e);
  }
  //console.log(usuariosArray);
};

$("form:first").submit(async (e) => {
  e.preventDefault();
  let nombre = $("form:first input:first").val();
  let balance = Number($("form:first input:nth-child(2)").val());
  try {
    const response = await fetch("http://localhost:3002/usuario", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre,
        balance,
      }),
    });
    $("form:first input:first").val("");
    $("form:first input:nth-child(2)").val("");
    location.reload();
  } catch (e) {
    toastalert("Algo salió mal ..." + e);
  }
});

$("form:last").submit(async (e) => {
  e.preventDefault();
  let emisor = $("form:last select:first").val();
  let receptor = $("form:last select:last").val();
  let monto = $("#monto").val();
  if (!monto || !emisor || !receptor) {
    toastAlert("Debe seleccionar un emisor, receptor y monto a transferir");
    return false;
  } else if (emisor === receptor) {
    toastAlert("Emisor y receptor no puede ser el mismo");
    return false;
  } else if (!verificarSaldoEmisor (emisor, monto)){
    toastAlert("El emisor no tiene suficiente saldo para realizar la transferencia");
    return false;
  }
  
  try {
    const response = await fetch("http://localhost:3002/transferencia", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emisor,
        receptor,
        monto,
      }),
    });
    const data = await response.json();
    location.reload();
  } catch (e) {
    console.error("Error al agregar la transferencia:", e);
    toastAlert("Algo salió mal..." + e);
  }
});


const getUsuarios = async () => {
  const response = await fetch("http://localhost:3002/usuarios");
  let data = await response.json();
  usuariosArray = data;//
  //console.log(usuariosArray);
  $("#emisor").empty();
  $("#receptor").empty();
  $(".usuarios").html("");
  $("#emisor").append(`<option value="">Seleccionar</option>`);
  $("#receptor").append(`<option value="">Seleccionar</option>`);

  $.each(data, (i, c) => {
    $(".usuarios").append(`
              <tr>
                <td>${c.nombre}</td>
                <td>${c.balance}</td>
                <td>
                  <button
                    class="btn btn-warning mr-2"
                    data-toggle="modal"
                    data-target="#exampleModal"
                    onclick="setInfoModal('${c.nombre}', '${c.balance}', '${c.id}')"
                  >
                    Editar</button
                  ><button class="btn btn-danger" onclick="eliminarUsuario('${c.id}')">Eliminar</button>
                </td>
              </tr>
         `);
    
    $("#emisor").append(`<option value="${c.id}">${c.nombre}</option>`);
    $("#receptor").append(`<option value="${c.id}">${c.nombre}</option>`);
  });
};

const eliminarUsuario = async (id) => {
  const response = await fetch(`http://localhost:3002/usuario?id=${id}`, {
    //QUERY
    method: "DELETE",
  });
  getUsuarios();
};

const getTransferencias = async () => {
  const { data } = await axios.get("http://localhost:3002/transferencias");
  $(".transferencias").html("");
  //console.log("getTransferencias:" + data);
  data.forEach((t) => {
    //console.log(t[1]);
    $(".transferencias").append(`
       <tr>
         <td> ${formatDate(t[6])} </td>
         <td> ${t[3]} </td>
         <td> ${t[4]} </td>
         <td> ${t[5]} </td>
       </tr>
     `);
  });
};

getUsuarios();
getTransferencias();

const formatDate = (date) => {
  const dateFormat = moment(date).format("L");
  const timeFormat = moment(date).format("LTS");
  return `${dateFormat} ${timeFormat}`;
};
formatDate();
function toastAlert(message) {
  $("#toastContainer").empty();
  const toast = `<div class="toast" role="toastalert" aria-live="assertive" aria-atomic="true" data-delay="5000">
    <div class="toast-header">
      <strong class="me-auto">ToastAlert</strong>
      <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>  </div>
    <div class="toast-body">
      ${message}
    </div>
    </div>`;
  $("#toastContainer").append(toast);
  $(".toast").toast("show");
  $("#exampleModal").modal("hide");
}
function verificarSaldoEmisor (emisorId, monto) {
  const emisorInfo = usuariosArray.find(usuario => usuario.id == parseInt(emisorId));

  const saldoEmisor = parseFloat(emisorInfo.balance);
  //console.log(saldoEmisor);
  if (isNaN(saldoEmisor) || saldoEmisor < monto) {
    return false;
  }
  return true;
};