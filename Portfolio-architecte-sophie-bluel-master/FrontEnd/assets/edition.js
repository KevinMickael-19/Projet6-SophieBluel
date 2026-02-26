// On récupère le token
const token = localStorage.getItem("token");

// SI ON EST CONNECTÉ (Token présent)

if (token) {
  // Initialisation de la bannière d'édition
  const topBar = document.createElement("div");
  topBar.classList.add("edition-mode-banner");
  topBar.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
  document.body.prepend(topBar);

  // Ajustement de la disposition du header
  const header = document.querySelector("header");
  if (header) header.classList.add("header-decale");

  // Mise à jour de la navigation (Authentification)
  const loginLink = document.querySelector("nav ul li a[href='login.html']");
  if (loginLink) {
    loginLink.innerText = "logout";
    loginLink.href = "#";
    loginLink.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });
  }

  // Masquage conditionnel des filtres de la galerie
  const filters = document.querySelector(".filters");
  if (filters) filters.classList.add("hidden");

  // Initialisation des éléments de la modale
  const modal = document.querySelector("#modal");
  const modalGallery = document.querySelector(".modal-gallery");

  // Injection du déclencheur de la modale d'édition
  const titleProjects = document.querySelector("#portfolio h2");
  if (titleProjects) {
    const editLink = document.createElement("a");
    editLink.href = "#";
    editLink.classList.add("edit-btn");
    editLink.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> modifier';
    titleProjects.appendChild(editLink);

    editLink.addEventListener("click", (event) => {
      event.preventDefault();
      modal.classList.add("modal-show");
      genererGalerieModale(works);
    });
  }

  /**
   * Construit et injecte la grille d'images dans la modale.
   * Utilisation d'un DocumentFragment pour limiter les reflows du DOM.
   * * @param {Array} liste - Collection des travaux à afficher
   */
  function genererGalerieModale(liste) {
    if (!modalGallery) return;

    modalGallery.innerHTML = "";
    const fragment = document.createDocumentFragment();

    liste.forEach((projet) => {
      const figure = document.createElement("figure");
      figure.dataset.id = projet.id;
      figure.style.position = "relative";

      const image = document.createElement("img");
      image.src = projet.imageUrl;
      image.alt = projet.title;
      image.style.width = "78px";

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.dataset.id = projet.id;
      deleteBtn.dataset.title = projet.title;
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

      figure.append(image, deleteBtn);
      fragment.appendChild(figure);
    });

    modalGallery.appendChild(fragment);
  }

  /**
   * Écouteur global pour la suppression de projets.
   * Modèle de délégation d'événements attaché au conteneur parent.
   */

  if (modalGallery) {
    modalGallery.addEventListener("click", async (event) => {
      const deleteBtn = event.target.closest(".delete-btn");
      if (!deleteBtn) return;

      event.preventDefault();
      const id = deleteBtn.dataset.id;

      const confirmation = await customConfirm(
        `Voulez-vous supprimer le projet "${deleteBtn.dataset.title}" ?`,
      );
      if (!confirmation) return;

      const currentToken = localStorage.getItem("token");

      try {
        const response = await fetch(`http://localhost:5678/api/works/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${currentToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          showNotification("Projet supprimé avec succès");

          // Nettoyage des noeuds DOM (Modale & Vue Publique)
          const modalFigure = modalGallery.querySelector(
            `figure[data-id="${id}"]`,
          );
          if (modalFigure) modalFigure.remove();

          const mainFigure = document.querySelector(
            `.gallery figure[data-id="${id}"]`,
          );
          if (mainFigure) mainFigure.remove();

          // Synchronisation de l'état local
          works = works.filter((work) => String(work.id) !== String(id));
        } else {
          customAlert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur réseau :", error);
        customAlert("Impossible de joindre le serveur.");
      }
    });
  }

  /**
   * Gestionnaire unifié de fermeture de la modale.
   */
  const closeModalHandler = () => {
    if (modal) modal.classList.remove("modal-show");
    if (typeof resetModalState === "function") resetModalState();
  };

  // Enregistrement des événements de fermeture (Bouton et Backdrop)
  const closeButtons = document.querySelectorAll(".js-close-modal");
  closeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      closeModalHandler();
    });
  });

  const modalOverlay = document.getElementById("modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) closeModalHandler();
    });
  }
}

// GESTION DE LA NAVIGATION DE LA MODALE
// Gère le basculement entre la vue "Galerie" et la vue "Ajout photo"
// Sélection des éléments du DOM

const btnAddPhoto = document.querySelector(".btn-add-photo");
const arrowReturn = document.querySelector(".modal-icon-back");
const galleryView = document.getElementById("modal-gallery-view");
const addPhotoView = document.getElementById("modal-add-view");
const modalOverlay = document.getElementById("modal");

// Affiche la vue d'ajout de photo et masque la galerie.

function openAddPhotoView() {
  galleryView.classList.add("modal-view-hidden");
  addPhotoView.classList.remove("modal-view-hidden");
}

// Affiche la vue galerie et masque le formulaire d'ajout

function openGalleryView() {
  addPhotoView.classList.add("modal-view-hidden");
  galleryView.classList.remove("modal-view-hidden");
  resetAddPhotoForm();
}

// Réinitialise l'état de la modale vers la vue par défaut (Galerie).
// Utilisé lors de la fermeture de la modale pour garantir un état propre à la réouverture.

function resetModalState() {
  openGalleryView();
  resetAddPhotoForm();
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
  if (!selectElement) return;

  try {
    const response = await fetch("http://localhost:5678/api/categories");

    // Approche "Fail-fast" : on rejette l'erreur immédiatement si le statut n'est pas bon
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const categories = await response.json();

    // Réinitialisation à l'état par défaut (placeholder invisible)
    selectElement.innerHTML = '<option value="" disabled selected></option>';

    // Création d'un conteneur virtuel pour des performances optimales
    const fragment = document.createDocumentFragment();

    categories.forEach((category) => {
      // Le constructeur Option(text, value) est plus concis que createElement
      fragment.appendChild(new Option(category.name, category.id));
    });

    selectElement.appendChild(fragment);
  } catch (error) {
    console.error("Échec de l'initialisation des catégories :", error);
  }
}

fillCategorySelect();

// GESTION DE LA PRÉVISUALISATION DE LA PHOTO

function initPhotoPreview() {
  const fileInput = document.getElementById("file");
  const previewImg = document.getElementById("preview-img");
  const replaceMessage = document.querySelector(".photo-replace-message");

  if (!fileInput || !previewImg || !replaceMessage) return;

  fileInput.value = "";
  previewImg.src = "#";
  previewImg.classList.remove("preview-visible");
  replaceMessage.textContent = "";

  const MAX_SIZE = 4 * 1024 * 1024;

  fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      alert("Fichier trop volumineux (max 4Mo)");
      fileInput.value = "";
      replaceMessage.textContent = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result;
      previewImg.classList.add("preview-visible");

      replaceMessage.textContent = "Cliquez sur l’image pour la remplacer.";
    };

    reader.readAsDataURL(file);
  });

  previewImg.addEventListener("click", () => {
    resetImageInput();
    fileInput.click();
  });
}

initPhotoPreview();

// Réinitialisation de l'aperçu de l'image et du message de remplacement
function resetImageInput() {
  const fileInput = document.getElementById("file");
  const previewImg = document.getElementById("preview-img");
  const replaceMessage = document.querySelector(".photo-replace-message");

  if (fileInput) fileInput.value = "";

  // Réinitialisation de la balise img
  if (previewImg) {
    previewImg.src = "#";
    previewImg.classList.remove("preview-visible");
  }

  if (replaceMessage) {
    replaceMessage.textContent = "";
  }
}

// Réinitialisation complète du formulaire d'ajout
// Inclut le vidage des inputs, de l'image et des messages d'erreur
function resetAddPhotoForm() {
  const form = document.getElementById("add-photo-form");
  const removeBtn = document.getElementById("remove-photo-btn");
  const errorImage = document.getElementById("error-image");
  const errorTitle = document.getElementById("error-title");
  const errorCategory = document.getElementById("error-category");

  if (form) form.reset();

  // Appel de la fonction dédiée pour la zone image
  resetImageInput();

  if (removeBtn) {
    removeBtn.style.display = "none";
  }

  // Nettoyage des messages de validation
  if (errorImage) errorImage.textContent = "";
  if (errorTitle) errorTitle.textContent = "";
  if (errorCategory) errorCategory.textContent = "";
}

/**
 * Vérifie la validité des champs du formulaire d'ajout.
 * Gère l'état du bouton de soumission (disabled/enabled) et le feedback visuel (messages d'erreur).
 */
function checkFormValidity() {
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const fileInput = document.getElementById("file");
  const submitBtn = document.querySelector(".btn-submit");

  // 1. On cible nos trois nouveaux paragraphes
  const errorImage = document.getElementById("error-image");
  const errorTitle = document.getElementById("error-title");
  const errorCategory = document.getElementById("error-category");

  if (!titleInput || !categorySelect || !fileInput || !submitBtn) return;

  const updateUI = () => {
    // 2. On vérifie l'état de chaque champ
    const isTitleValid = titleInput.value.trim() !== "";
    const isCategoryValid = categorySelect.value !== "";
    const isFileValid = fileInput.files.length > 0;
    const isFormValid = isTitleValid && isCategoryValid && isFileValid;

    // 3. Gestion du bouton Valider (ton code d'origine)
    submitBtn.disabled = !isFormValid;
    isFormValid
      ? submitBtn.classList.add("btn-submit-active")
      : submitBtn.classList.remove("btn-submit-active");

    // 4. Gestion des messages individuels
    // On utilise une ternaire : si c'est valide, on met du vide "", sinon on affiche l'erreur
    if (errorImage)
      errorImage.textContent = isFileValid ? "" : "Veuillez ajouter une photo.";
    if (errorTitle)
      errorTitle.textContent = isTitleValid
        ? ""
        : "Veuillez renseigner un titre.";
    if (errorCategory)
      errorCategory.textContent = isCategoryValid
        ? ""
        : "Veuillez choisir une catégorie.";
  };

  // 5. On écoute les changements
  titleInput.addEventListener("input", updateUI);
  categorySelect.addEventListener("change", updateUI);
  fileInput.addEventListener("change", updateUI);
}

// Initialisation au chargement
checkFormValidity();

/**
 * Gère la soumission du formulaire d'ajout de projet.
 * Envoie les données à l'API, met à jour l'interface (galerie principale et modale)
 * et réinitialise le formulaire de manière fluide.
 */

async function processUpload() {
  const form = document.getElementById("add-photo-form");
  const submitBtn = document.querySelector(".btn-submit");

  if (!form || !submitBtn) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const currentToken = localStorage.getItem("token");

    if (!currentToken) {
      customAlert("Authentification requise");
      return;
    }

    try {
      const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
        body: formData,
      });

      if (response.ok) {
        showNotification("Projet ajouté avec succès");
        const newWork = await response.json();

        // 1. Mise à jour de l'état local
        if (typeof works !== "undefined") {
          works.push(newWork);
        }

        // 2. Injection dans la galerie principale de la page d'accueil
        const mainGallery = document.querySelector(".gallery");
        if (mainGallery) {
          const figure = document.createElement("figure");
          figure.dataset.id = newWork.id;

          const img = document.createElement("img");
          img.src = newWork.imageUrl;
          img.alt = newWork.title;

          const caption = document.createElement("figcaption");
          caption.innerText = newWork.title;

          figure.append(img, caption);
          mainGallery.appendChild(figure);
        }

        // 3. Régénération de la grille de la modale avec les écouteurs globaux
        if (typeof genererGalerieModale === "function" && typeof works !== "undefined") {
          genererGalerieModale(works);
        }

        // 4. Réinitialisation de la vue (sans fermer la modale)
        if (typeof resetAddPhotoForm === "function") {
          resetAddPhotoForm();
        }
        
        if (typeof resetModalState === "function") {
          resetModalState(); // Ramène l'utilisateur sur la vue "Galerie"
        }

      } else {
        showNotification("Erreur lors de l'envoi du formulaire", true);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
      customAlert("Impossible de joindre le serveur.");
    }
  });
}

// Initialisation de l'écouteur
processUpload();

