// Récupération du formulaire
const form = document.querySelector("form");

// 2. On écoute quand on clique sur "Se connecter"
form.addEventListener("submit", async function(event) {
    // On empêche la page de se recharger (sinon on perd tout)
    event.preventDefault();

    // 3. On récupère ce que l'utilisateur a écrit
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // 4. On prépare le paquet à envoyer à l'API
    const user = {
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        // 5. On envoie la demande au serveur (POST)
        const response = await fetch("http://localhost:5678/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        // 6. Si le serveur dit "OK"
        if (response.ok) {
            const data = await response.json();
            // On sauvegarde la preuve de connexion (token)
            localStorage.setItem("token", data.token);
            // On redirige vers la page d'accueil
            window.location.href = "index.html";
        } else {
            // Sinon, on affiche une erreur
            alert("Erreur : email ou mot de passe incorrect.");
        }

    } catch (error) {
        console.error("Erreur technique :", error);
    }
});