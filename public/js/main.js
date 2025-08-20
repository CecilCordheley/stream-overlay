const streamOverlay = {};
streamOverlay.url="localhost:3000/scenes";
// Fonction createOrDestroy qui agit dans le namespace
function createOrDestroy(namespace, varName, value) {
    if (!(varName in namespace)) {
        // Créer
        namespace[varName] = value;
        console.log(`Variable "${varName}" créée dans le namespace`);
    } else {
        // Détruire
        delete namespace[varName];
        console.log(`Variable "${varName}" supprimée du namespace`);
        namespace[varName] = value;
    }
}
window.addEventListener("load", function () {
  this.gamQueue = [];
    this.segmentData=[];
  //  const consoleError = new ErrorConsole();
})
// Ton instance

/*
window.addEventListener('error', (event) => {
  // event contient les détails de l'erreur
  consoleError.addEntry({
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error ? event.error.stack : null
  });
});
/*
// Pour les erreurs de promesse non gérées
window.addEventListener('unhandledrejection', (event) => {
  consoleError.addEntry({
    message: event.reason ? event.reason.message || event.reason : 'Unhandled promise rejection',
    stack: event.reason && event.reason.stack ? event.reason.stack : null
  });
});
*/
function isLive() {
  let nav = window.navigator.userAgent;
  const regex = /(OBS)/mg;
  return regex.exec(nav) !== null
}