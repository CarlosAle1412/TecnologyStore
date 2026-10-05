document.documentElement.classList.add("js");

const $ = (selector, context = document) =>
    context.querySelector(selector);

const $$ = (selector, context = document) =>
    [...context.querySelectorAll(selector)];

const sinMovimiento =
    window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


// ======================================================
// ELEMENTOS
// ======================================================

const cabecera = $("#cabecera");
const btnMenu = $("#btnMenu");
const menu = $("#menu");
const progreso = $("#progreso");
const subir = $("#subir");

const modal = $("#modal-producto");
const btnCerrarModal = $("#cerrar-modal");

const carritoPanel = $("#carrito-panel");
const carritoOverlay = $("#carrito-overlay");
const btnCarrito = $("#btnCarrito");
const btnHeroCarrito = $("#btnHeroCarrito");
const btnAbrirCarritoCatalogo =
    $("#btnAbrirCarritoCatalogo");

const btnCerrarCarrito =
    $("#cerrar-carrito");

const btnVaciarCarrito =
    $("#btnVaciarCarrito");

const btnLimpiarCarrito =
    $("#btnLimpiarCarrito");

const btnIrPedido =
    $("#btnIrPedido");


// ======================================================
// DATOS DE PRODUCTOS
// ======================================================

const productosData = [

    {
        id: "laptop-pro",

        nombre: "Laptop Pro Neon 15",

        categoria: "laptop",

        precio: 3499,

        imagen: "imagenes/imagen1.jpg",

        descripcion:
            "Laptop de alto rendimiento para diseño, programación y multitarea exigente con pantalla de alta fidelidad.",

        specs: {
            Procesador:
                "Intel Core i7 13a Gen",

            RAM:
                "16 GB DDR5",

            Almacenamiento:
                "512 GB SSD NVMe",

            Pantalla:
                "15.6' FHD IPS 144Hz"
        }
    },


    {
        id: "tablet-ultra",

        nombre: "Tablet Ultra Touch 11",

        categoria: "tablet",

        precio: 1899,

        imagen: "imagenes/imagen2.jpg",

        descripcion:
            "Compacta, liviana y potente. Ideal para tomar notas, ilustración digital y consumo multimedia sobre la marcha.",

        specs: {
            Procesador:
                "Octa-Core 2.84 GHz",

            RAM:
                "8 GB",

            Almacenamiento:
                "256 GB",

            Pantalla:
                "11' AMOLED 2K"
        }
    },


    {
        id: "pc-master",

        nombre: "PC Master Station",

        categoria: "pc",

        precio: 4899,

        imagen: "imagenes/imagen3.jpg",

        descripcion:
            "Estación de trabajo y gaming de máxima potencia configurada para entornos profesionales y carga masiva.",

        specs: {
            Procesador:
                "AMD Ryzen 9 7900X",

            RAM:
                "32 GB DDR5 RGB",

            Gráfica:
                "NVIDIA RTX 4070 12GB",

            Almacenamiento:
                "1 TB SSD NVMe M.2"
        }
    }

];


// ======================================================
// ESTADO DEL CARRITO
// ======================================================

let carrito = [];

let productoModalActual = null;


// ======================================================
// LOCAL STORAGE
// ======================================================

function guardarCarrito() {

    localStorage.setItem(
        "ventanas_carrito",
        JSON.stringify(carrito)
    );

}


function cargarCarrito() {

    try {

        const guardado =
            localStorage.getItem(
                "ventanas_carrito"
            );

        if (!guardado) return;

        const datos =
            JSON.parse(guardado);

        if (Array.isArray(datos)) {

            carrito = datos.filter(
                item =>
                    item &&
                    typeof item.id === "string" &&
                    Number.isFinite(item.cantidad) &&
                    item.cantidad > 0
            );

        }

    } catch (error) {

        console.warn(
            "No se pudo cargar el carrito.",
            error
        );

        carrito = [];

    }

}


// ======================================================
// FORMATO DE MONEDA
// ======================================================

function moneda(valor) {

    return `S/ ${Number(valor).toLocaleString(
        "es-PE",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    )}`;

}


// ======================================================
// BUSCAR PRODUCTO
// ======================================================

function obtenerProducto(id) {

    return productosData.find(
        producto =>
            producto.id === id
    );

}


// ======================================================
// CANTIDAD TOTAL DEL CARRITO
// ======================================================

function obtenerCantidadCarrito() {

    return carrito.reduce(
        (total, item) =>
            total + item.cantidad,
        0
    );

}


// ======================================================
// TOTAL DEL CARRITO
// ======================================================

function obtenerTotalCarrito() {

    return carrito.reduce(
        (total, item) => {

            const producto =
                obtenerProducto(item.id);

            if (!producto) {
                return total;
            }

            return (
                total +
                producto.precio *
                    item.cantidad
            );

        },
        0
    );

}


// ======================================================
// RENDERIZAR PRODUCTOS
// ======================================================

function cargarProductos(
    categoria = "todos"
) {

    const contenedor =
        $("#catalogo-productos");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const productosFiltrados =
        categoria === "todos"
            ? productosData
            : productosData.filter(
                producto =>
                    producto.categoria ===
                    categoria
            );


    productosFiltrados.forEach(
        producto => {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "xcontenedor";


            card.dataset.categoria =
                producto.categoria;


            card.innerHTML = `

                <span class="producto-categoria">
                    ${producto.categoria.toUpperCase()}
                </span>

                <h2>
                    ${producto.nombre}
                </h2>

                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    loading="lazy"
                >

                <p>
                    ${producto.descripcion}
                </p>

                <p class="producto-precio">
                    ${moneda(producto.precio)}
                </p>

                <div class="producto-acciones">

                    <button
                        type="button"
                        class="btn btn-borde btn-detalles"
                    >
                        Ver detalles
                    </button>

                    <button
                        type="button"
                        class="btn btn-neon btn-agregar"
                    >
                        + Carrito
                    </button>

                </div>

            `;


            const btnDetalles =
                $(".btn-detalles", card);

            const btnAgregar =
                $(".btn-agregar", card);


            btnDetalles.addEventListener(
                "click",
                () =>
                    abrirModal(producto)
            );


            btnAgregar.addEventListener(
                "click",
                () =>
                    agregarAlCarrito(
                        producto.id,
                        1
                    )
            );


            contenedor.appendChild(card);

        }
    );


    activarAnimacionesTarjetas();

}


// ======================================================
// MODAL
// ======================================================

function abrirModal(producto) {

    if (!modal || !producto) {
        return;
    }

    productoModalActual =
        producto;


    const imagen =
        $("#modal-img");

    const titulo =
        $("#modal-titulo");

    const precio =
        $("#modal-precio");

    const descripcion =
        $("#modal-descripcion");

    const specs =
        $("#modal-specs");

    const cantidad =
        $("#modal-cantidad");


    if (imagen) {

        imagen.src =
            producto.imagen;

        imagen.alt =
            producto.nombre;

    }


    if (titulo) {

        titulo.textContent =
            producto.nombre;

    }


    if (precio) {

        precio.textContent =
            moneda(producto.precio);

    }


    if (descripcion) {

        descripcion.textContent =
            producto.descripcion;

    }


    if (cantidad) {

        cantidad.value = 1;

    }


    if (specs) {

        specs.innerHTML = "";


        Object.entries(
            producto.specs
        ).forEach(
            ([clave, valor]) => {

                const li =
                    document.createElement(
                        "li"
                    );

                const strong =
                    document.createElement(
                        "strong"
                    );

                strong.textContent =
                    `${clave}:`;

                li.appendChild(
                    strong
                );

                li.appendChild(
                    document.createTextNode(
                        ` ${valor}`
                    )
                );

                specs.appendChild(
                    li
                );

            }
        );

    }


    modal.classList.add(
        "abierto"
    );

    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


// ======================================================
// CERRAR MODAL
// ======================================================

function cerrarModal() {

    if (!modal) return;

    modal.classList.remove(
        "abierto"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    productoModalActual =
        null;

    document.body.style.overflow =
        "";

}


// ======================================================
// AGREGAR AL CARRITO
// ======================================================

function agregarAlCarrito(
    productoId,
    cantidad = 1
) {

    const producto =
        obtenerProducto(productoId);

    if (!producto) return;


    cantidad =
        parseInt(cantidad, 10);


    if (
        !Number.isFinite(cantidad) ||
        cantidad < 1
    ) {
        cantidad = 1;
    }


    const existente =
        carrito.find(
            item =>
                item.id ===
                productoId
        );


    if (existente) {

        existente.cantidad +=
            cantidad;

    } else {

        carrito.push({

            id: productoId,

            cantidad: cantidad

        });

    }


    guardarCarrito();

    actualizarCarrito();

    mostrarNotificacion(
        `${producto.nombre} fue agregado al carrito.`
    );

}


// ======================================================
// CAMBIAR CANTIDAD
// ======================================================

function cambiarCantidad(
    productoId,
    cambio
) {

    const item =
        carrito.find(
            producto =>
                producto.id ===
                productoId
        );

    if (!item) return;


    item.cantidad +=
        cambio;


    if (item.cantidad <= 0) {

        carrito =
            carrito.filter(
                producto =>
                    producto.id !==
                    productoId
            );

    }


    guardarCarrito();

    actualizarCarrito();

}


// ======================================================
// ELIMINAR PRODUCTO
// ======================================================

function eliminarDelCarrito(
    productoId
) {

    carrito =
        carrito.filter(
            item =>
                item.id !==
                productoId
        );


    guardarCarrito();

    actualizarCarrito();

}


// ======================================================
// VACIAR CARRITO
// ======================================================

function vaciarCarrito() {

    if (carrito.length === 0) {
        return;
    }


    carrito = [];

    guardarCarrito();

    actualizarCarrito();

}


// ======================================================
// RENDERIZAR CARRITO
// ======================================================

function actualizarCarrito() {

    const contenedor =
        $("#carrito-items");

    const contador =
        $("#contador-carrito");

    const total =
        $("#carrito-total");

    const resumen =
        $("#resumen-items");

    const resumenCantidad =
        $("#resumen-cantidad");

    const precioTotal =
        $("#precio-total");


    const cantidadTotal =
        obtenerCantidadCarrito();

    const totalCarrito =
        obtenerTotalCarrito();


    // -----------------------------
    // CONTADOR
    // -----------------------------

    if (contador) {

        contador.textContent =
            cantidadTotal;

    }


    // -----------------------------
    // TOTAL CARRITO
    // -----------------------------

    if (total) {

        total.textContent =
            moneda(totalCarrito);

    }


    if (precioTotal) {

        precioTotal.textContent =
            moneda(totalCarrito);

    }


    // -----------------------------
    // RESUMEN CANTIDAD
    // -----------------------------

    if (resumenCantidad) {

        resumenCantidad.textContent =
            cantidadTotal === 1
                ? "1 producto"
                : `${cantidadTotal} productos`;

    }


    // -----------------------------
    // CARRITO VACÍO
    // -----------------------------

    if (
        contenedor &&
        carrito.length === 0
    ) {

        contenedor.innerHTML = `

            <div class="carrito-vacio">

                <span class="carrito-vacio-icono">
                    🛒
                </span>

                <p>
                    Tu carrito está vacío.
                </p>

                <small>
                    Agrega productos para comenzar tu compra.
                </small>

            </div>

        `;

    }


    // -----------------------------
    // PRODUCTOS DEL CARRITO
    // -----------------------------

    if (
        contenedor &&
        carrito.length > 0
    ) {

        contenedor.innerHTML = "";


        carrito.forEach(
            item => {

                const producto =
                    obtenerProducto(
                        item.id
                    );


                if (!producto) {
                    return;
                }


                const subtotal =
                    producto.precio *
                    item.cantidad;


                const elemento =
                    document.createElement(
                        "div"
                    );


                elemento.className =
                    "carrito-item";


                elemento.innerHTML = `

                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}"
                    >

                    <div>

                        <h3>
                            ${producto.nombre}
                        </h3>

                        <div class="carrito-item-precio">
                            ${moneda(subtotal)}
                        </div>

                        <div class="carrito-item-controles">

                            <button
                                type="button"
                                data-accion="menos"
                                data-id="${producto.id}"
                            >
                                −
                            </button>

                            <span>
                                ${item.cantidad}
                            </span>

                            <button
                                type="button"
                                data-accion="mas"
                                data-id="${producto.id}"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    <button
                        type="button"
                        class="carrito-item-eliminar"
                        data-accion="eliminar"
                        data-id="${producto.id}"
                        aria-label="Eliminar ${producto.nombre}"
                    >
                        ×
                    </button>

                `;


                contenedor.appendChild(
                    elemento
                );

            }
        );

    }


    // -----------------------------
    // RESUMEN DEL PEDIDO
    // -----------------------------

    if (resumen) {

        if (carrito.length === 0) {

            resumen.innerHTML = `
                <p class="carrito-vacio">
                    Tu carrito está vacío.
                </p>
            `;

        } else {

            resumen.innerHTML = "";


            carrito.forEach(
                item => {

                    const producto =
                        obtenerProducto(
                            item.id
                        );

                    if (!producto) {
                        return;
                    }


                    const elemento =
                        document.createElement(
                            "div"
                        );

                    elemento.className =
                        "resumen-item";


                    elemento.innerHTML = `

                        <div class="resumen-item-info">

                            <strong>
                                ${producto.nombre}
                            </strong>

                            <span>
                                ${item.cantidad} ×
                                ${moneda(producto.precio)}
                            </span>

                        </div>

                        <strong>
                            ${moneda(
                                producto.precio *
                                item.cantidad
                            )}
                        </strong>

                    `;


                    resumen.appendChild(
                        elemento
                    );

                }
            );

        }

    }

}


// ======================================================
// EVENTOS DEL CARRITO
// ======================================================

const carritoItems =
    $("#carrito-items");


if (carritoItems) {

    carritoItems.addEventListener(
        "click",
        (e) => {

            const boton =
                e.target.closest(
                    "button"
                );

            if (!boton) return;


            const accion =
                boton.dataset.accion;

            const id =
                boton.dataset.id;


            if (accion === "menos") {

                cambiarCantidad(
                    id,
                    -1
                );

            }


            if (accion === "mas") {

                cambiarCantidad(
                    id,
                    1
                );

            }


            if (accion === "eliminar") {

                eliminarDelCarrito(
                    id
                );

            }

        }
    );

}


// ======================================================
// ABRIR CARRITO
// ======================================================

function abrirCarrito() {

    if (!carritoPanel) return;


    carritoPanel.classList.add(
        "abierto"
    );

    carritoOverlay.classList.add(
        "abierto"
    );


    carritoPanel.setAttribute(
        "aria-hidden",
        "false"
    );

    carritoOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "carrito-abierto"
    );

}


// ======================================================
// CERRAR CARRITO
// ======================================================

function cerrarCarrito() {

    if (!carritoPanel) return;


    carritoPanel.classList.remove(
        "abierto"
    );

    carritoOverlay.classList.remove(
        "abierto"
    );


    carritoPanel.setAttribute(
        "aria-hidden",
        "true"
    );

    carritoOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.classList.remove(
        "carrito-abierto"
    );

}


// ======================================================
// BOTONES DEL CARRITO
// ======================================================

[
    btnCarrito,
    btnHeroCarrito,
    btnAbrirCarritoCatalogo
].forEach(
    boton => {

        if (boton) {

            boton.addEventListener(
                "click",
                abrirCarrito
            );

        }

    }
);


btnCerrarCarrito?.addEventListener(
    "click",
    cerrarCarrito
);


carritoOverlay?.addEventListener(
    "click",
    cerrarCarrito
);


// ======================================================
// VACIAR CARRITO
// ======================================================

btnVaciarCarrito?.addEventListener(
    "click",
    vaciarCarrito
);


btnLimpiarCarrito?.addEventListener(
    "click",
    vaciarCarrito
);


// ======================================================
// IR AL PEDIDO
// ======================================================

btnIrPedido?.addEventListener(
    "click",
    () => {

        if (carrito.length === 0) {

            mostrarNotificacion(
                "Agrega al menos un producto al carrito."
            );

            return;
        }


        cerrarCarrito();


        const pedidos =
            $("#pedidos");


        if (pedidos) {

            pedidos.scrollIntoView({
                behavior:
                    sinMovimiento
                        ? "auto"
                        : "smooth",

                block:
                    "start"
            });

        }

    }
);


// ======================================================
// MODAL: CANTIDAD
// ======================================================

$("#modal-menos")?.addEventListener(
    "click",
    () => {

        const input =
            $("#modal-cantidad");

        if (!input) return;


        let cantidad =
            parseInt(
                input.value,
                10
            ) || 1;


        cantidad =
            Math.max(
                1,
                cantidad - 1
            );


        input.value =
            cantidad;

    }
);


$("#modal-mas")?.addEventListener(
    "click",
    () => {

        const input =
            $("#modal-cantidad");

        if (!input) return;


        let cantidad =
            parseInt(
                input.value,
                10
            ) || 1;


        cantidad++;


        input.value =
            cantidad;

    }
);


// ======================================================
// AGREGAR DESDE MODAL
// ======================================================

$("#btn-agregar-modal")?.addEventListener(
    "click",
    () => {

        if (!productoModalActual) {
            return;
        }


        const input =
            $("#modal-cantidad");


        const cantidad =
            parseInt(
                input?.value,
                10
            ) || 1;


        agregarAlCarrito(
            productoModalActual.id,
            cantidad
        );


        cerrarModal();

        abrirCarrito();

    }
);


// ======================================================
// CERRAR MODAL
// ======================================================

btnCerrarModal?.addEventListener(
    "click",
    cerrarModal
);


modal?.addEventListener(
    "click",
    (e) => {

        if (
            e.target === modal
        ) {

            cerrarModal();

        }

    }
);


// ======================================================
// FILTROS
// ======================================================

$$(".filtro").forEach(
    boton => {

        boton.addEventListener(
            "click",
            () => {

                $$(".filtro").forEach(
                    filtro =>
                        filtro.classList.remove(
                            "activo"
                        )
                );


                boton.classList.add(
                    "activo"
                );


                cargarProductos(
                    boton.dataset.categoria
                );

            }
        );

    }
);


// ======================================================
// FORMULARIO
// ======================================================

$("#form-pedido")?.addEventListener(
    "submit",
    (e) => {

        e.preventDefault();


        if (carrito.length === 0) {

            mostrarNotificacion(
                "Tu carrito está vacío."
            );

            abrirCarrito();

            return;
        }


        const formulario =
            e.target;


        const cliente =
            $("#cliente-nombre")
                ?.value
                .trim();


        const telefono =
            $("#cliente-telefono")
                ?.value
                .trim();


        const email =
            $("#cliente-email")
                ?.value
                .trim();


        const sucursal =
            $("#sucursal")
                ?.value;


        const comentario =
            $("#cliente-comentario")
                ?.value
                .trim();


        const pedido =
            carrito.map(
                item => {

                    const producto =
                        obtenerProducto(
                            item.id
                        );


                    return {

                        producto:
                            producto.nombre,

                        cantidad:
                            item.cantidad,

                        precio:
                            producto.precio,

                        subtotal:
                            producto.precio *
                            item.cantidad

                    };

                }
            );


        const total =
            obtenerTotalCarrito();


        // En una aplicación real aquí
        // enviarías estos datos al servidor.

        console.log(
            "PEDIDO:",
            {
                cliente,
                telefono,
                email,
                sucursal,
                comentario,
                productos: pedido,
                total
            }
        );


        let resumenTexto =
            pedido
                .map(
                    item =>
                        `${item.cantidad}x ${item.producto}`
                )
                .join("\n");


        alert(
            `¡Pedido recibido, ${cliente}!\n\n` +

            `Productos:\n` +

            `${resumenTexto}\n\n` +

            `Total: ${moneda(total)}\n` +

            `Sucursal: ${sucursal}\n\n` +

            `Te contactaremos al ${telefono}.`
        );


        formulario.reset();


        carrito = [];

        guardarCarrito();

        actualizarCarrito();


        window.scrollTo({
            top: 0,
            behavior:
                sinMovimiento
                    ? "auto"
                    : "smooth"
        });

    }
);


// ======================================================
// SCROLL
// ======================================================

function alHacerScroll() {

    const y =
        window.scrollY;


    const total =
        document.documentElement
            .scrollHeight -
        window.innerHeight;


    cabecera?.classList.toggle(
        "scrolled",
        y > 20
    );


    if (progreso) {

        const porcentaje =
            total > 0
                ? Math.min(
                    Math.max(
                        y / total,
                        0
                    ),
                    1
                )
                : 0;


        progreso.style.transform =
            `scaleX(${porcentaje})`;

    }


    subir?.classList.toggle(
        "ver",
        y > 600
    );

}


window.addEventListener(
    "scroll",
    alHacerScroll,
    {
        passive: true
    }
);


alHacerScroll();


subir?.addEventListener(
    "click",
    () => {

        window.scrollTo({

            top: 0,

            behavior:
                sinMovimiento
                    ? "auto"
                    : "smooth"

        });

    }
);


// ======================================================
// MENÚ
// ======================================================

btnMenu?.addEventListener(
    "click",
    () => {

        const abierto =
            menu.classList.toggle(
                "abierto"
            );


        btnMenu.setAttribute(
            "aria-expanded",
            String(abierto)
        );


        btnMenu.setAttribute(
            "aria-label",
            abierto
                ? "Cerrar menú"
                : "Abrir menú"
        );

    }
);


$$(".tiene-sub > a").forEach(
    a => {

        a.addEventListener(
            "click",
            (e) => {

                if (
                    window.matchMedia(
                        "(max-width: 820px)"
                    ).matches
                ) {

                    e.preventDefault();


                    a.parentElement
                        .classList.toggle(
                            "abierto"
                        );

                }

            }
        );

    }
);


$$(
    ".submenu a, .menu > li:not(.tiene-sub) > a"
).forEach(
    a => {

        a.addEventListener(
            "click",
            () => {

                menu?.classList.remove(
                    "abierto"
                );


                btnMenu?.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }
        );

    }
);


// ======================================================
// ESCAPE
// ======================================================

window.addEventListener(
    "keydown",
    (e) => {

        if (
            e.key !== "Escape"
        ) {
            return;
        }


        cerrarModal();

        cerrarCarrito();


        menu?.classList.remove(
            "abierto"
        );


        btnMenu?.setAttribute(
            "aria-expanded",
            "false"
        );


        $$(".tiene-sub.abierto")
            .forEach(
                li =>
                    li.classList.remove(
                        "abierto"
                    )
            );

    }
);


// ======================================================
// TEXTO ANIMADO
// ======================================================

const palabras = [
    "tu hogar",
    "tu negocio",
    "tu oficina",
    "tus estudios",
    "tu empresa"
];

const destino =
    $("#escribiendo");


if (destino) {

    if (sinMovimiento) {

        destino.textContent =
            palabras[0];

    } else {

        let p = 0;

        let c = 0;

        let borrando = false;


        function escribir() {

            const palabra =
                palabras[p];


            c +=
                borrando
                    ? -1
                    : 1;


            destino.textContent =
                palabra.slice(
                    0,
                    c
                );


            let espera =
                borrando
                    ? 45
                    : 95;


            if (
                !borrando &&
                c ===
                    palabra.length
            ) {

                borrando =
                    true;

                espera = 1600;

            }


            else if (
                borrando &&
                c === 0
            ) {

                borrando =
                    false;

                p =
                    (p + 1) %
                    palabras.length;

                espera = 350;

            }


            window.setTimeout(
                escribir,
                espera
            );

        }


        escribir();

    }

}


// ======================================================
// CONTADORES
// ======================================================

function contar(el) {

    if (
        !el ||
        el.dataset.contado === "true"
    ) {
        return;
    }


    el.dataset.contado =
        "true";


    const meta =
        Number(
            el.dataset.contador
        );


    const sufijo =
        el.dataset.sufijo ||
        "";


    const duracion =
        1800;


    const inicio =
        performance.now();


    function paso(tiempo) {

        const progreso =
            Math.min(
                (tiempo - inicio) /
                    duracion,
                1
            );


        const valor =
            Math.round(
                meta *
                    (
                        1 -
                        Math.pow(
                            1 - progreso,
                            4
                        )
                    )
            );


        el.textContent =
            valor.toLocaleString(
                "es-PE"
            ) + sufijo;


        if (
            progreso < 1
        ) {

            requestAnimationFrame(
                paso
            );

        }

    }


    requestAnimationFrame(
        paso
    );

}


// ======================================================
// INTERSECTION OBSERVER
// ======================================================

const aparecer =
    new IntersectionObserver(
        entradas => {

            entradas.forEach(
                entrada => {

                    if (
                        !entrada.isIntersecting
                    ) {
                        return;
                    }


                    const elemento =
                        entrada.target;


                    const hermanos =
                        $$(
                            ":scope > *",
                            elemento.parentElement
                        );


                    const indice =
                        hermanos.indexOf(
                            elemento
                        );


                    elemento.style.transitionDelay =
                        `${Math.max(indice, 0) * 120}ms`;


                    elemento.classList.add(
                        "visible"
                    );


                    const numero =
                        $(
                            "[data-contador]",
                            elemento
                        );


                    if (numero) {

                        contar(
                            numero
                        );

                    }


                    aparecer.unobserve(
                        elemento
                    );

                }
            );

        },
        {
            threshold: .15
        }
    );


function activarAnimacionesTarjetas() {

    $$(".xcontenedor")
        .forEach(
            elemento => {

                aparecer.observe(
                    elemento
                );

            }
        );

}


$$(
    ".stats li, .titulo-seccion"
).forEach(
    elemento =>
        aparecer.observe(
            elemento
        )
);


// ======================================================
// TARJETAS 3D
// ======================================================

function activarEfecto3D() {

    $$(".xcontenedor")
        .forEach(
            tarjeta => {

                tarjeta.addEventListener(
                    "pointermove",
                    e => {

                        const rect =
                            tarjeta.getBoundingClientRect();


                        const x =
                            e.clientX -
                            rect.left;


                        const y =
                            e.clientY -
                            rect.top;


                        tarjeta.style.setProperty(
                            "--x",
                            `${x}px`
                        );


                        tarjeta.style.setProperty(
                            "--y",
                            `${y}px`
                        );


                        if (
                            e.pointerType ===
                                "mouse" &&
                            !sinMovimiento
                        ) {

                            tarjeta.style.setProperty(
                                "--ry",
                                `${(
                                    x /
                                    rect.width -
                                    .5
                                ) * 10}deg`
                            );


                            tarjeta.style.setProperty(
                                "--rx",
                                `${(
                                    .5 -
                                    y /
                                        rect.height
                                ) * 10}deg`
                            );

                        }

                    }
                );


                tarjeta.addEventListener(
                    "pointerleave",
                    () => {

                        tarjeta.style.setProperty(
                            "--rx",
                            "0deg"
                        );


                        tarjeta.style.setProperty(
                            "--ry",
                            "0deg"
                        );

                    }
                );

            }
        );

}


activarEfecto3D();


// ======================================================
// PARTÍCULAS
// ======================================================

const lienzo =
    $("#fondo");


if (
    lienzo &&
    !sinMovimiento
) {

    const ctx =
        lienzo.getContext(
            "2d"
        );


    if (ctx) {

        const colores = [
            "180,76,255",
            "255,60,172",
            "45,226,230"
        ];


        const raton = {
            x: -999,
            y: -999
        };


        let puntos = [];

        let ancho = 0;

        let alto = 0;


        function medir() {

            const dpr =
                Math.min(
                    window.devicePixelRatio ||
                        1,
                    2
                );


            ancho =
                window.innerWidth;


            alto =
                window.innerHeight;


            lienzo.width =
                ancho * dpr;


            lienzo.height =
                alto * dpr;


            ctx.setTransform(
                dpr,
                0,
                0,
                dpr,
                0,
                0
            );


            const cantidad =
                Math.min(
                    Math.floor(
                        ancho *
                            alto /
                            16000
                    ),
                    90
                );


            puntos =
                Array.from(
                    {
                        length:
                            cantidad
                    },
                    () => ({

                        x:
                            Math.random() *
                            ancho,

                        y:
                            Math.random() *
                            alto,

                        vx:
                            (
                                Math.random() -
                                .5
                            ) * .35,

                        vy:
                            (
                                Math.random() -
                                .5
                            ) * .35,

                        r:
                            Math.random() *
                                1.6 +
                            .6,

                        c:
                            colores[
                                Math.floor(
                                    Math.random() *
                                        colores.length
                                )
                            ]

                    })
                );

        }


        window.addEventListener(
            "resize",
            medir
        );


        window.addEventListener(
            "pointermove",
            e => {

                raton.x =
                    e.clientX;

                raton.y =
                    e.clientY;

            },
            {
                passive: true
            }
        );


        function dibujar() {

            ctx.clearRect(
                0,
                0,
                ancho,
                alto
            );


            for (
                const punto of puntos
            ) {

                punto.x +=
                    punto.vx;

                punto.y +=
                    punto.vy;


                if (
                    punto.x < 0 ||
                    punto.x > ancho
                ) {

                    punto.vx *=
                        -1;

                }


                if (
                    punto.y < 0 ||
                    punto.y > alto
                ) {

                    punto.vy *=
                        -1;

                }


                const dx =
                    punto.x -
                    raton.x;


                const dy =
                    punto.y -
                    raton.y;


                const distancia =
                    Math.hypot(
                        dx,
                        dy
                    );


                if (
                    distancia > 0 &&
                    distancia < 120
                ) {

                    punto.x +=
                        (
                            dx /
                            distancia
                        ) * 1.2;


                    punto.y +=
                        (
                            dy /
                            distancia
                        ) * 1.2;

                }


                ctx.beginPath();


                ctx.arc(
                    punto.x,
                    punto.y,
                    punto.r,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(${punto.c},.9)`;


                ctx.shadowColor =
                    `rgb(${punto.c})`;


                ctx.shadowBlur =
                    10;


                ctx.fill();

            }


            ctx.shadowBlur =
                0;


            for (
                let i = 0;
                i < puntos.length;
                i++
            ) {

                for (
                    let j = i + 1;
                    j < puntos.length;
                    j++
                ) {

                    const a =
                        puntos[i];

                    const b =
                        puntos[j];


                    const distancia =
                        Math.hypot(
                            a.x - b.x,
                            a.y - b.y
                        );


                    if (
                        distancia < 130
                    ) {

                        ctx.strokeStyle =
                            `rgba(
                                ${a.c},
                                ${
                                    (
                                        1 -
                                        distancia /
                                            130
                                    ) * .28
                                }
                            )`;


                        ctx.lineWidth =
                            .8;


                        ctx.beginPath();


                        ctx.moveTo(
                            a.x,
                            a.y
                        );


                        ctx.lineTo(
                            b.x,
                            b.y
                        );


                        ctx.stroke();

                    }

                }

            }


            requestAnimationFrame(
                dibujar
            );

        }


        medir();

        dibujar();

    }

}


// ======================================================
// NOTIFICACIÓN
// ======================================================

function mostrarNotificacion(
    mensaje
) {

    const anterior =
        $(".notificacion");

    anterior?.remove();


    const notificacion =
        document.createElement(
            "div"
        );


    notificacion.className =
        "notificacion";


    notificacion.textContent =
        mensaje;


    document.body.appendChild(
        notificacion
    );


    requestAnimationFrame(
        () => {

            notificacion.classList.add(
                "mostrar"
            );

        }
    );


    setTimeout(
        () => {

            notificacion.classList.remove(
                "mostrar"
            );


            setTimeout(
                () =>
                    notificacion.remove(),
                300
            );

        },
        2600
    );

}


// ======================================================
// INICIALIZACIÓN
// ======================================================

cargarCarrito();

cargarProductos();

actualizarCarrito();
