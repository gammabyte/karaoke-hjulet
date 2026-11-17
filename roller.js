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

const funArtistEntries = [
  "🎤 FREE CHOICE 🎤",
  "🥂 CHEERS! 🥂",
  "🙌 AUDIENCE CHOICE 🙌",
];
const themeArtistEntries = [
  "🎬 FILM SONGS 🎬",
  "🎄 XMAS SONGS 🎄",
  "✨ EUROVISION SONGS ✨",
  "🏰 DISNEY SONGS 🏰",
];
const specialArtistEntries = [...funArtistEntries, ...themeArtistEntries];

class Roller {
  constructor(container, canvas, entries) {
    this.container = container;
    this.canvas = canvas;
    this.rotation = 0;

    this.rect = null;
    this.time = 0;
    this.rects = [];

    this.boxheight = 50;
    this.boxwidth = this.canvas.width;

    this.totalMove = 0;
    this.hitCounts = new Map();
    this.recentEntries = [];
    this.weightDecay = 0.2;
    this.onHitStats = null;
    this.bulbs = [];
    this.bulbAnimationFrame = null;
    this.bulbAnimationEnabled = true;
    this.isRolling = false;

    const canvasElement = this.canvas.getElement();
    canvasElement.addEventListener("click", (event) => {
      const artist = this.getArtistAtEvent(event);
      if (artist !== null) {
        openYoutubeKaraokeSearch(artist);
      }
    });
    canvasElement.addEventListener("mousemove", (event) => {
      canvasElement.style.cursor =
        this.getArtistAtEvent(event) !== null ? "pointer" : "default";
    });
    canvasElement.addEventListener("mouseleave", () => {
      canvasElement.style.cursor = "default";
    });
    
    this.update(entries);
  }
  
  getArtistAtEvent(event) {
    if (this.isRolling) {
      return null;
    }

    const canvasElement = this.canvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) {
      return null;
    }

    const x =
      ((event.clientX - canvasRect.left) / canvasRect.width) * this.canvas.width;
    const y =
      ((event.clientY - canvasRect.top) / canvasRect.height) * this.canvas.height;
    if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) {
      return null;
    }

    const index = this.rects.findIndex(
      (row, index) =>
        this.canvas._objects.includes(row) &&
        !specialArtistEntries.includes(this.entries[index]) &&
        y >= row.top &&
        y <= row.top + this.boxheight
    );
    return index === -1 ? null : this.entries[index];
  }

  update(entries) {
    this.stopBulbAnimation();
    this.isRolling = false;
    this.canvas.getElement().style.cursor = "default";
    const shuffle = (array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };
    const baseEntries = shuffle(
      (entries || []).filter((entry) => !specialArtistEntries.includes(entry))
    );
    const specialEntryShare = 0.02;
    // Round up so each special entry is at least 2% of the final spinner.
    const copiesPerSpecialEntry = baseEntries.length
      ? Math.ceil(
          (baseEntries.length * specialEntryShare) /
            (1 - specialArtistEntries.length * specialEntryShare)
        )
      : 0;
    const specialEntries = [];
    for (let i = 0; i < copiesPerSpecialEntry; i++) {
      specialArtistEntries.forEach((entry) => specialEntries.push(entry));
    }
    this.entries = [];
    let specialIndex = 0;
    for (let i = 0; i < baseEntries.length; i++) {
      this.entries.push(baseEntries[i]);
      if (i === baseEntries.length - 1) continue;

      const previousSpecialCount = Math.floor(
        (i * specialEntries.length) / (baseEntries.length - 1)
      );
      const nextSpecialCount = Math.floor(
        ((i + 1) * specialEntries.length) / (baseEntries.length - 1)
      );
      const specialsAfterThis = nextSpecialCount - previousSpecialCount;
      for (let j = 0; j < specialsAfterThis; j++) {
        this.entries.push(specialEntries[specialIndex++]);
      }
    }
    while (specialIndex < specialEntries.length) {
      this.entries.push(specialEntries[specialIndex++]);
    }

    this.canvas.clear();
    this.rotation = 0;
    this.time = 0;
    this.totalMove = 0;
    
    this.rect = null;
    //this.time = 0;
    this.rects = [];

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
    this.boxwidth = width;
    this.init();
    if (this.primaryColor) {
      this.theme(this.primaryColor);
    }
  }

  createbigbox(ystart) {
    let alles = [];

    for (let i = 0; i < this.entries.length; ++i) {
      //let randomColor = Math.floor(Math.random() * 16777215).toString(16);
      let randomColor = colorsroller[i % colorsroller.length];

      let r = new fabric.Rect({
        left: 0,
        top: ystart + i * this.boxheight,
        width: this.boxwidth,
        height: this.boxheight,
        fill: randomColor,
      });

      let fontsize = 24;

      const isSpecialEntry = specialArtistEntries.includes(this.entries[i]);
      const text = new fabric.Text(this.entries[i], {
        top: ystart + i * this.boxheight + fontsize / 2,
        left: isSpecialEntry ? this.boxwidth / 2 : 45,
        originX: isSpecialEntry ? "center" : "left",
        fontFamily: "Verdana",
        fontSize: fontsize,
        fontWeight: "bold",
        fill: "black",
        stroke: "white",
        strokeWidth: 0.5,
      });

      let group1 = new fabric.Group([r, text]);

      alles.push(group1);
    }
    return alles;
  }

  theme(primaryColor) {
    this.primaryColor = primaryColor;
    this.edge.set('stroke', primaryColor); // You can use CSS variables here too!
    this.triangle.set('fill', adjustColor(primaryColor, 100));

    this.canvas.renderAll();
  }

  stopBulbAnimation() {
    if (this.bulbAnimationFrame !== null) {
      cancelAnimationFrame(this.bulbAnimationFrame);
      this.bulbAnimationFrame = null;
    }
  }

  setBulbAnimationEnabled(enabled) {
    this.bulbAnimationEnabled = enabled;
    if (enabled) {
      this.animateBulbs();
      return;
    }

    this.stopBulbAnimation();
    this.bulbs.forEach(({ group, lamp, color }) => {
      lamp.set("fill", color);
      group.set("shadow", null);
    });
    this.frame.dirty = true;
    this.canvas.renderAll();
  }

  trackBulb(group, color) {
    const glowColor = adjustColor(color, 70).slice(1);
    const glowRgb = [
      parseInt(glowColor.slice(0, 2), 16),
      parseInt(glowColor.slice(2, 4), 16),
      parseInt(glowColor.slice(4, 6), 16),
    ].join(", ");
    this.bulbs.push({
      group,
      lamp: group.item(0),
      color,
      glowRgb,
      glowing: false,
    });
  }

  animateBulbs() {
    const prefersReducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (
      !this.bulbAnimationEnabled ||
      this.bulbs.length === 0 ||
      prefersReducedMotion
    ) {
      return;
    }

    let lastFrame = 0;
    const frameInterval = 1000 / 30;
    const animate = (time) => {
      if (time - lastFrame >= frameInterval) {
        lastFrame = time;
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

        this.frame.dirty = true;
        this.canvas.renderAll();
      }
      this.bulbAnimationFrame = requestAnimationFrame(animate);
    };

    this.bulbAnimationFrame = requestAnimationFrame(animate);
  }

  init() {
    this.stopBulbAnimation();
    this.isRolling = false;
    this.canvas.getElement().style.cursor = "default";
    this.bulbs = [];
    this.canvas.clear();
    this.rects = [];
    this.totalMove = 0;
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    /*
    let alles1 = this.createbigbox(0);
    let alles2 = this.createbigbox(this.entries.length * this.boxheight);

    let group1 = new fabric.Group(alles1);
    this.rects.push(group1);
    this.canvas.add(group1);

    let group2 = new fabric.Group(alles2);
    this.rects.push(group2);
    this.canvas.add(group2);
    */

    let groups = this.createbigbox(-60);

    for (let i = 0; i < groups.length; ++i) {
      this.rects.push(groups[i]);
      //this.canvas.add(groups[i]);
    }

    let thick = 45;
    let pad = 4;

    let edgeblack = new fabric.Rect({
      left: 0,
      top: 0,
      width: this.canvas.width - thick,
      height: this.canvas.height - thick,
      fill: "transparent",
      stroke: "black",
      strokeWidth: thick,
    });

    let edgewhite = new fabric.Rect({
      left: 28,
      top: 28,
      width: this.canvas.width - 64,
      height: this.canvas.height - 64,
      fill: "transparent",
      stroke: "white",
      strokeWidth: thick,
      strokeWidth: 8,
      strokeDashArray: [10, 5],
    });

    let edge = new fabric.Rect({
      left: pad,
      top: pad,
      width: this.canvas.width - thick,
      height: this.canvas.height - thick,
      fill: "transparent",
      stroke: "gold",
      strokeWidth: thick - pad * 2,
    });

    this.edge = edge; // really just for setting theme color

    let thegroup = [edgeblack, edge, edgewhite];

    // top and bottom
    let numTopBottom = 10;
    for (let i = 0; i < numTopBottom; ++i) {
      let slice = this.canvas.width / numTopBottom;

      let color1 = colorsroller[i % colorsroller.length];

      let bulb1 = this.bulb(color1, 10);
      bulb1.left = thick / 2 + slice * i;
      bulb1.top = thick / 2;
      this.trackBulb(bulb1, color1);

      let color2 = colorsroller[(i + 3) % colorsroller.length];
      let bulb2 = this.bulb(color2, 10);

      bulb2.left = thick / 2 + slice * i;
      bulb2.top = this.canvas.height - thick / 2;
      this.trackBulb(bulb2, color2);

      thegroup.push(bulb1);
      thegroup.push(bulb2);
    }

    // left and right
    let numLeftRight = 20;
    for (let i = 0; i < numLeftRight - 2; ++i) {
      let slice = this.canvas.height / numLeftRight;

      let color1 = colorsroller[i % colorsroller.length];

      let bulb1 = this.bulb(color1, 10);
      bulb1.left = thick / 2;
      bulb1.top = thick / 2 + slice * i + slice;
      this.trackBulb(bulb1, color1);

      let color2 = colorsroller[(i + 3) % colorsroller.length];
      let bulb2 = this.bulb(color2, 10);

      bulb2.left = this.canvas.width - thick / 2;
      bulb2.top = thick / 2 + slice * i + slice;
      this.trackBulb(bulb2, color2);

      thegroup.push(bulb1);
      thegroup.push(bulb2);
    }

    const triangleHeight = 100;
    const triangleWidth = 100;
    const triangleStroke = 4;

    const triangle = new fabric.Triangle({
      width: triangleWidth - 5,
      height: triangleHeight,
      fill: "#FFAA1D",
      left: this.canvas.width - triangleWidth - triangleStroke - 5,
      top: (this.canvas.height - triangleHeight) / 2,
      stroke: "black",
      strokeWidth: triangleStroke,
    });
    this.triangle = triangle; // used for setting theme color

    triangle.rotate(-90);

    thegroup.push(triangle);

    this.frame = new fabric.Group(thegroup);

    for (let i = 0; i < this.rects.length; ++i) {
      this.canvas.add(this.rects[i]);
    }

    this.canvas.add(this.frame);
    this.animateBulbs();
  }

  changeme(canco, target) {
    const maxxo = this.entries.length * this.boxheight;

    return () => {
      const currentRect = target;
      currentRect.top = currentRect.top % maxxo;

      if (currentRect.top > maxxo) {
        console.log("JOSJSO");
      }
      const canny = canco;

      if (currentRect.top > 0 && currentRect.top < this.canvas.height) {
        if (!canny._objects.includes(currentRect)) {
          canny.add(currentRect);
        }
      } else {
        if (canny._objects.includes(currentRect)) {
          canny.remove(currentRect);
        }
      }

      canny.bringToFront(this.frame);
    };
  }

  roll(duration, callback) {
    const candidates = this.entries
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => !this.recentEntries.includes(entry));
    if (candidates.length === 0) return false;

    const fullsize = this.entries.length * this.boxheight;
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

    const { entry: artist, index: selectedIndex } = selectedCandidate;
    this.isRolling = true;
    this.canvas.getElement().style.cursor = "default";
    this.hitCounts.set(artist, (this.hitCounts.get(artist) || 0) + 1);
    this.recentEntries.push(artist);
    if (this.recentEntries.length > 3) {
      this.recentEntries.shift();
    }
    console.log("Artist selected index:", selectedIndex, "entry:", artist);
    console.log("Artist selection chances for the next roll:");
    const hitStats = this.getHitStats();
    console.table(hitStats);
    if (this.onHitStats) {
      this.onHitStats(hitStats);
    }

    const targetOffset =
      ((this.canvas.height / 2 + 60 - (selectedIndex + 0.5) * this.boxheight) %
        fullsize +
        fullsize) %
      fullsize;
    const currentOffset = ((this.totalMove % fullsize) + fullsize) % fullsize;
    const alignmentMove = (targetOffset - currentOffset + fullsize) % fullsize;
    const extraSpins = 2 + Math.floor(Math.random() * 4);
    const move = extraSpins * fullsize + alignmentMove;
    this.totalMove += move;

    let completedAnimations = 0;

    for (let i = 0; i < this.rects.length; ++i) {
      let rect = this.rects[i];
      rect.animate(
        {
          top: rect.top + move,
        },
        {
          duration: duration,
          easing: fabric.util.ease.easeInOutQuad,
          onChange: this.changeme(this.canvas, rect),
          onComplete: () => {
            completedAnimations++;
            if (completedAnimations !== this.rects.length) return;

            this.isRolling = false;
            callback(artist);
          },
        }
      );

      //      setInterval(() => this.canvas.requestRenderAllBound(), 16);
    }
    return true;
  }

  somefunc() {
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const containerheight = 400;
    const boxheight = 100;
    let index = easeInOutQuint(this.time);
    index = index % this.rects.length;

    console.log("doit, time: " + this.time + ", index: " + index);

    for (let i = 0; i < this.rects.length; ++i) {
      this.rects[i].top = cy + (index - i) * boxheight;
    }

    this.canvas.renderAll();

    this.time += 0.00001625;
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
}

function easeInOutQuint(x) {
  return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

const colorsroller = [
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
