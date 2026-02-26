function customAlert(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";

    const box = document.createElement("div");
    box.className = "custom-dialog-box";

    const text = document.createElement("p");
    text.textContent = message;

    const btnOk = document.createElement("button");
    btnOk.textContent = "OK";
    btnOk.className = "custom-dialog-btn";

    btnOk.addEventListener("click", () => {
      document.body.removeChild(overlay);
      resolve();
    });

    box.append(text, btnOk);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}

function customConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "custom-dialog-overlay";

    const box = document.createElement("div");
    box.className = "custom-dialog-box";

    const text = document.createElement("p");
    text.textContent = message;

    const btnContainer = document.createElement("div");
    btnContainer.className = "custom-dialog-actions";

    const btnYes = document.createElement("button");
    btnYes.textContent = "Oui";
    btnYes.className = "custom-dialog-btn confirm-yes";

    const btnNo = document.createElement("button");
    btnNo.textContent = "Non";
    btnNo.className = "custom-dialog-btn confirm-no";

    const closeDialog = (result) => {
      document.body.removeChild(overlay);
      resolve(result);
    };

    btnYes.addEventListener("click", () => closeDialog(true));
    btnNo.addEventListener("click", () => closeDialog(false));

    btnContainer.append(btnYes, btnNo);
    box.append(text, btnContainer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  });
}

function showNotification(message, isError = false) {
  const notif = document.getElementById("notification");
  if (!notif) return;

  // Injection du texte défini en paramètre
  notif.textContent = message;

  // Réinitialisation des classes existantes
  notif.className = "notification";

  // Application de la couleur et affichage de l'élément
  notif.classList.add(isError ? "error" : "success");
  notif.classList.add("show");

  // Masquage automatique après un délai de 3000 millisecondes
  setTimeout(() => {
    notif.classList.remove("show");
  }, 3000);
}