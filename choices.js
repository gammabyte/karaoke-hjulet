class Choices {
  constructor(container, canvas) {
    this.container = container;
    this.canvas = canvas;

    this.pad = 20;
    this.entryheight = 60;
    this.thick = 1;
    this.fontsize = 24;

    this.singersOffset = this.pad + this.entryheight * 3;

    this.currentArtistBox = null;
    this.currentSingers = [];
    this.artistName = null;
    this.singerBoxes = [];
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

    let artistbox = new fabric.Rect({
      left: this.pad,
      top: this.pad,
      width: this.canvas.width - this.pad * 2,
      height: this.entryheight,
      stroke: "#333", // Darker stroke for better contrast
      strokeWidth: 2, // Slightly thinner stroke
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

    var artixttitletext = new fabric.Text("Artist", {
      top: this.pad + this.entryheight / 2 - this.fontsize / 2,
      left: this.pad + 20,
      fontFamily: "Verdana",
      fontSize: this.fontsize,
      fontWeight: "bold",
      fill: "black",
      //stroke: "white",
      //strokeWidth: 0.5,
    });

    let singersbox = new fabric.Rect({
      left: this.pad,
      top: this.singersOffset,
      width: this.canvas.width - this.pad * 2,
      height: this.entryheight,
      stroke: "#333", // Darker stroke for better contrast
      strokeWidth: 2, // Slightly thinner stroke
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

    var singerstitletext = new fabric.Text("Singers", {
      left: this.pad + 20,
      top: this.singersOffset + this.entryheight / 2 - this.fontsize / 2,
      fontFamily: "Verdana",
      fontSize: this.fontsize,
      fontWeight: "bold",
      fill: "black",
      //stroke: "white",
      //strokeWidth: 0.5,
    });

    this.canvas.add(artistbox, artixttitletext, singersbox, singerstitletext);

    if (this.primaryColor) {
      this.theme(this.primaryColor);
    }
    if (this.artistName !== null) {
      this.drawArtist(this.artistName);
    }
    this.currentSingers.forEach((singer, index) => this.drawSinger(singer, index));
  }

  addSinger(singer) {
    this.currentSingers.push(singer);
    this.drawSinger(singer, this.currentSingers.length - 1);
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

    this.canvas.add(this.currentArtistBox);
  }

  drawSinger(singer, index) {
    let newSinger = this.createEntry(singer);
    newSinger.top =
      this.singersOffset +
      this.entryheight +
      10 +
      index * this.entryheight;

    this.singerBoxes.push(newSinger);
    this.canvas.add(newSinger);
  }

  createEntry(name) {
    let stroke = "black";
    let fill = colorsChoices[Math.floor(Math.random()*colorsChoices.length)];
    let box = new fabric.Rect({
      left: this.pad,
      top: this.pad,
      width: this.canvas.width - this.pad * 2,
      height: this.entryheight,
      stroke: stroke, // Darker stroke for better contrast
      fill: fill,
      strokeWidth: 2, // Slightly thinner stroke
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
      //stroke: "white",
      //strokeWidth: 0.5,
    });

    return new fabric.Group([box, title]);
  }
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