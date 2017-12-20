const requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window["mozRequestAnimationFrame"] ||
  window["oRequestAnimationFrame"] ||
  window["msRequestAnimationFrame"] ||
  (cb => window.setTimeout(cb, 1000 / 60));

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

class CanvasDrawer {
  private context: CanvasRenderingContext2D;
  constructor(private canvas: HTMLCanvasElement) {
    if (!this.canvas) return;
    this.context = this.canvas.getContext("2d");
    window.addEventListener("resize", () => this.resize());
    this.resize();
  }
  private resize() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.scrollWidth;
    this.canvas.height = container.scrollHeight;
  }

  drawRotatedShape(
    shape: string,
    x: number,
    y: number,
    width: number,
    height: number,
    degrees: number,
    color: string,
    direction?: string
  ) {
    // first save the untranslated/unrotated context
    this.context.save();

    this.context.beginPath();

    // move the rotation point to the center of the rect
    this.context.translate(x + width / 2, y + height / 2);
    // rotate the rect
    if (direction === "clockwise") {
      this.context.rotate(degrees * Math.PI / 180);
    } else {
      this.context.rotate(-(degrees * Math.PI / 180));
    }

    this.context.fillStyle = color;
    this.context.lineWidth = 5;

    // draw the rect on the transformed context
    // Note: after transforming [0,0] is visually [x,y]
    // so the rect needs to be offset accordingly when drawn
    switch (shape) {
      case "rect":
        this.context.rect(-width / 2, -height / 2, width, height);
        this.context.fill();
        break;
      case "circle":
        this.context.arc(
          -width / 2,
          -height / 2,
          width * 0.5,
          0,
          Math.PI * 2,
          true
        );
        this.context.fill();
        break;
      case "triangle":
        this.context.moveTo(0, 0);
        this.context.lineTo(width, 0);
        this.context.lineTo(width, height);
        this.context.fill();
        break;
      case "minus":
        this.context.moveTo(0, 0);
        this.context.lineTo(30, 0);
        this.context.stroke();
        break;
      case "plus":
        this.context.moveTo(0, 15);
        this.context.lineTo(30, 15);
        this.context.moveTo(15, 0);
        this.context.lineTo(15, 30);
        this.context.stroke();
        break;
      case "equals":
        this.context.moveTo(0, 5);
        this.context.lineTo(30, 5);
        this.context.moveTo(0, 15);
        this.context.lineTo(30, 15);
        this.context.stroke();
        break;
    }
    // restore the context to its untranslated/unrotated state
    this.context.restore();
  }
  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

class Particle {
  private vx: number;
  private vy: number;
  private size: number;
  private rotation: number;
  private id: number;
  private rotationDirection: string;
  private shape: string;
  private life = 0;
  static instance = {};
  static index = 0;
  constructor(
    private x: number,
    private y: number,
    private settings,
    private drawer: CanvasDrawer
  ) {
    this.vx = Math.floor(random(0, 10));
    this.vy = Math.floor(random(0, 10));
    this.size = Math.floor(
      random(this.settings.minSize, this.settings.maxSize)
    );
    this.rotation = Math.floor(random(0, 180));

    this.rotationDirection =
      random(0, 100) > 50 ? "clockwise" : "counter-clockwise";

    this.shape = this.settings.shapes[random(0, this.settings.shapes.length)];

    Particle.instance[Particle.index] = this;
    this.id = Particle.index++;
  }
  private checkLife() {
    const maxLife = 10000;
    this.life++;
    if (this.life >= maxLife) {
      delete Particle.instance[this.id];
    }
  }

  draw() {
    // this.x +=  1;
    this.y += this.settings.gravity * Math.floor(random(1, 2));

    // Adjust for gravity
    this.vy += this.settings.gravity * Math.floor(random(0.5, 8));

    if (this.rotationDirection == "clockwise") {
      this.rotation += this.settings.rotationVelocity;
    } else {
      this.rotation -= this.settings.rotationVelocity;
    }

    // Create the shapes
    this.drawer.clear();
    this.drawer.drawRotatedShape(
      this.shape,
      this.x,
      this.y,
      this.size,
      this.size,
      this.rotation,
      this.settings.color,
      this.rotationDirection
    );

    this.checkLife();
  }
}

const settings = {
  density: 60,
  velocity: 1,
  gravity: 1,
  color: "rgba(0,0,0,0.3)",
  maxSize: 100,
  minSize: 15,
  rotation: true,
  rotationVelocity: 0.1,
  shapes: ["rect", "circle", "triangle", "plus", "minus", "equals"]
};
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

const drawer = new CanvasDrawer(canvas);

for (var i = 0; i < settings.density; i++) {
  new Particle(
    Math.floor(random(0, canvas.width)),
    Math.floor(random(0, canvas.height)),
    settings,
    drawer
  );
}

for (var p in Particle.instance) {
  Particle.instance[p].draw();
}

function animate() {
  // Draw the particles
  for (var i = 0; i < settings.density; i++) {
    if (Math.random() > 0.999) {
      new Particle(
        Math.floor(random(0, canvas.width)),
        canvas.height + 70,
        settings,
        drawer
      );
    }
  }
  for (var p in Particle.instance) {
    Particle.instance[p].draw();
  }
  requestAnimFrame(animate);
}
animate();
