// Récupère les travaux depuis le serveur

let works = [];

async function getWorks() {
  const reponse = await fetch("http://localhost:5678/api/works");
  works = await reponse.json();
  genererGallery(works); // On lance l'affichage
}

// Affiche les travaux dans la galerie

function genererGallery(works) {
  const sectionGallery = document.querySelector(".gallery");
  sectionGallery.innerHTML = "";

  for (let i = 0; i < works.length; i++) {
    const work = works[i];

    const figure = document.createElement("figure");
    figure.dataset.id = work.id;
    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const figcaption = document.createElement("figcaption");
    figcaption.innerText = work.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    sectionGallery.appendChild(figure);
  }
}

console.log("LE SCRIPT EST CHARGE");

async function getCategories() {
  const reponse = await fetch("http://localhost:5678/api/categories");

  const categories = await reponse.json();

  genererBoutons(categories);
}

function genererBoutons(categories) {
  const zoneFiltres = document.querySelector(".filters");

  const btnTous = document.createElement("button");
  btnTous.innerText = "Tous";
  zoneFiltres.appendChild(btnTous);

  btnTous.addEventListener("click", function () {
    console.log("Tu as cliqué sur : TOUS");
    genererGallery(works);
  });

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const btn = document.createElement("button");
    btn.innerText = category.name;
    zoneFiltres.appendChild(btn);

    btn.addEventListener("click", function () {
      console.log("J'ai cliqué sur :", category.name);
      console.log("ID de la catégorie demandée :", category.id);

      const worksFiltres = works.filter(function (work) {
        console.log(
          "Je compare avec le projet :",
          work.title,
          "qui a l'ID catégorie :",
          work.categoryId,
        );
        return work.categoryId === category.id;
      });

      console.log("Nombre de projets trouvés :", worksFiltres.length);
      genererGallery(worksFiltres);
    });
  }
}
getCategories();
getWorks();


