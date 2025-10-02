// Cambiar tema

const btnTema = document.getElementById("btn-tema");

btnTema.addEventListener("click", () => {
  document.body.classList.toggle("tema-oscuro");
});

//Buscar pokemon

const formBusqueda = document.querySelector(".form-busqueda");
const inputBusqueda = document.querySelector(".form_input");
const pokemonInfo = document.getElementById("pokemon-info");

formBusqueda.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = inputBusqueda.value.trim().toLowerCase();
  if (!query) return;

  // Estado inicial
  document.getElementById("poke-nombre").textContent = "Buscando...";
  document.getElementById("poke-id").textContent = "---";
  document.getElementById("poke-altura").textContent = "---";
  document.getElementById("poke-peso").textContent = "---";
  document.getElementById("poke-img").src = "";
  document.getElementById("poke-img").alt = "Imagen no disponible";
  document.getElementById("poke-tipos").innerHTML = "";
  document.getElementById("poke-habilidades").innerHTML = "";
  document.getElementById("poke-nombre").style.color = "var(--letrasLight)";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${query}`);
    if (!res.ok) {
      document.getElementById("poke-nombre").textContent =
        "Pokemon no encontrado";
      document.getElementById("poke-nombre").style.color = "red";
      return;
    }

    const data = await res.json();
    renderPokemon(data);
  } catch (error) {
    document.getElementById("poke-nombre").textContent = "Error de conexion";
  }
});

// Mostrar info del pokemon

function renderPokemon(p) {
  document.getElementById("poke-nombre").textContent = p.name.toUpperCase();
  document.getElementById("poke-id").textContent = p.id;
  document.getElementById("poke-altura").textContent = p.height;
  document.getElementById("poke-peso").textContent = p.weight;
  document.getElementById("poke-nombre").style.color = "var(--letrasLight)";

  // Imagen
  const img = document.getElementById("poke-img");
  img.src = p.sprites.other["official-artwork"].front_default;
  img.alt = p.name;

  // chips
  const tiposDiv = document.getElementById("poke-tipos");
  tiposDiv.innerHTML = "";
  p.types.forEach((t) => {
    const chip = document.createElement("span");
    chip.textContent = t.type.name;
    chip.classList.add("chip-tipo");
    tiposDiv.appendChild(chip);
  });

  agregarReciente({ id: p.id, name: p.name });

  const btnFichaFav = document.getElementById("btn-fav-ficha");
  btnFichaFav.onclick = () => {
    agregarFavorito({ id: p.id, name: p.name });
  };

  // lista habilidades
  const ul = document.getElementById("poke-habilidades");
  ul.innerHTML = "";
  p.abilities.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = a.ability.name;
    ul.appendChild(li);
  });
}

// Lista y paginacion

const listaPokemon = document.getElementById("lista-pokemon");
const paginacionDiv = document.getElementById("paginacion");

let paginaActual = 1;
const porPagina = 24;
let totalPokemons = 0;

async function cargarLista(pagina = 1) {
  listaPokemon.innerHTML = "<p> Cargando lista </p>";
  const offset = (pagina - 1) * porPagina;

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${porPagina}`
    );
    if (!res.ok) throw new Error("Error al cargar la lista");
    const data = await res.json();

    totalPokemons = data.count;
    renderLista(data.results);
    renderPaginacion(pagina);
    paginaActual = pagina;
  } catch (error) {
    listaPokemon.innerHTML = "<p> Error al cargar la lista </p>";
  }
}

function renderLista(pokemons) {
  listaPokemon.innerHTML = "";
  pokemons.forEach((p) => {
    const id = p.url.split("/")[6];
    const img = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    const card = document.createElement("div");
    card.classList.add("card-pokemon");
    card.innerHTML = `
      <button class="btn-fav">⭐</button>
      <img src="${img}" alt="${p.name}">
      <p>${p.name}</p>
      <p class="card-id">#${id}</p>
    `;

    // Favorito
    const btnFav = card.querySelector(".btn-fav");
    btnFav.addEventListener("click", (e) => {
      e.stopPropagation();
      agregarFavorito({ id, name: p.name });
    });
    //--Favorito fin

    card.addEventListener("click", async (e) => {
      if (e.target.classList.contains("btn-fav")) return;
      const detalle = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await detalle.json();
      renderPokemon(data);
    });

    listaPokemon.appendChild(card);
  });
}

function renderPaginacion(pagina) {
  const totalPaginas = Math.ceil(totalPokemons / porPagina);
  paginacionDiv.innerHTML = "";

  const btnPrimero = document.createElement("button");
  btnPrimero.textContent = "Primero";
  btnPrimero.disabled = pagina === 1;
  btnPrimero.onclick = () => cargarLista(1);
  paginacionDiv.appendChild(btnPrimero);

  const btnAnterior = document.createElement("button");
  btnAnterior.textContent = "Anterior";
  btnAnterior.disabled = pagina === 1;
  btnAnterior.onclick = () => cargarLista(pagina - 1);
  paginacionDiv.appendChild(btnAnterior);

  for (
    let i = Math.max(1, pagina - 2);
    i <= Math.min(totalPaginas, pagina + 2);
    i++
  ) {
    const btnNum = document.createElement("button");
    btnNum.textContent = i;
    if (i === pagina) btnNum.style.background = "#ccc";
    btnNum.onclick = () => cargarLista(i);
    paginacionDiv.appendChild(btnNum);
  }

  const btnSiguiente = document.createElement("button");
  btnSiguiente.textContent = "Siguiente";
  btnSiguiente.disabled = pagina === totalPaginas;
  btnSiguiente.onclick = () => cargarLista(pagina + 1);
  paginacionDiv.appendChild(btnSiguiente);

  const btnUltimo = document.createElement("button");
  btnUltimo.textContent = "Último";
  btnUltimo.disabled = pagina === totalPaginas;
  btnUltimo.onclick = () => cargarLista(totalPaginas);
  paginacionDiv.appendChild(btnUltimo);
}
cargarLista();

// Recientes y Favoritos
const recientesDiv = document.getElementById("recientes-lista");
const favoritosDiv = document.getElementById("favoritos-lista");

let recientes = JSON.parse(localStorage.getItem("recientes")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

function agregarReciente(pokemon) {
  if (recientes.length > 0 && recientes[0].id === pokemon.id) return;
  recientes = recientes.filter((r) => r.id !== pokemon.id);
  recientes.unshift(pokemon);
  if (recientes.length > 10) recientes.pop();
  localStorage.setItem("recientes", JSON.stringify(recientes));
  renderRecientes();
}

function renderRecientes() {
  recientesDiv.innerHTML = "";
  recientes.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("item-lista");
    div.textContent = `#${p.id} ${p.name}`;
    div.addEventListener("click", async () => {
      const detalle = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
      const data = await detalle.json();
      renderPokemon(data);
      agregarReciente({ id: p.id, name: p.name });
    });
    recientesDiv.appendChild(div);
  });
}

function agregarFavorito(pokemon) {
  if (favoritos.some((f) => f.id === pokemon.id)) return;

  if (favoritos.length >= 50) return;

  favoritos.push(pokemon);

  localStorage.setItem("favoritos", JSON.stringify(favoritos));

  renderFavoritos();
}

function renderFavoritos() {
  favoritosDiv.innerHTML = "";
  favoritos.forEach((p) => {
    const div = document.createElement("div");
    div.classList.add("item-lista");
    div.textContent = `#${p.id} ${p.name}`;
    const btnDel = document.createElement("button");
    btnDel.textContent = "X";
    btnDel.style.marginLeft = "8px";
    btnDel.style.background = "red";
    btnDel.style.color = "white";
    btnDel.style.border = "none";
    btnDel.style.borderRadius = "4px";
    btnDel.style.cursor = "pointer";

    btnDel.addEventListener("click", (e) => {
      e.stopPropagation();
      eliminarFavorito(p.id);
    });

    div.appendChild(btnDel);

    div.addEventListener("click", async () => {
      const detalle = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
      const data = await detalle.json();
      renderPokemon(data);
      agregarReciente({ id: p.id, name: p.name });
    });

    favoritosDiv.appendChild(div);
  });
}

function eliminarFavorito(id) {
  favoritos = favoritos.filter((f) => f.id !== id);
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  renderFavoritos();
}

renderRecientes();
renderFavoritos();
