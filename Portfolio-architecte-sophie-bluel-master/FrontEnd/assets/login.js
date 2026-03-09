import { customAlert } from './utils.js';

// Récupération des éléments du DOM
const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('login-btn');

// Fonction principale
async function handleLogin(event) {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    customAlert('Veuillez remplir tous les champs');
    return;
  }

  const user = { email, password };

  try {
    submitBtn.disabled = true;

    const response = await fetch('http://localhost:5678/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error('Email ou mot de passe incorrect');
    }

    const data = await response.json();

    localStorage.setItem('token', data.token);
    window.location.replace('index.html');
  } catch (error) {
    customAlert(error.message);
    submitBtn.disabled = false;
  }
}

// Écoute du formulaire
form.addEventListener('submit', handleLogin);
