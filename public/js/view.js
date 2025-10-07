function executeScript(container) {
    container.querySelectorAll("script").forEach(oldScript => {
        //  console.log("set New Script " + oldScript.textContent);
        const newScript = document.createElement("script");
        if (oldScript.src) {
            newScript.src = oldScript.src;
        } else {
            newScript.textContent = oldScript.textContent;
        }
        document.head.appendChild(newScript).remove(); // Évite les doublons
    });
}
function loadView(url, container) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch("../view/" + url);
            const result = await response.text();
            container.innerHTML = result;
            executeScript(container);

            // 🔥 Dispatch d'un event personnalisé
            const evt = new CustomEvent("viewLoaded", { detail: { url, container } });
            container.dispatchEvent(evt);

            resolve(container);
        } catch (err) {
            console.error(err);
            reject(err);
        }
    });
}

