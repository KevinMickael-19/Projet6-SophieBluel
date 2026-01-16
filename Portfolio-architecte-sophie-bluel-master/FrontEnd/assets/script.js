// Récupère les travaux depuis le serveur

async function getWorks() {
    const reponse = await fetch("http://localhost:5678/api/works");
    const works = await reponse.json();
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
    });

    for(let i = 0; i < categories.length; i++) {
        const category = categories[i];
        const btn = document.createElement("button");
        btn.innerText = category.name;
        zoneFiltres.appendChild(btn);

        btn.addEventListener("click", function() {
            console.log("Tu as cliqué sur : " + category.name);
        });
    }
}
getCategories();
getWorks();