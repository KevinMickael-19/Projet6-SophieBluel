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

console.log("LE SCRIPT EST CHARGE")

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

    btnTous.addEventListener("click", function() {
        console.log("Tu as cliqué sur : TOUS");
        genererGallery(works);
    });

    for(let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const btn = document.createElement("button");
        btn.innerText = category.name;
        zoneFiltres.appendChild(btn);

        btn.addEventListener("click", function() {
            console.log("J'ai cliqué sur :", category.name);
            console.log("ID de la catégorie demandée :", category.id);
            
            const worksFiltres = works.filter(function(work) {
                console.log("Je compare avec le projet :", work.title, "qui a l'ID catégorie :", work.categoryId);
                return work.categoryId === category.id;
            });

            console.log("Nombre de projets trouvés :", worksFiltres.length);
            genererGallery(worksFiltres);
        });

        btn.addEventListener("click", function() {
            const worksFiltres = works.filter(function(work) {
            return work.categoryId === category.id;
            });
            genererGallery(worksFiltres);
        });
    }
}
getCategories();
getWorks();

// On récupère le token
const token = localStorage.getItem("token");

// SI ON EST CONNECTÉ (Token présent)
if (token) {
    
    // 1. Création de la barre noire
    const topBar = document.createElement("div");
    topBar.classList.add("edition-mode-banner"); // On ajoute la classe CSS
    topBar.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
    document.body.prepend(topBar);

    // 2. Décalage du header (pour pas qu'il soit sous la barre)
    const header = document.querySelector("header");
    if (header) {
        header.classList.add("header-decale");
    }

    // 3. Changement Login -> Logout
    const loginLink = document.querySelector("nav ul li a[href='login.html']");
    if (loginLink) {
        loginLink.innerText = "logout";
        loginLink.href = "#";
        // Clic sur logout = déconnexion
        loginLink.addEventListener("click", () => {
            localStorage.removeItem("token");
            window.location.reload();
        });
    }

    // 4. Cacher les filtres
    const filters = document.querySelector(".filters");
    if (filters) {
        filters.classList.add("hidden"); // On ajoute la classe qui cache
    }

    // 5. Ajout du bouton "Modifier" à côté de "Mes Projets"
    const titleProjects = document.querySelector("#portfolio h2");
    if (titleProjects) {
        const editLink = document.createElement("a");
        editLink.href = "#";
        editLink.classList.add("edit-btn"); // On ajoute la classe CSS
        editLink.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
        titleProjects.appendChild(editLink);
    }
}