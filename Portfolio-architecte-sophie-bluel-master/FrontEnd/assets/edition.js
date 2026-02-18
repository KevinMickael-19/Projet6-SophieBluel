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
  const modal = document.querySelector("#modal");
  const closeModalBtn = document.querySelector(".js-close-modal");

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

    // 1. OUVRIR LA MODALE : Au clic sur "modifier"
    editLink.addEventListener("click", function (event) {
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

        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.id = liste[i].id;

        const trashIcon = document.createElement("i");
        trashIcon.classList.add("fa-solid", "fa-trash-can");
        deleteBtn.appendChild(trashIcon);

        deleteBtn.addEventListener("click", async function (event) {
          event.preventDefault();

          console.log("Clic sur la poubelle ID:", deleteBtn.id);

          //Confirmation de la suppression

          const confirmation = confirm(
            `Voulez-vous vraiment supprimer le projet "${projet.title}" ? `,
          );
          if (!confirmation) {
            return;
          }

          const id = deleteBtn.id;
          const token = localStorage.getItem("token");

          // Demande de suppression à l' API
          const response = await fetch(
            `http://localhost:5678/api/works/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            },
          );

          if (response.ok) {
            figure.remove();
            const elementPrincipal = document.querySelector(
              `.gallery figure[data-id="${id}"]`,
            );
            if (elementPrincipal) {
              elementPrincipal.remove(); //suppression du DOM
            }
            works = works.filter((work) => work.id != id);
          } else {
            alert("Erreur lors de la suppression");
          }
        });

        // 4. Assemblage (Juste l'image et l'icône)
        figure.appendChild(image);
        figure.appendChild(deleteBtn);
        modalGallery.appendChild(figure);
      }
    }

    // FERMER LA MODALE : Au clic sur la croix
    // On sélectionne TOUS les boutons qui ont la classe .js-close-modal
    const closeButtons = document.querySelectorAll(".js-close-modal");

    // On boucle pour ajouter le clic sur tous les boutons fermer
    closeButtons.forEach((button) => {
      button.addEventListener("click", function (event) {
        event.preventDefault();

        // Ferme la modale
        modal.classList.remove("modal-show");

        // Reset la vue (si la fonction existe)
        if (typeof resetModalState === "function") {
          resetModalState();
        }
      });
    });
    // Fermeture de la modale et réinitialisation de la vue au clic sur l'arrière-plan
    const modalOverlay = document.getElementById("modal");

    if (modalOverlay) {
      modalOverlay.addEventListener("click", function (event) {
        if (event.target === modalOverlay) {
          modalOverlay.classList.remove("modal-show");

          if (typeof resetModalState === "function") {
            resetModalState();
          }
        }
      });
    }
  }
}

/**
 * GESTION DE LA NAVIGATION DE LA MODALE
 * Gère le basculement entre la vue "Galerie" et la vue "Ajout photo".
 */

// Sélection des éléments du DOM
const btnAddPhoto = document.querySelector(".btn-add-photo");
const arrowReturn = document.querySelector(".modal-icon-back");
const galleryView = document.getElementById("modal-gallery-view");
const addPhotoView = document.getElementById("modal-add-view");
const modalOverlay = document.getElementById("modal");

/**
 * Affiche la vue d'ajout de photo et masque la galerie.
 */
function openAddPhotoView() {
  galleryView.classList.add("modal-view-hidden");
  addPhotoView.classList.remove("modal-view-hidden");
}

/**
 * Affiche la vue galerie et masque le formulaire d'ajout.
 */
function openGalleryView() {
  addPhotoView.classList.add("modal-view-hidden");
  galleryView.classList.remove("modal-view-hidden");
}

/**
 * Réinitialise l'état de la modale vers la vue par défaut (Galerie).
 * Utilisé lors de la fermeture de la modale pour garantir un état propre à la réouverture.
 */
function resetModalState() {
  openGalleryView();
  // TODO: Réinitialiser les champs du formulaire ici ultérieurement
}

// Écouteurs d'événements pour la navigation
if (btnAddPhoto) {
  btnAddPhoto.addEventListener("click", openAddPhotoView);
}

if (arrowReturn) {
  arrowReturn.addEventListener("click", openGalleryView);
}

// Attachement au clic sur l'arrière-plan (overlay)
if (modalOverlay) {
  modalOverlay.addEventListener("click", (event) => {
    // Vérifie que le clic est bien sur l'overlay et non sur la modale elle-même
    if (event.target === modalOverlay) {
      resetModalState();
    }
  });
}

//CHARGEMENT DES CATÉGORIES (SELECT)

async function fillCategorySelect() {
  const selectElement = document.getElementById("category");

  // Sécurité : on vérifie que l'élément existe avant de continuer
  if (!selectElement) return;

  // On vide le select pour éviter les doublons (garde l'option vide par défaut)
  selectElement.innerHTML = '<option value="" disabled selected></option>';

  try {
    const response = await fetch("http://localhost:5678/api/categories");

    if (response.ok) {
      const categories = await response.json();

      // Boucle sur chaque catégorie reçue
      categories.forEach((category) => {
        // Création de l'élément <option>
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;

        // Ajout au menu déroulant
        selectElement.appendChild(option);
      });
    } else {
      console.error("Erreur lors du chargement des catégories");
    }
  } catch (error) {
    console.error("Erreur API :", error);
  }
}
fillCategorySelect();

// GESTION DE LA PRÉVISUALISATION DE LA PHOTO

function initPhotoPreview() {
  const fileInput = document.getElementById("file");
  const previewImg = document.getElementById("preview-img");
  const removeBtn = document.getElementById("remove-photo-btn");
  const photoContainer = document.querySelector(".form-group-photo");

  if (!fileInput || !previewImg || !removeBtn || !photoContainer) return;

  const MAX_SIZE = 4 * 1024 * 1024;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert("Fichier trop volumineux (max 4Mo)");
      resetPreview();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result;
      previewImg.classList.add("preview-visible");
      removeBtn.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // 🔥 empêche la remontée vers le container
    resetPreview();
  });

  function resetPreview() {
    fileInput.value = "";
    previewImg.src = "";
    previewImg.classList.remove("preview-visible");
    removeBtn.style.display = "none";
  }
}

initPhotoPreview();


/**
 * Vérifie la validité des champs du formulaire d'ajout.
 * Gère l'état du bouton de soumission (disabled/enabled) et le feedback visuel (messages d'erreur).
 */
function checkFormValidity() {
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const fileInput = document.getElementById("file");
  const submitBtn = document.querySelector(".btn-submit");
  const errorMessage = document.getElementById("error-message");

  // Guard clause : arrêt si les éléments du DOM sont introuvables
  if (
    !titleInput ||
    !categorySelect ||
    !fileInput ||
    !submitBtn ||
    !errorMessage
  )
    return;

  // Fonction de mise à jour de l'interface utilisateur
  const updateUI = () => {
    const isTitleValid = titleInput.value.trim() !== "";
    const isCategoryValid = categorySelect.value !== "";
    const isFileValid = fileInput.files.length > 0;
    const isFormValid = isTitleValid && isCategoryValid && isFileValid;

    // Bascule de l'état du bouton submit
    submitBtn.disabled = !isFormValid;
    isFormValid
      ? submitBtn.classList.add("btn-submit-active")
      : submitBtn.classList.remove("btn-submit-active");

    // Gestion des messages d'erreur (Priorité : Fichier > Titre > Catégorie)
    if (isFormValid) {
      errorMessage.textContent = "";
    } else if (!isFileValid) {
      errorMessage.textContent = "Image requise.";
    } else if (!isTitleValid) {
      errorMessage.textContent = "Titre requis.";
    } else if (!isCategoryValid) {
      errorMessage.textContent = "Catégorie requise.";
    }
  };

  // Attachement des écouteurs d'événements pour une validation en temps réel
  titleInput.addEventListener("input", updateUI);
  categorySelect.addEventListener("change", updateUI);
  fileInput.addEventListener("change", updateUI);
}

// Initialisation au chargement
checkFormValidity();

/**
 * TRAITEMENT DU TÉLÉVERSEMENT (UPLOAD)
 * Gestion de l'envoi du nouveau projet vers l'API.
 */
async function processUpload() {
  // Sélection des éléments DOM
  const form = document.getElementById("add-photo-form");
  const previewImg = document.getElementById("preview-img");
  const submitBtn = document.querySelector(".btn-submit");

  // Vérification de l'existence des éléments
  if (!form || !previewImg || !submitBtn) return;

  // Ajout de l'écouteur d'événement sur la soumission
  form.addEventListener("submit", async (event) => {
    // Annulation du rechargement par défaut
    event.preventDefault();

    // Instanciation des données du formulaire
    const formData = new FormData(form);

    // Récupération du jeton d'authentification
    const token = localStorage.getItem("token");

    // Contrôle de la connexion utilisateur
    if (!token) {
      alert("Authentification requise");
      return;
    }

    try {
      // Exécution de la requête POST vers l'API
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      // Traitement de la réponse serveur
      if (response.ok) {
        // --- REMPLACEMENT DU BLOC LIGNES 487-504 ---

        // 1. On récupère les infos du projet créé par l'API (ID, url, titre...)
        const newWork = await response.json();

        // 2. AJOUT DANS LA GALERIE PRINCIPALE (Page d'accueil)
        const mainGallery = document.querySelector(".gallery");
        if (mainGallery) {
          const figure = document.createElement("figure");
          figure.dataset.id = newWork.id; // Important pour pouvoir le supprimer plus tard

          const img = document.createElement("img");
          img.src = newWork.imageUrl;
          img.alt = newWork.title;

          const caption = document.createElement("figcaption");
          caption.innerText = newWork.title;

          figure.appendChild(img);
          figure.appendChild(caption);
          mainGallery.appendChild(figure);
        }

        // 3. AJOUT DANS LA MODALE (Vue suppression)
        const modalGallery = document.querySelector(".modal-gallery");
        if (modalGallery) {
          const figure = document.createElement("figure");
          figure.dataset.id = newWork.id;
          figure.style.position = "relative"; // Pour placer l'icône

          const img = document.createElement("img");
          img.src = newWork.imageUrl;
          img.alt = newWork.title;
          img.style.width = "78px";

          // Création du bouton poubelle pour le projet créé
          const trashBtn = document.createElement("button");
          trashBtn.className = "delete-btn";
          trashBtn.id = newWork.id;
          trashBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

          // Permet de rendre la poubelle active sans avoir à recharger la page
          trashBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            if (
              confirm(`Voulez-vous supprimer le projet "${newWork.title} ?`)
            ) {
              await fetch(`http://localhost:5678/api/works/${newWork.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              });
              // Suppression visuelle immédiate
              figure.remove(); // Modale
              const mainFig = document.querySelector(
                `.gallery figure[data-id="${newWork.id}"]`,
              );
              if (mainFig) mainFig.remove(); // Galerie
            }
          });

          figure.appendChild(img);
          figure.appendChild(trashBtn);
          modalGallery.appendChild(figure);
        }

        // 4. RESET DE L'INTERFACE
        form.reset(); // Vide les champs texte
        previewImg.src = ""; // Vide l'image
        previewImg.style.display = "none"; // Cache la balise img si nécessaire
        // Si tu as une classe spécifique pour cacher/montrer la preview :
        if (previewImg.classList.contains("preview-visible")) {
          previewImg.classList.remove("preview-visible");
        }

        // Remet le bouton Valider en gris
        submitBtn.classList.remove("btn-submit-active");
        submitBtn.disabled = true;

        // Ferme la modale
        const modal = document.getElementById("modal");
        /*  modal.classList.remove("modal-show"); */

        // Revient sur la vue "Galerie" pour la prochaine ouverture
        if (typeof resetModalState === "function") {
          resetModalState();
        }
      } else {
        // Gestion des erreurs de validation API
        console.error("Échec de l'upload");
        alert("Erreur lors de l'envoi. Vérification du formulaire requise.");
      }
    } catch (error) {
      // Gestion des erreurs réseau
      console.error("Erreur réseau :", error);
    }
  });
}

// Initialisation du processus
processUpload();
