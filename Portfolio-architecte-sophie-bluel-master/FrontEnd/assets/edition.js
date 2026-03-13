// =========================================================================
// 1. IMPORTS ET VARIABLES GLOBALES DU FICHIER
// =========================================================================
import {
  customAlert,
  customConfirm,
  showNotification,
  isAuthenticated,
  getToken,
} from './utils.js';
import { works } from './script.js';

// Sélecteurs DOM réutilisés dans plusieurs fonctions
const modal = document.getElementById('modal');
const modalGallery = document.querySelector('.modal-gallery');
const btnAddPhoto = document.querySelector('.btn-add-photo');
const arrowReturn = document.querySelector('.modal-icon-back');
const galleryView = document.getElementById('modal-gallery-view');
const addPhotoView = document.getElementById('modal-add-view');

// =========================================================================
// 2. FONCTIONS DE GESTION DE LA MODALE ET DE L'INTERFACE
// =========================================================================

export function genererGalerieModale(liste) {
  if (!modalGallery) return;

  modalGallery.innerHTML = '';
  const fragment = document.createDocumentFragment();

  liste.forEach((projet) => {
    const figure = document.createElement('figure');
    figure.dataset.id = projet.id;

    const image = document.createElement('img');
    image.src = projet.imageUrl;
    image.alt = projet.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.dataset.id = projet.id;
    deleteBtn.dataset.title = projet.title;
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    figure.append(image, deleteBtn);
    fragment.appendChild(figure);
  });

  modalGallery.appendChild(fragment);
}

function openAddPhotoView() {
  galleryView.classList.add('modal-view-hidden');
  addPhotoView.classList.remove('modal-view-hidden');
}

function openGalleryView() {
  addPhotoView.classList.add('modal-view-hidden');
  galleryView.classList.remove('modal-view-hidden');
}

function resetModalState() {
  openGalleryView();
  resetAddPhotoForm();
}

function closeModalHandler() {
  if (modal) modal.classList.remove('modal-show');
  resetModalState();
}

// =========================================================================
// 3. FONCTIONS DU FORMULAIRE ET DE PRÉVISUALISATION
// =========================================================================

async function fillCategorySelect() {
  const selectElement = document.getElementById('category');
  if (!selectElement) return;

  try {
    const response = await fetch('http://localhost:5678/api/categories');

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const categories = await response.json();

    selectElement.innerHTML =
      '<option value="" disabled selected>Choisissez une catégorie</option>';

    const fragment = document.createDocumentFragment();
    categories.forEach((category) => {
      fragment.appendChild(new Option(category.name, category.id));
    });

    selectElement.appendChild(fragment);
  } catch (error) {
    //eslint-disable-next-line no-console
    console.error("Échec de l'initialisation des catégories :", error);
  }
}

function initPhotoPreview() {
  const fileInput = document.getElementById('file');
  const previewImg = document.getElementById('preview-img');
  const replaceMessage = document.querySelector('.photo-replace-message');

  if (!fileInput || !previewImg || !replaceMessage) return;

  fileInput.value = '';
  previewImg.src = '#';
  previewImg.classList.remove('preview-visible');
  replaceMessage.textContent = '';

  const MAX_SIZE = 4 * 1024 * 1024;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      customAlert('Fichier trop volumineux (max 4Mo)');
      fileInput.value = '';
      replaceMessage.textContent = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      previewImg.src = reader.result;
      previewImg.classList.add('preview-visible');
      replaceMessage.textContent = 'Cliquez sur l’image pour la remplacer.';
    };

    reader.readAsDataURL(file);
  });

  previewImg.addEventListener('click', () => {
    resetImageInput();
    fileInput.click();
  });
}

function resetImageInput() {
  const fileInput = document.getElementById('file');
  const previewImg = document.getElementById('preview-img');
  const replaceMessage = document.querySelector('.photo-replace-message');

  if (fileInput) {
    fileInput.value = '';
    fileInput.dispatchEvent(new Event('change'));
  }

  if (previewImg) {
    previewImg.src = '#';
    previewImg.classList.remove('preview-visible');
  }

  if (replaceMessage) {
    replaceMessage.textContent = '';
  }
}

function resetAddPhotoForm() {
  const form = document.getElementById('add-photo-form');
  const errorImage = document.getElementById('error-image');
  const errorTitle = document.getElementById('error-title');
  const errorCategory = document.getElementById('error-category');

  if (form) form.reset();

  resetImageInput();

  if (errorImage) errorImage.textContent = '';
  if (errorTitle) errorTitle.textContent = '';
  if (errorCategory) errorCategory.textContent = '';
}

function checkFormValidity() {
  const titleInput = document.getElementById('title');
  const categorySelect = document.getElementById('category');
  const fileInput = document.getElementById('file');
  const submitBtn = document.querySelector('.btn-submit');

  const errorImage = document.getElementById('error-image');
  const errorTitle = document.getElementById('error-title');
  const errorCategory = document.getElementById('error-category');

  if (!titleInput || !categorySelect || !fileInput || !submitBtn) return;

  const updateUI = () => {
    const isTitleValid = titleInput.value.trim() !== '';
    const isCategoryValid = categorySelect.value !== '';
    const isFileValid = fileInput.files.length > 0;
    const isFormValid = isTitleValid && isCategoryValid && isFileValid;

    submitBtn.disabled = !isFormValid;
    isFormValid
      ? submitBtn.classList.add('btn-submit-active')
      : submitBtn.classList.remove('btn-submit-active');

    if (errorImage)
      errorImage.textContent = isFileValid ? '' : 'Veuillez ajouter une photo.';
    if (errorTitle)
      errorTitle.textContent = isTitleValid
        ? ''
        : 'Veuillez renseigner un titre.';
    if (errorCategory)
      errorCategory.textContent = isCategoryValid
        ? ''
        : 'Veuillez choisir une catégorie.';
  };

  titleInput.addEventListener('input', updateUI);
  categorySelect.addEventListener('change', updateUI);
  fileInput.addEventListener('change', updateUI);
}

// =========================================================================
// 4. LOGIQUE API (ENVOI DES DONNÉES)
// =========================================================================

async function processUpload() {
  const form = document.getElementById('add-photo-form');
  const submitBtn = document.querySelector('.btn-submit');

  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);

    if (!isAuthenticated()) {
      customAlert('Authentification requise');
      return;
    }

    try {
      const response = await fetch('http://localhost:5678/api/works', {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });

      if (response.ok) {
        showNotification('Projet ajouté avec succès');
        const newWork = await response.json();
        works.push(newWork);

        const mainGallery = document.querySelector('.gallery');
        if (mainGallery) {
          const figure = document.createElement('figure');
          figure.dataset.id = newWork.id;

          const img = document.createElement('img');
          img.src = newWork.imageUrl;
          img.alt = newWork.title;

          const caption = document.createElement('figcaption');
          caption.innerText = newWork.title;

          figure.append(img, caption);
          mainGallery.appendChild(figure);
        }

        genererGalerieModale(works);
        resetAddPhotoForm();
      } else {
        showNotification("Erreur lors de l'envoi du formulaire", true);
      }
    } catch (error) {
      //eslint-disable-next-line no-console
      console.error('Erreur réseau :', error);
      customAlert('Impossible de joindre le serveur.');
    }
  });
}

// =========================================================================
// 5. INITIALISATION DU SCRIPT (DÉMARRAGE ET ÉVÉNEMENTS GLOBAUX)
// =========================================================================

function init() {
  // Lancement des fonctions de base du formulaire
  fillCategorySelect();
  initPhotoPreview();
  checkFormValidity();
  processUpload();

  // Écouteurs de navigation fixes de la modale
  if (btnAddPhoto) btnAddPhoto.addEventListener('click', openAddPhotoView);
  if (arrowReturn) arrowReturn.addEventListener('click', openGalleryView);

  // Gestion de la fermeture au clic sur l'arrière-plan
  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModalHandler();
    });
  }

  // Écouteurs des boutons croix pour fermer
  const closeButtons = document.querySelectorAll('.js-close-modal');
  closeButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      closeModalHandler();
    });
  });

  // Logique d'affichage si l'utilisateur est connecté (mode édition)
  if (getToken()) {
    const topBar = document.createElement('div');
    topBar.classList.add('edition-mode-banner');
    topBar.innerHTML =
      '<i class="fa-regular fa-pen-to-square"></i> Mode édition';
    document.body.prepend(topBar);

    const header = document.querySelector('header');
    if (header) header.classList.add('header-decale');

    const loginLink = document.querySelector("nav ul li a[href='login.html']");
    if (loginLink) {
      loginLink.innerText = 'logout';
      loginLink.href = '#';
      loginLink.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.reload();
      });
    }

    const filters = document.querySelector('.filters');
    if (filters) filters.classList.add('hidden');

    const titleProjects = document.querySelector('#portfolio h2');
    if (titleProjects) {
      const editLink = document.createElement('a');
      editLink.href = '#';
      editLink.classList.add('edit-btn');
      editLink.innerHTML =
        '<i class="fa-regular fa-pen-to-square"></i> modifier';
      titleProjects.appendChild(editLink);

      editLink.addEventListener('click', (event) => {
        event.preventDefault();
        modal.classList.add('modal-show');
        genererGalerieModale(works);
      });
    }

    // Gestion de la suppression depuis la modale
    if (modalGallery) {
      modalGallery.addEventListener('click', async (event) => {
        const deleteBtn = event.target.closest('.delete-btn');
        if (!deleteBtn) return;

        event.preventDefault();
        const id = deleteBtn.dataset.id;

        const confirmation = await customConfirm(
          `Voulez-vous supprimer le projet "${deleteBtn.dataset.title}" ?`
        );
        if (!confirmation) return;

        try {
          const response = await fetch(
            `http://localhost:5678/api/works/${id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${getToken()}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            showNotification('Projet supprimé avec succès');

            const modalFigure = modalGallery.querySelector(
              `figure[data-id="${id}"]`
            );
            if (modalFigure) modalFigure.remove();

            const mainFigure = document.querySelector(
              `.gallery figure[data-id="${id}"]`
            );
            if (mainFigure) mainFigure.remove();

            const indexToRemove = works.findIndex(
              (work) => String(work.id) === String(id)
            );
            if (indexToRemove !== -1) {
              works.splice(indexToRemove, 1);
            }
          } else {
            customAlert('Erreur lors de la suppression');
          }
        } catch (error) {
          //eslint-disable-next-line no-console
          console.error('Erreur réseau :', error);
          customAlert('Impossible de joindre le serveur.');
        }
      });
    }
  }
}

// Démarrage du script
init();
