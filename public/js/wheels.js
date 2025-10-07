class Wheel {
    constructor(canvas, spinButton, valueDisplay, sectorsUrl) {
        this.canvas = canvas
        console.dir(this.canvas);
        this.spinButton = spinButton
        this.valueDisplay = valueDisplay
        this.ctx = this.canvas.getContext('2d');
        this.dia = this.ctx.canvas.width;
        this.rad = this.dia / 2;
        this.PI = Math.PI;
        this.TAU = 2 * this.PI;

        this.friction = 0.993; // 0.995=soft, 0.99=mid, 0.98=hard
        this.angVel = 0; // Angular velocity
        this.ang = 0; // Angle in radians

        this.spined = false;
        this.sectors = [];
        this.arc = 0;
        this.tot = 0;
        this.onSpin = null;
        this.player = "";
        this.sectorsUrl = sectorsUrl;
    }
    async fetchSectors() {
        let response = await fetch(this.sectorsUrl, {
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        return await response.json();
    }

    rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    getIndex() {
        return Math.floor(this.tot - (this.ang / this.TAU) * this.tot) % this.tot;
    }

    drawSector(sector, i) {
        const ang = this.arc * i;
        this.ctx.save();

        // Draw sector color
        this.ctx.beginPath();
        this.ctx.fillStyle = sector.color;
        this.ctx.moveTo(this.rad, this.rad);
        this.ctx.arc(this.rad, this.rad, this.rad, ang, ang + this.arc);
        this.ctx.lineTo(this.rad, this.rad);
        this.ctx.fill();

        // Draw sector label
        this.ctx.translate(this.rad, this.rad);
        this.ctx.rotate(ang + this.arc / 2);
        this.ctx.textAlign = 'right';
        this.ctx.fillStyle = sector.font || '#fff';
        this.ctx.font = sector.fontStyle || 'bold 16px Arial';
        this.ctx.fillText(sector.label, this.rad - 10, 10);

        this.ctx.restore();
    }

    rotate() {
        const sector = this.sectors[this.getIndex()];
        this.canvas.style.transform = `rotate(${this.ang - this.PI / 2}rad)`;
        this.spinButton.textContent = !this.angVel ? 'SPIN' : sector.label;
        this.spinButton.style.background = sector.color;
        this.spinButton.style.fontSize = (sector.label.length > 8) ? "15px" : "20px";

        if (!this.angVel && this.spined) {
            this.valueDisplay.textContent = sector.label;
            this.valueDisplay.style.color = sector.font || "#FFF";
            if (this.onSpin != null)
                this.onSpin.call(this,sector);
            if (this.player !== "") {
                bot.message(`/me ${this.player}, tu gagnes ${sector.label}`);
            }
        }
    }

    frame() {
        if (!this.angVel) return;
        this.angVel *= this.friction; // Decrement velocity by friction
        if (this.angVel < 0.002) this.angVel = 0; // Bring to stop
        this.ang += this.angVel; // Update angle
        this.ang %= this.TAU; // Normalize angle
        this.rotate();
    }

    engine() {
        this.frame();
        requestAnimationFrame(() => this.engine());
    }
    spin(fnc) {
        this.spined = true;
        if (!this.angVel) this.angVel = this.rand(0.25, 0.45);
        if (fnc != undefined) {
            fnc.call();
        }
    }
    init() {
        this.sectors.forEach((sector, i) => this.drawSector(sector, i));
        this.rotate(); // Initial rotation
        this.engine(); // Start engine
        this.spinButton.addEventListener('click', () => {
            this.spined = true;
            if (!this.angVel) this.angVel = this.rand(0.25, 0.45);

        });
    }

    async start() {
        const data = await this.fetchSectors();
        this.tot = data.length;
        this.arc = this.TAU / data.length;
        this.sectors = data;
        this.init();
    }
}