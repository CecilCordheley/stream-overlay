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
async function loadView(url,container,succes,failed){
    fetch("../view/"+url)
    .then(r=>{return r.text()})
    .then(result=>{
        container.innerHTML=result;
        executeScript(container);
        succes?.call(this);
    })
    .catch(err=>{
        console.error(err);
        failed?.call(err);
    })
}