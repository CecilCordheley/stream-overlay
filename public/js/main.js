const streamOverlay = {};
streamOverlay.url = "localhost:3000/scenes";
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
  this.segmentData = [];
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
async function setRegularWebCam(video) {
  var capture;

  function setup() {
    createCanvas(400, 300);
    capture = createCapture(VIDEO);
    capture.size(400, 300);
    //stepSize_slider = createSlider(8, 48,12,1);
  }

  function draw() {
    background(220, 220, 220, 255);
    capture.loadPixels();

    // you can change the stepSize
    //var stepSize = stepSize_slider.value();
    var stepSize = floor(map(mouseX, 0, width, 5, 20));
    for (var x = 0; x < capture.width; x += stepSize) {
      for (var y = 0; y < capture.height; y += stepSize) {
        var index = ((y * capture.width) + x) * 4;
        // The code for your filter will go here!
        var redVal = capture.pixels[index];
        var greenVal = capture.pixels[index + 1];
        var blueVal = capture.pixels[index + 2];
        // you can add or remove the stroke
        //strokeWeight(1);
        //stroke(255,0,255,255);
        noStroke();
        // you can change the colors
        fill(2 * redVal, greenVal, blueVal / 2);
        // you can change the shape of the 'pixels'
        rectMode(CENTER);
        rect(x, y, stepSize, stepSize);
        //circle(x, y, stepSize, stepSize);

      }
    }
  }
  setup();
}
function setWebCam() {
  var video = document.getElementById('video');
  var canvas = document.getElementById('canvas');
  var context = canvas.getContext('2d');

  var tracker = new tracking.ObjectTracker('face');
  tracker.setInitialScale(4);
  tracker.setStepSize(2);
  tracker.setEdgesDensity(0.1);

  tracking.track('#video', tracker, { camera: true });

  tracker.on('track', function (event) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    event.data.forEach(function (rect) {
      context.strokeStyle = '#a64ceb';
      context.strokeRect(rect.x, rect.y, rect.width, rect.height);
      context.font = '11px Helvetica';
      context.fillStyle = "#fff";
      context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
      context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
    });
  });

  var gui = new dat.GUI();
  gui.add(tracker, 'edgesDensity', 0.1, 0.5).step(0.01);
  gui.add(tracker, 'initialScale', 1.0, 10.0).step(0.1);
  gui.add(tracker, 'stepSize', 1, 5).step(0.1);
}
function emulateraid() {
  let r = {
    username: "coco l'asticot",
    viewers: 10
  }
  let infoContainer = document.createElement('div');
  infoContainer.innerHTML = `dernier raid <span>${r.username}</span> avec ${r.viewers}`;
  document.querySelector(".sessionRaid").appendChild(infoContainer);
}
function hideEl(selector) {
  document.querySelector(selector).style.display = "none";
}
function isLive() {
  let nav = window.navigator.userAgent;
  const regex = /(OBS)/mg;
  return regex.exec(nav) !== null
}