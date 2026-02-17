// Déclaration de l'URL de base
const API_BASE_URL = "http://localhost:5678/api";
// Variable globale pour stocker les travaux
let works = [];

// Récupération des travaux depuis l'API et lancement de l'affichage
async function getWorks() {
  try {
    const reponse = await fetch(`${API_BASE_URL}/works`);
    if (!reponse.ok) {
      throw new Error(`${API_BASE_URL}/works`);
    }
    works = await reponse.json();
    genererGallery(works); // On lance l'affichage
  } catch (error) {
    console.error("Erreur lors du chargement des projets: ", error);
  }
}

// Affiche les travaux dans la galerie

function genererGallery(works) {
  const sectionGallery = document.querySelector(".gallery");
  sectionGallery.innerHTML = "";

  const fragment = document.createDocumentFragment();

  works.forEach((work) => {
    const figure = document.createElement("figure");
    figure.dataset.id = work.id;
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = work.title;

    figure.append(img, figcaption);
    fragment.appendChild(figure);
  });
  sectionGallery.appendChild(fragment);
}

async function getCategories() {
  try {
    const reponse = await fetch(`${API_BASE_URL}/categories`);
    if (!reponse.ok) {
      throw new Error("Erreur API works");
    }

    const categories = await reponse.json();
    genererBoutons(categories);
  } catch (error) {
    console.error("Erreur lors du chargement des projets :", error);
  }
}

function genererBoutons(categories) {
  const zoneFiltres = document.querySelector(".filters");

  const btnTous = document.createElement("button");
  btnTous.textContent = "Tous";
  btnTous.classList.add("active");
  zoneFiltres.appendChild(btnTous);

  btnTous.addEventListener("click", function () {
    genererGallery(works);

    document
      .querySelectorAll(".filters button")
      .forEach((btn) => btn.classList.remove("active"));
    btnTous.classList.add("active");
  });

  categories.forEach((category) => {
    const btn = document.createElement("button");
    btn.textContent = category.name;
    zoneFiltres.appendChild(btn);

    btn.addEventListener("click", function () {
      const worksFiltres = works.filter(function (work) {
        return work.categoryId === category.id;
      });
      genererGallery(worksFiltres);

      // Gestion de la classe active
      document
        .querySelectorAll(".filters button")
        .forEach((btn) => btn.classList.remove("active"));
      btn.classList.add("active");
    });
  });
}

getCategories();
getWorks();
