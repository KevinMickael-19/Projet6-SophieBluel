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
  

    // === GESTION DE LA MODALE ===
    const modal = document.querySelector("#modal");
    const closeModalBtn = document.querySelector(".js-close-modal");

    // 1. OUVRIR LA MODALE : Au clic sur "modifier"
    editLink.addEventListener("click", function(event) {
        event.preventDefault();
        modal.classList.add("modal-show"); // On ajoute la classe qui affiche
        genererGalerieModale(works);
    });

// Fonction pour générer la galerie dans la modale

function genererGalerieModale(liste) {
    const modalGallery = document.querySelector(".modal-gallery");
    modalGallery.innerHTML = ""; // On vide la galerie

    for (let i = 0; i < liste.length; i++) {
        const projet = liste[i];

        // 1. Création de la balise figure
        const figure = document.createElement("figure");
        figure.style.position = "relative";

        // 2. Création de l'image
        const image = document.createElement("img");
        image.src = projet.imageUrl;
        image.alt = projet.title;
        image.style.width = "78px";

        // 3. Création de l'icône poubelle

        const deleteBtn =document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.id = liste[i].id;

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa-solid", "fa-trash-can");
        deleteBtn.appendChild(trashIcon);

        deleteBtn.addEventListener("click" , async function (event) {
            event.preventDefault();

            console.log("Clic sur la poubelle ID:" , deleteBtn.id);

            //Confirmation de la suppression

            const confirmation = confirm(`Voulez-vous vraiment supprimer le projet "${projet.title}" ? `)
            if (!confirmation){
                return;
            }

            const id = deleteBtn.id;
            const token = localStorage.getItem("token");

            // Demande de suppression à l' API
            const response = await fetch(`http://localhost:5678/api/works/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization" : `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if(response.ok) {
                figure.remove();
                const elementPrincipal = document.querySelector(`.gallery figure[data-id="${id}"]`);
                if (elementPrincipal) {
                    elementPrincipal.remove(); //suppression du DOM
                }
                works = works.filter(work=> work.id !=id);
            } else {
                alert ("Erreur lors de la suppression");
            }
        });

        // 4. Assemblage (Juste l'image et l'icône)
        figure.appendChild(image);
        figure.appendChild(deleteBtn);
        modalGallery.appendChild(figure);
    }
}

// 2. FERMER LA MODALE : Au clic sur la croix
    closeModalBtn.addEventListener("click", function(event) {
        event.preventDefault();
        modal.classList.remove("modal-show"); // On retire la classe
    });

    // 3. FERMER LA MODALE : Au clic sur le fond gris
    modal.addEventListener("click", function(event) {
        // Si on clique précisément sur le fond gris (modal) et pas sur la boîte blanche
        if (event.target === modal) {
            modal.classList.remove("modal-show");
        }
    });

    }  
}



