// 🔹 CONFIGURACIÓN SUPABASE
const SUPABASE_URL = "https://uhtgacknvilqgndpdisw.supabase.co";
const SUPABASE_KEY = "sb_publishable_3lpTTou4N9H6pH0TBAbdeQ_FUbJEf8P";

// 🔹 CLIENTE SUPABASE
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🔹 BANCO DE PREGUNTAS (10)
const bancoPreguntas = [
  "¿Has dormido menos de 6 horas o sientes pesadez en los ojos?",
  "¿Te sientes hoy más lento de lo habitual para reaccionar ante un aviso?",
  "¿Has olvidado algún paso del procedimiento PETS en la última hora?",
  "¿Sientes que el tiempo se pasa muy lento o estás \"automático\"?",
  "¿Te saltaste el desayuno o te sientes deshidratado/sediento?",
  "¿Sientes opresión en el pecho o ansiedad al pensar en subir o entrar al área?",
  "¿Has tenido una discusión fuerte con un colega o familiar hace poco?",
  "¿Dudas de la capacidad del vigía o de tus compañeros hoy?",
  "¿Sientes que hay demasiada presión de tiempo para terminar la tarea?",
  "¿Te irrita que te corrijan o te den instrucciones adicionales hoy?"
];

// 🔹 TOMAR 5 PREGUNTAS AL AZAR
function obtenerPreguntas() {
  return [...bancoPreguntas]
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
}

let preguntasSeleccionadas = obtenerPreguntas();
let respuestas = new Array(5).fill(null);
let enviandoResultado = false;

// 🔹 PINTAR PREGUNTAS
const contenedor = document.getElementById("preguntas");
contenedor.innerHTML = "";

preguntasSeleccionadas.forEach((pregunta, i) => {
  const div = document.createElement("div");
  div.className = "pregunta";
  div.id = `pregunta-${i}`;

  div.innerHTML = `
    <p class="texto-pregunta">${i + 1}. ${pregunta}</p>
    <div class="grupo-botones">
      <button type="button" class="btn-si" onclick="responder(${i}, true)">Sí</button>
      <button type="button" class="btn-no" onclick="responder(${i}, false)">No</button>
    </div>
  `;

  contenedor.appendChild(div);
});

// 🔹 MARCAR RESPUESTA
function responder(index, valor) {
  respuestas[index] = valor;

  const grupo = document.getElementById(`pregunta-${index}`);
  const botones = grupo.querySelectorAll("button");

  botones.forEach(btn => btn.classList.remove("seleccionado-si", "seleccionado-no"));

  if (valor === true) {
    botones[0].classList.add("seleccionado-si");
  } else {
    botones[1].classList.add("seleccionado-no");
  }
}

// 🔹 MENSAJE DE ESTADO
function mostrarMensajeEstado(tipo, texto) {
  let caja = document.getElementById("mensaje-estado");

  if (!caja) {
    caja = document.createElement("div");
    caja.id = "mensaje-estado";
    caja.className = "mensaje-estado";
    const pantallaPreguntas = document.getElementById("pantalla-preguntas");
    pantallaPreguntas.insertBefore(caja, pantallaPreguntas.firstChild);
  }

  caja.className = `mensaje-estado ${tipo}`;
  caja.textContent = texto;
  caja.style.display = "block";
}

function ocultarMensajeEstado() {
  const caja = document.getElementById("mensaje-estado");
  if (caja) {
    caja.style.display = "none";
    caja.textContent = "";
  }
}

// 🔹 GUARDAR EN SUPABASE
async function guardarEvaluacion(data) {
  try {
    const { error } = await supabaseClient
      .from("evaluaciones")
      .insert([data]);

    if (error) {
      console.error("Error guardando evaluación:", error);
      return {
        ok: false,
        mensaje: "No se pudo guardar la evaluación. Verifica tu conexión e inténtalo nuevamente."
      };
    }

    return {
      ok: true,
      mensaje: "Evaluación guardada correctamente."
    };
  } catch (err) {
    console.error("Error de red o conexión:", err);
    return {
      ok: false,
      mensaje: "Hubo un problema de conexión o internet. Revisa la red e inténtalo nuevamente."
    };
  }
}

// 🔹 CALCULAR RESULTADO
async function calcularResultado() {
  if (enviandoResultado) return;

  if (respuestas.includes(null)) {
    mostrarMensajeEstado("error", "Debes responder las 5 preguntas antes de ver el resultado.");
    return;
  }

  ocultarMensajeEstado();

  const btnResultado = document.getElementById("btnResultado");
  enviandoResultado = true;
  btnResultado.disabled = true;
  btnResultado.textContent = "Procesando...";

  const totalSi = respuestas.filter(r => r === true).length;

  let estado = "";
  let color = "";
  let interpretacion = "";
  let recomendaciones = [];
  let imagenEstado = "";

  if (totalSi <= 1) {
    estado = "Apto";
    color = "verde";
    interpretacion = "Energía positiva y enfoque total.";
    imagenEstado = "img/bateria-verde.png";
    recomendaciones = [
      "Usa tu enfoque para detectar fallas mínimas en tus equipos de actividades críticas como arnés y equipos de seguridad en espacios confinados.",
      "Respeta estrictamente las distancias de seguridad y el etiquetado de cada producto químico.",
      "Aprovecha tu tranquilidad para trabajar a un ritmo constante, sin correr ni confiarte de más."
    ];
  } else if (totalSi === 2) {
    estado = "Observado";
    color = "amarillo";
    interpretacion = "Equilibrio frágil. Precaución.";
    imagenEstado = "img/bateria-amarillo.png";
    recomendaciones = [
      "Detente 3 minutos antes de iniciar para repasar mentalmente cada paso de tu procedimiento.",
      "Bebe un vaso de agua ahora para mejorar tu claridad mental y reducir la fatiga ligera.",
      "Evita las prisas; realiza tus movimientos en altura o espacios confinados de forma lenta y deliberada."
    ];
  } else if (totalSi === 3) {
    estado = "Alerta";
    color = "naranja";
    interpretacion = "Fatiga/Estrés evidente. Capacidad reducida.";
    imagenEstado = "img/bateria-naranja.png";
    recomendaciones = [
      "Toma un descanso de 10 a 15 minutos fuera del área crítica para estirar y recuperar el enfoque.",
      "No inicies ninguna maniobra en altura o actividad crítica sin que un supervisor verifique tu seguridad.",
      "Consume agua y un refrigerio ligero para combatir la fatiga física que nubla tu juicio.",
      "Concéntrate exclusivamente en una sola acción a la vez para evitar errores operativos por saturación."
    ];
  } else {
    estado = "No Apto";
    color = "rojo";
    interpretacion = "Riesgo Psicosocial Crítico. Pare inmediato.";
    imagenEstado = "img/bateria-rojo.png";
    recomendaciones = [
      "Detén la tarea de alto riesgo de inmediato; tu estado actual es una condición insegura.",
      "Comunica a tu supervisor tu estado para gestionar una reubicación temporal a tareas administrativas.",
      "No utilices arnés ni ingreses a tanques; el estrés crítico anula tu capacidad de respuesta ante emergencias.",
      "Busca al personal de bienestar o salud ocupacional para conversar sobre la carga que te está afectando."
    ];
  }

  const listaHTML = recomendaciones.map(item => `<li>${item}</li>`).join("");

  const detalleRespuestas = preguntasSeleccionadas.map((pregunta, i) => ({
    pregunta: pregunta,
    respuesta: respuestas[i] ? "Sí" : "No"
  }));

  const registro = {
  preguntas: JSON.stringify(preguntasSeleccionadas),
  respuestas: JSON.stringify(detalleRespuestas),
  total_si: totalSi,
  estado: estado,
  color: color,
  recomendacion: recomendaciones.join(" | "),
  fecha_local: new Date().toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
};

  const resultadoGuardado = await guardarEvaluacion(registro);

  if (!resultadoGuardado.ok) {
    mostrarMensajeEstado("error", resultadoGuardado.mensaje);
    btnResultado.disabled = false;
    btnResultado.textContent = "Ver resultado";
    enviandoResultado = false;
    return;
  }

  mostrarMensajeEstado("exito", resultadoGuardado.mensaje);

  setTimeout(() => {
    document.getElementById("pantalla-preguntas").style.display = "none";
document.getElementById("pantalla-resultado").style.display = "block";
window.scrollTo({ top: 0, behavior: "smooth" });

    document.getElementById("pantalla-resultado").innerHTML = `
      <div class="resultado-card">
        <img src="${imagenEstado}" alt="${estado}" class="estado-img">

        <div class="estado-texto ${color}">${estado}</div>

        <div class="interpretacion">${interpretacion}</div>

        <div class="total-si"><strong>Total de respuestas Sí:</strong> ${totalSi}</div>

        <ul class="recomendaciones">
          ${listaHTML}
        </ul>

        <div class="acciones-finales">
          <button class="btn-accion" onclick="location.reload()">Nueva evaluación</button>
          <button class="btn-secundario" onclick="finalizarEncuesta()">Finalizar</button>
        </div>
      </div>
    `;
  }, 500);
}

// 🔹 PANTALLA FINAL
function finalizarEncuesta() {
  const logoSuperior = document.querySelector(".logo");
  const titulo = document.querySelector("h1");

  if (logoSuperior) logoSuperior.style.display = "none";
  if (titulo) titulo.style.display = "none";

  document.getElementById("pantalla-resultado").innerHTML = `
    <div class="resultado-card cierre-final">
      <img src="logo-mod-5.png" alt="ESSAC" class="logo-final">
      <h2>Gracias por participar</h2>
      <p class="empresa-final">Engineering Services S.A.C.</p>
      <button class="btn-accion" onclick="location.reload()">Volver al inicio</button>
    </div>
  `;

  window.scrollTo({ top: 0, behavior: "smooth" });
}