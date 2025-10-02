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

  // lista habilidades
  const ul = document.getElementById("poke-habilidades");
  ul.innerHTML = "";
  p.abilities.forEach((a) => {
    const li = document.createElement("li");
    li.textContent = a.ability.name;
    ul.appendChild(li);
  });
}
