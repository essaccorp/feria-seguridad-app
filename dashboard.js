const SUPABASE_URL = "https://uhtgacknvilqgndpdisw.supabase.co";
const SUPABASE_KEY = "sb_publishable_3lpTTou4N9H6pH0TBAbdeQ_FUbJEf8P";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function cargarDashboard() {
  const { data, error } = await supabaseClient
    .from("evaluaciones")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error cargando dashboard:", error);
    document.getElementById("tablaEvaluaciones").innerHTML = `
      <tr><td colspan="4">No se pudieron cargar los datos.</td></tr>
    `;
    return;
  }

  const total = data.length;
  const apto = data.filter(x => x.estado === "Apto").length;
  const observado = data.filter(x => x.estado === "Observado").length;
  const alerta = data.filter(x => x.estado === "Alerta").length;
  const noApto = data.filter(x => x.estado === "No Apto").length;

  document.getElementById("totalEvaluaciones").textContent = total;
  document.getElementById("totalApto").textContent = apto;
  document.getElementById("totalObservado").textContent = observado;
  document.getElementById("totalAlerta").textContent = alerta;
  document.getElementById("totalNoApto").textContent = noApto;

  const porcentaje = (valor) => total > 0 ? ((valor / total) * 100).toFixed(1) : 0;

  document.getElementById("barraApto").style.width = `${porcentaje(apto)}%`;
  document.getElementById("barraApto").textContent = apto;

  document.getElementById("barraObservado").style.width = `${porcentaje(observado)}%`;
  document.getElementById("barraObservado").textContent = observado;

  document.getElementById("barraAlerta").style.width = `${porcentaje(alerta)}%`;
  document.getElementById("barraAlerta").textContent = alerta;

  document.getElementById("barraNoApto").style.width = `${porcentaje(noApto)}%`;
  document.getElementById("barraNoApto").textContent = noApto;

  const tbody = document.getElementById("tablaEvaluaciones");

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No hay evaluaciones registradas todavía.</td></tr>`;
  } else {
    tbody.innerHTML = data.slice(0, 12).map(item => `
      <tr>
        <td>${item.fecha_local || "-"}</td>
        <td>${item.estado || "-"}</td>
        <td>${item.color || "-"}</td>
        <td>${item.total_si ?? "-"}</td>
      </tr>
    `).join("");
  }

  const ahora = new Date().toLocaleString("es-PE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  document.getElementById("ultimaActualizacion").textContent = `Última actualización: ${ahora}`;
}

cargarDashboard();

// Actualización automática cada 3 segundos
setInterval(cargarDashboard, 3000);