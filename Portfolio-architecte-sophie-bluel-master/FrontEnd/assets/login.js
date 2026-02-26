// Récupération du formulaire
const form = document.getElementById("login-form");

// 2. On écoute quand on clique sur "Se connecter"
form.addEventListener("submit", async function (event) {
  // On empêche la page de se recharger
  event.preventDefault();

  // 3. On récupère ce que l'utilisateur a écrit
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const submitBtn = document.getElementById("login-btn");

  if (!email || !password) {
    customAlert("Veuillez remplir tous les champs");
    return;
  }

  // 4. On prépare le paquet à envoyer à l'API

  const user = { email, password };

  try {
    submitBtn.disabled = true;
    // 5. On envoie la demande au serveur (POST)
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error("Email ou mot de passe incorrect");
    }
    const data = await response.json();
    localStorage.setItem("token", data.token);
    window.location.replace("index.html");
  } catch (error) {
    customAlert(error.message);
    submitBtn.disabled = false;
  }
});
