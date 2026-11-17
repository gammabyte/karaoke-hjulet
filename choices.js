class Choices {
  constructor(container, canvas) {
    this.container = container;
    this.canvas = canvas;

    this.pad = 20;
    this.entryheight = 60;
    this.thick = 1;
    this.fontsize = 24;
    this.maxSingerHistory = 3;
    this.singerGap = 6;
    this.boxStroke = "black";
    this.boxStrokeWidth = 3;
    this.textOutlineWidth = 1.5;

    this.singersOffset = this.pad + this.entryheight * 3;

    this.currentArtistBox = null;
    this.currentSingers = [];
    this.artistName = null;
    this.singerBoxes = [];

    const canvasElement = this.canvas.getElement();
    canvasElement.addEventListener("click", (event) => {
      if (this.isArtistBoxHit(event) && this.artistName !== null) {
        openYoutubeKaraokeSearch(this.artistName);
      }
    });
    canvasElement.addEventListener("mousemove", (event) => {
      canvasElement.style.cursor = this.isArtistBoxHit(event)
        ? "pointer"
        : "default";
    });
    canvasElement.addEventListener("mouseleave", () => {
      canvasElement.style.cursor = "default";
    });
  }

  isArtistBoxHit(event) {
    if (
      !this.currentArtistBox ||
      this.artistName === null ||
      specialArtistLabels.includes(this.artistName)
    ) {
      return false;
    }

    const canvasElement = this.canvas.getElement();
    const canvasRect = canvasElement.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) {
      return false;
    }

    const x =
      ((event.clientX - canvasRect.left) / canvasRect.width) * this.canvas.width;
    const y =
      ((event.clientY - canvasRect.top) / canvasRect.height) * this.canvas.height;
    const bounds = this.currentArtistBox.getBoundingRect();

    return (
      x >= bounds.left &&
      x <= bounds.left + bounds.width &&
      y >= bounds.top &&
      y <= bounds.top + bounds.height
    );
  }


  theme(primaryColor) {
    this.primaryColor = primaryColor;
    this.singersbox.set('fill', primaryColor);
    this.artistbox.set('fill', primaryColor);

    this.canvas.renderAll();
  }

  resize(width, height) {
    this.canvas.setDimensions({ width, height });
    this.init();
  }

  init() {
    this.canvas.clear();
    this.singerBoxes = [];
    this.currentArtistBox = null;

    const panelPadding = 10;
    const artistPanel = new fabric.Rect({
      left: panelPadding,
      top: this.pad - panelPadding,
      width: this.canvas.width - panelPadding * 2,
      height: this.entryheight * 2 + panelPadding * 3,
      fill: "rgba(0, 0, 0, 0.33)",
      rx: 10,
      ry: 10,
      strokeWidth: 0,
    });
    const singersPanel = new fabric.Rect({
      left: panelPadding,
      top: this.singersOffset - panelPadding,
      width: this.canvas.width - panelPadding * 2,
      height:
        this.entryheight * (this.maxSingerHistory + 1) +
        panelPadding * 3 +
        this.singerGap * (this.maxSingerHistory - 1),
      fill: "rgba(0, 0, 0, 0.33)",
      rx: 10,
      ry: 10,
      strokeWidth: 0,
    });

    let artistbox = new fabric.Rect({
      left: this.pad,
      top: this.pad,
      width: this.canvas.width - this.pad * 2,
      height: this.entryheight,
      stroke: this.boxStroke,
      strokeWidth: this.boxStrokeWidth,
      rx: 10, // Rounded corners for a smoother appearance
      ry: 10,
      opacity: 0.9, // Slightly transparent for a more subtle effect
    });
    artistbox.set(
      "fill",
      "gold"
      /*
      new fabric.Gradient({
        type: "radial",

        coords: {
          x1: artistbox.width / 2,
          y1: artistbox.height / 2,
          x2: artistbox.width / 2,
          y2: artistbox.height / 2,
          r1: artistbox.width / 6, // inner circle radius
          r2: artistbox.width / 2, // outer circle radius
        },
        colorStops: [
          { offset: 0, color: "gold" }, // first color stop
          { offset: 0.5, color: "yellow" }, // second color stop
          { offset: 1, color: "white" }, // third color stop
        ],
      })
        */
    );

    this.artistbox = artistbox; // used for theme color changing

    var artixttitletext = new fabric.Text("🎤 ARTIST 🎤", {
      top: this.pad + this.entryheight / 2 - this.fontsize / 2,
      left: this.canvas.width / 2,
      originX: "center",
      fontFamily: "Verdana",
      fontSize: this.fontsize,
      fontWeight: "bold",
      fill: "white",
      stroke: "black",
      strokeWidth: this.textOutlineWidth,
    });

    let singersbox = new fabric.Rect({
      left: this.pad,
      top: this.singersOffset,
      width: this.canvas.width - this.pad * 2,
      height: this.entryheight,
      stroke: this.boxStroke,
      strokeWidth: this.boxStrokeWidth,
      rx: 10, // Rounded corners for a smoother appearance
      ry: 10,
      opacity: 0.9, // Slightly transparent for a more subtle effect
    });
    singersbox.set(
      "fill",
      "gold"
      /*
      new fabric.Gradient({
        type: "radial",

        coords: {
          x1: singersbox.width / 2,
          y1: singersbox.height / 2,
          x2: singersbox.width / 2,
          y2: singersbox.height / 2,
          r1: singersbox.width / 6, // inner circle radius
          r2: singersbox.width / 2, // outer circle radius
        },
        colorStops: [
          { offset: 0, color: "gold" }, // first color stop
          //{ offset: 0.5, color: "yellow" }, // second color stop
          //{ offset: 1, color: "white" }, // third color stop
        ],
      })
        */
    );

    this.singersbox = singersbox; // used for theme color

    var singerstitletext = new fabric.Text("🎶 SINGERS 🎶", {
      left: this.canvas.width / 2,
      originX: "center",
      top: this.singersOffset + this.entryheight / 2 - this.fontsize / 2,
      fontFamily: "Verdana",
      fontSize: this.fontsize,
      fontWeight: "bold",
      fill: "white",
      stroke: "black",
      strokeWidth: this.textOutlineWidth,
    });

    this.canvas.add(
      artistPanel,
      singersPanel,
      artistbox,
      artixttitletext,
      singersbox,
      singerstitletext
    );

    if (this.primaryColor) {
      this.theme(this.primaryColor);
    }
    if (this.artistName !== null) {
      this.drawArtist(this.artistName);
    }
    this.currentSingers.forEach((singer, index) => this.drawSinger(singer, index));
  }

  addSinger(singer) {
    if (this.currentSingers.length === this.maxSingerHistory) {
      this.currentSingers.shift();
      this.canvas.remove(this.singerBoxes.shift());
      this.singerBoxes.forEach((box, index) => {
        box.top =
          this.singersOffset +
          this.entryheight +
          10 +
          index * (this.entryheight + this.singerGap);
        box.setCoords();
      });
    }

    this.currentSingers.push(singer);
    this.drawSinger(singer, this.currentSingers.length - 1);
    this.canvas.renderAll();
  }

  resetArtist() {
    this.artistName = null;
    if (this.currentArtistBox !== null) {
      this.canvas.remove(this.currentArtistBox);
      this.currentArtistBox = null;
    }
  }

  resetSingers() {
    this.singerBoxes.forEach((box) => this.canvas.remove(box));
    this.currentSingers = [];
    this.singerBoxes = [];
  }

  addArtist(artist) {
    if (this.currentArtistBox != null) {
      this.canvas.remove(this.currentArtistBox);
      this.currentArtistBox = null;
    }

    this.artistName = artist;
    this.drawArtist(artist);
  }

  drawArtist(artist) {
    this.currentArtistBox = this.createEntry(artist);
    this.currentArtistBox.top = this.entryheight + this.pad + 10;
    this.currentArtistBox.setCoords();
    this.currentArtistBox.set({
      selectable: false,
      hoverCursor: "pointer",
    });

    this.canvas.add(this.currentArtistBox);
  }

  drawSinger(singer, index) {
    let newSinger = this.createEntry(singer);
    newSinger.top =
      this.singersOffset +
      this.entryheight +
      10 +
      index * (this.entryheight + this.singerGap);

    this.singerBoxes.push(newSinger);
    this.canvas.add(newSinger);
  }

  createEntry(name) {
    let fill = colorsChoices[Math.floor(Math.random()*colorsChoices.length)];
    let box = new fabric.Rect({
      left: this.pad,
      top: this.pad,
      width: this.canvas.width - this.pad * 2,
      height: this.entryheight,
      stroke: this.boxStroke,
      fill: fill,
      strokeWidth: this.boxStrokeWidth,
      rx: 10, // Rounded corners for a smoother appearance
      ry: 10,
      opacity: 0.9, // Slightly transparent for a more subtle effect
    });

    var title = new fabric.Text(name, {
      top: this.pad + this.entryheight / 2 - this.fontsize / 2,
      left: this.pad + 20,
      fontFamily: "Verdana",
      fontSize: this.fontsize,
      fontWeight: "bold",
      fill: "white",
      stroke: "black",
      strokeWidth: this.textOutlineWidth,
    });

    return new fabric.Group([box, title]);
  }
}

function openYoutubeKaraokeSearch(artist) {
  if (specialArtistLabels.includes(artist)) {
    return;
  }

  const query = encodeURIComponent(`${artist} karaoke`);
  window.open(
    `https://www.youtube.com/results?search_query=${query}`,
    "_blank",
    "noopener,noreferrer"
  );
}

const colorsChoices = [
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