let carrito = cargarCarrito();
let productosJSON = [];
let cantidadTotalCompra = carrito.length;


//en el document ready agrego el codigo generado por dom
$(document).ready(function () {
    $("#cantidad-compra").text(cantidadTotalCompra);
    $("#seleccion option[value='pordefecto']").attr("selected", true);
    $("#seleccion").on("change", filtrarProductos);

    $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
    obtenerJSON();
    renderizarProductos();
    mostrarEnTabla();
  //evento al boton finalizar compra para que el usuario confirme su compra
    $("#btn-finalizar").on('click', function () {
        Swal.fire({
            title: '¿Quieres finalizar tu compra?',
            text: `El total de la compra es: $${calcularTotalCarrito()}`,
            showCancelButton: true,
            confirmButtonColor: '#008f39',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
    }).then((result) => {
        if (result.isConfirmed) {
        Swal.fire(
            'Compra confirmada',
            '¡Disfruta tu compra!',
            'success'
        )
        vaciar();
        }
        })
    });
});

// -----------Generacion de Cards----------------
function renderizarProductos(){
    for (const producto of productosJSON) {
                $("#section-productos").append(`<div class="card-product"> 
                                    <div class="img-container">
                                    <img src="${producto.imagen}" alt="${producto.nombre}" class="img-product"/>
                                    </div>
                                    <div class="info-producto">
                                    <p class="font">${producto.nombre}</p>
                                    <strong class="font">$${producto.precio}</strong>
                                    <button class="botones" id="btn${producto.id}"> Agregar al carrito </button>
                                    </div>
                                    </div>`);
            
                $(`#btn${producto.id}`).on('click', function () {
                    agregarAlCarrito(producto);
        });
    }
};


function obtenerJSON() {
    $.getJSON("../json/productos.json", function (response, status) {
        if (status == "success") {
        productosJSON = response;
        renderizarProductos();
        }
    });
}

function filtrarProductos() {
    let seleccion = $("#seleccion").val();
    switch (seleccion) {
        case "menor":
            productosJSON.sort(function (a, b) {
                return a.precio - b.precio
            });
            break;
        case "mayor":
            productosJSON.sort(function (a, b) {
                return b.precio - a.precio
            });
            break;
        case "alfabetico":
            productosJSON.sort(function (a, b) {
                return a.nombre.localeCompare(b.nombre);
            });
            break;
    }
    $(".card-product").remove();
    renderizarProductos();
}

//cargado de profuctos en el carrito
class ProductoCarrito {
    constructor(prod) {
    this.id = prod.id;
    this.imagen = prod.imagen;
    this.nombre = prod.nombre;
    this.precio = prod.precio;
    this.cantidad = 1;
    }
}

//funcion para agregar productos al carrito
function agregarAlCarrito(productoAgregado) {
    let encontrado = carrito.find(p => p.id == productoAgregado.id);
    if (encontrado == undefined) {
    let productoEnCarrito = new ProductoCarrito(productoAgregado);
    carrito.push(productoEnCarrito);
    Swal.fire(
        'Nuevo producto agregado al carrito',
        productoAgregado.nombre,
        'success'
    );
    $("#tablabody").append(`<tr id='fila${productoEnCarrito.id}' class='tabla-carrito'>
                            <td> ${productoEnCarrito.nombre}</td>
                            <td id='${productoEnCarrito.id}'> ${productoEnCarrito.cantidad}</td>
                            <td> ${productoEnCarrito.precio}</td>
                            <td><button class='btn btn-light' id="btn-eliminar-${productoEnCarrito.id}">🗑️</button></td>
                            </tr>`);
    } else {
    //pido al carro la posicion del producto y despues incremento su cantidad
    let posicion = carrito.findIndex(prod => prod.id == productoAgregado.id);
    carrito[posicion].cantidad += 1;
    $(`#${productoAgregado.id}`).html(carrito[posicion].cantidad);
    }

    $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarEnTabla();
}

function mostrarEnTabla() {
    $("#tablabody").empty();
    for (const prod of carrito) {
    $("#tablabody").append(`<tr id='fila${prod.id}' class='tabla-carrito'>
                            <td> ${prod.nombre}</td>
                            <td id='${prod.id}'> ${prod.cantidad}</td>
                            <td> ${prod.precio}</td>
                            <td><button class='btn btn-light' id="eliminar${prod.id}">🗑️</button></td>
                            </tr>`);

    $(`#eliminar${prod.id}`).click(function () {
        let eliminado = carrito.findIndex(p => p.id == prod.id);
        carrito.splice(eliminado, 1);
        console.log(eliminado);
        $(`#fila${prod.id}`).remove();
        $("#gastoTotal").html(`Total: $ ${calcularTotalCarrito()}`);
        localStorage.setItem("carrito", JSON.stringify(carrito));
    })
    }
};

function calcularTotalCarrito() {
    let total = 0;
    for (const producto of carrito) {
    total += producto.precio * producto.cantidad;
    }
    $("#montoTotalCompra").text(total);
    $("#cantidad-compra").text(carrito.length);
    return total;
}

function vaciar() {
    $("#gastoTotal").text("Total: $0");
    $("#cantidad-compra").text("0");
    $(".tabla-carrito").remove();
    localStorage.clear();
    carrito = [];
}

function cargarCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito"));
    if (carrito == null) {
    return [];
    } else {
    return carrito;
    }
}