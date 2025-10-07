class Webcam {
    constructor(videoContainer, param) {
        this.container = videoContainer;

        // Création de la vidéo
        this.video = document.createElement("video");
        this.video.autoplay = true;
        this.video.playsInline = true;
        this.video.muted = true;

        // Création du canvas
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        // Ajout au container
        this.container.appendChild(this.video);
        this.container.appendChild(this.canvas);

        // Paramètres par défaut
        this.param = {
            canvas: { width: 200, height: 200 },
            crop: null // { x, y, width, height }
        };

        if (param) {
            // Fusionner les paramètres
            this.param = {
                ...this.param,
                ...param,
                canvas: { ...this.param.canvas, ...(param.canvas ?? {}) }
            };
        }
    }

    display = async function (cvs = true) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        this.video.srcObject = stream;

        this.video.addEventListener("playing", () => {
            // Adapter la taille du canvas aux paramètres
            this.canvas.width = this.param.canvas.width;
            this.canvas.height = this.param.canvas.height;

            if (cvs) {
                this.video.style.visibility = "hidden";
                this.updateCanvas();
            }
        });
    }

    updateCanvas = () => {
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        // Si l’utilisateur a donné une zone de crop précise
        let sx, sy, sWidth, sHeight;

        if (this.param.crop) {
            ({ x: sx, y: sy, width: sWidth, height: sHeight } = this.param.crop);
        } else {
            // Sinon on fait un crop centré
            sWidth = Math.min(this.video.videoWidth, cw);
            sHeight = Math.min(this.video.videoHeight, ch);
            sx = (this.video.videoWidth - sWidth) / 2;
            sy = (this.video.videoHeight - sHeight) / 2;
        }

        this.ctx.clearRect(0, 0, cw, ch);

        // Copier une portion de la vidéo vers le canvas
        this.ctx.drawImage(this.video, sx, sy, sWidth, sHeight, 0, 0, cw, ch);

        requestAnimationFrame(this.updateCanvas);
    }
}
