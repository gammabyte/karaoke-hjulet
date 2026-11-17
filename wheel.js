function adjustColor(hex, amount) {
    hex = hex.replace(/^#/, '');

    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('');
    }

    // Convert hex to decimal integers
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Add the amount to each channel (positive to lighten, negative to darken)
    // We use Math.max(0, ...) and Math.min(255, ...) to stay in bounds
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));

    // Convert back to hex and pad with zeros
    const getHex = (n) => n.toString(16).padStart(2, '0');

    return `#${getHex(r)}${getHex(g)}${getHex(b)}`;
}

class Wheel {
  constructor(container, canvas, entries) {
    this.container = container;
    this.canvas = canvas;
    this.entries = entries;
    this.rotation = 0;
    this.hitCounts = new Map();
    this.onHitStats = null;
    this.weightDecay = 0.2;
    this.bulbs = [];
    this.bulbAnimationFrame = null;
  }

  theme(primaryColor) {
    this.primaryColor = primaryColor;
    this.frame.set('stroke', primaryColor); // You can use CSS variables here too!
    this.middle.set('fill', primaryColor)

    this.middle.set('stroke', adjustColor(primaryColor, 100))

    this.center.set('stroke', adjustColor(primaryColor, -40));
    this.center.set('fill', adjustColor(primaryColor, -80));

    this.canvas.renderAll();

  }

  update(entries) {
    this.entries = [...entries];
    this.stopBulbAnimation();
    this.canvas.clear();
    this.notifyHitStats();
  }

  getHitStats(entries = this.entries) {
    const totalWeight = entries.reduce(
      (total, entry) => total + this.getEntryWeight(entry),
      0
    );

    return entries.map((entry, index) => {
      const hits = this.hitCounts.get(entry) || 0;
      const weight = this.getEntryWeight(entry);
      return {
        index,
        entry,
        hits,
        weight,
        chance: totalWeight === 0 ? 0 : (weight / totalWeight) * 100
      };
    });
  }

  getEntryWeight(entry) {
    const hits = this.hitCounts.get(entry) || 0;
    return Math.max(Number.MIN_VALUE, this.weightDecay ** hits);
  }

  setWeightDecay(value) {
    if (!Number.isFinite(value) || value <= 0 || value > 1) {
      throw new RangeError("Weight retention must be greater than 0 and at most 1.");
    }

    this.weightDecay = value;
    this.notifyHitStats();
  }

  notifyHitStats() {
    if (this.onHitStats) {
      this.onHitStats(this.getHitStats());
    }
  }

  resize(width, height) {
    this.canvas.setDimensions({ width, height });
    this.init();
    if (this.primaryColor) {
      this.theme(this.primaryColor);
    }
  }

  stopBulbAnimation() {
    if (this.bulbAnimationFrame !== null) {
      cancelAnimationFrame(this.bulbAnimationFrame);
      this.bulbAnimationFrame = null;
    }
  }

  animateBulbs() {
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.bulbs.length === 0 || prefersReducedMotion) {
      return;
    }

    const animate = (time) => {
      this.bulbs.forEach((bulb, index) => {
        const { group, lamp, color, glowRgb } = bulb;
        const pulse = Math.max(0, Math.sin(time / 300 + index * 0.45));
        const brightness = Math.round(-80 + pulse * 150);
        lamp.set("fill", adjustColor(color, brightness));

        const glow = pulse * pulse * 0.75;
        if (glow > 0.01) {
          group.set(
            "shadow",
            new fabric.Shadow({
              color: `rgba(${glowRgb}, ${glow})`,
              blur: 18 * pulse,
              offsetX: 0,
              offsetY: 0,
            })
          );
          bulb.glowing = true;
        } else if (bulb.glowing) {
          group.set("shadow", null);
          bulb.glowing = false;
        }
      });

      this.canvas.renderAll();
      this.bulbAnimationFrame = requestAnimationFrame(animate);
    };

    this.bulbAnimationFrame = requestAnimationFrame(animate);
  }

  init() {
    this.stopBulbAnimation();
    this.bulbs = [];
    this.canvas.clear();
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    const padding = 40;

    const radius =
      Math.min(this.canvas.width, this.canvas.height) / 2 - padding;

    const step = (Math.PI * 2) / this.entries.length;
    for (let i = 0; i < this.entries.length; ++i) {
      
      /*  const angle1 = i * step;
      const angle2 = (i + 1) * step;
      let p1 = { x: cx, y: cy };
      let p2 = {
        x: cx + Math.cos(angle1) * radius,
        y: cy + Math.sin(angle1) * radius,
      };
      let p3 = {
        x: cx + Math.cos(angle2) * radius,
        y: cy + Math.sin(angle2) * radius,
      };

      let color = colors[i % colors.length];

      var polygon = new fabric.Polygon([p1, p2, p3], {
        fill: color,
        stroke: "black",
        strokeWidth: 2,
      });
      */
     const angle1 = i * step;
const angle2 = (i + 1) * step;

// Points for the path
const p2 = {
  x: cx + Math.cos(angle1) * radius,
  y: cy + Math.sin(angle1) * radius,
};
const p3 = {
  x: cx + Math.cos(angle2) * radius,
  y: cy + Math.sin(angle2) * radius,
};

// SVG Path Data
// M: Move to center
// L: Line to start of arc
// A: Arc (rx, ry, xAxisRotation, largeArcFlag, sweepFlag, endX, endY)
const pathData = `
  M ${cx} ${cy}
  L ${p2.x} ${p2.y}
  A ${radius} ${radius} 0 0 1 ${p3.x} ${p3.y}
  Z
`;

const sector = new fabric.Path(pathData, {
  fill: colors[i % colors.length],
  stroke: "black",
  strokeWidth: 2,
  originX: 'center', // Helpful for centering the wheel
  originY: 'center'
});

      const textAngle = (angle1 + angle2) / 2;
      const textDist = radius - 30;
      const textValue = this.entries[i] + "";

      var text = new fabric.Text(textValue, {
        left: cx + Math.cos(textAngle) * textDist,
        top: cy + Math.sin(textAngle) * textDist,
        fontFamily: "Verdana",
        fontSize: 48,
        fontWeight: "bold",
        fill: "black",
        angle: this.radiansToDegrees(textAngle),
        originY: "center",
        originX: "right",
        stroke: "white",
        strokeWidth: 1,
      });

      //this.canvas.add(polygon, text);
      this.canvas.add(sector, text);

      //document.getElementById(this.container).style.transform = 'rotate(90deg)';
    }

    var circle = new fabric.Circle({
      left: cx,
      top: cy,
      radius: radius,
      originY: "center",
      originX: "center",
      fill: "transparent",
      stroke: "black",
      strokeWidth: 40,
    });

    var circle2 = new fabric.Circle({
      left: cx,
      top: cy,
      radius: radius,
      originY: "center",
      originX: "center",
      fill: "transparent",
      stroke: "gold",
      strokeWidth: 30,
    });

    this.frame = circle2; // mainly just for setting stroke when updating theme

    var circle3 = new fabric.Circle({
      left: cx,
      top: cy,
      radius: radius - 8,
      originY: "center",
      originX: "center",
      fill: "transparent",
      stroke: "white",
      strokeWidth: 8,
      strokeDashArray: [10, 5],
    });

    this.canvas.add(circle, circle2, circle3);

    const numBulbs = 40;
    const sliceBulb = (Math.PI * 2) / numBulbs;
    for (let i = 0; i < numBulbs; ++i) {
      let px = cx + Math.cos(i * sliceBulb) * radius;
      let py = cy + Math.sin(i * sliceBulb) * radius;

      let color = colors[i % colors.length];
      let b1 = this.bulb(color, 10);
      b1.left = px;
      b1.top = py;
      const glowColor = adjustColor(color, 70).slice(1);
      const glowRgb = [
        parseInt(glowColor.slice(0, 2), 16),
        parseInt(glowColor.slice(2, 4), 16),
        parseInt(glowColor.slice(4, 6), 16),
      ].join(", ");
      this.bulbs.push({ group: b1, lamp: b1.item(0), color, glowRgb, glowing: false });
      this.canvas.add(b1);
    }

    let midbul = new fabric.Circle({
      left: cx,
      top: cy,
      radius: 60,
      originY: "center",
      originX: "center",
      fill: "#FFD700",
      stroke: "#FFEE99",
      strokeWidth: 5,
    });

    this.middle = midbul; // used for setting primary color

    this.canvas.add(midbul);

    let midbul2 = new fabric.Circle({
      left: cx,
      top: cy,
      radius: 30,
      originY: "center",
      originX: "center",
      fill: "#FFAA1D",
      stroke: "#FFBB1D",
      strokeWidth: 5,
    });

    this.center = midbul2; // used for setting color

    this.canvas.add(midbul2);

    this.animateBulbs();
  }

  bulb(color, size) {
    var circle3 = new fabric.Circle({
      radius: size,
      originY: "center",
      originX: "center",
      fill: color,
      stroke: "white",
      strokeWidth: 2,
    });

    var cir2 = new fabric.Circle({
      radius: 3,
      left: 2,
      top: 2,
      originY: "center",
      originX: "center",
      fill: "white",
    });

    var group = new fabric.Group([circle3, cir2]);
    group.set({
      originX: "center",
      originY: "center",
    });
    return group;
  }

  radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
  }
  rotate(rotationSeconds, callback, excludedEntries = []) {
    const entries = [...this.entries];
    const excluded = new Set(excludedEntries);
    const candidates = entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => !excluded.has(entry));
    if (candidates.length === 0) return false;

    const totalWeight = candidates.reduce(
      (total, { entry }) => total + this.getEntryWeight(entry),
      0
    );
    let remainingWeight = Math.random() * totalWeight;
    let selectedCandidate = candidates[candidates.length - 1];

    for (const candidate of candidates) {
      remainingWeight -= this.getEntryWeight(candidate.entry);
      if (remainingWeight < 0) {
        selectedCandidate = candidate;
        break;
      }
    }
    const { entry: selectedEntry, index: selectedIndex } = selectedCandidate;
    this.hitCounts.set(
      selectedEntry,
      (this.hitCounts.get(selectedEntry) || 0) + 1
    );
    console.log("Wheel selected index:", selectedIndex, "entry:", entries[selectedIndex]);
    console.log("Selection chances for the next roll:");
    const hitStats = this.getHitStats(entries);
    console.table(hitStats);
    if (this.onHitStats) {
      this.onHitStats(hitStats);
    }

    const slice = 360 / entries.length;
    const targetAngle = (360 - (selectedIndex + 0.5) * slice) % 360;
    const currentAngle = ((this.rotation % 360) + 360) % 360;
    const alignmentRotation = (targetAngle - currentAngle + 360) % 360;
    const extraSpins = 2 + Math.floor(Math.random() * 4);
    this.rotation += extraSpins * 360 + alignmentRotation;

    let thething = document.getElementById(this.container);
    let completed = false;
    let fallbackTimeout;

    const finish = () => {
      if (completed) return;
      completed = true;
      thething.removeEventListener("transitionend", handler);
      clearTimeout(fallbackTimeout);

      callback(selectedEntry);
    };

    let handler = (event) => {
      if (event.target === thething && event.propertyName === "transform") {
        finish();
      }
    };

    thething.addEventListener("transitionend", handler);
    thething.style.cssText = `transition: transform ${rotationSeconds}s ease-in-out; transform: rotate(${this.rotation}deg);`;
    fallbackTimeout = setTimeout(finish, rotationSeconds * 1000 + 100);
    return true;
  }
}

const colors = [
  "#FF0000", // Red (Primary)
  "#00FF00", // Green (Primary)
  "#0000FF", // Blue (Primary)
  "#FFFF00", // Yellow (Secondary)
  "#FFA500", // Orange (Secondary)
  "#FF00FF", // Magenta (Secondary)
  "#00FFFF", // Cyan (Secondary)
  "#800080", // Purple (Tertiary)
  "#808000", // Olive (Tertiary)
  "#008080", // Teal (Tertiary)
];
