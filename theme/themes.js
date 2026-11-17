const themeDefault = {
    name: "New Year",
    headerText: "Happy New Year!",
    style: "theme/default/style.css",
    particleColors: ["#FF5930", "#FFFF00", "#00FFFF"],
    particleShape: "star",
    wheelPrimarycolor: "#EFBF04"
};

const themeChristmas = {
    name: "Christmas",
    headerPostfix: " Cozy",
    style: "theme/christmas/style.css",
    particleColors: ["#ffffff"],
    particleShape: "circle",
    wheelPrimarycolor: "#ff0000"
};

const theme90sMusic = {
    name: "90's",
    headerPostfix: " Kitsch",
    style: "theme/90s/style.css",
    particleColors: ["#00F2FF", "#FF00FF", "#FFFF00"], 
    particleShape: "triangle", // Triangles were everywhere in 90s graphic design!
    wheelPrimarycolor: "#bc13fe" // Electric Purple
};

const theme80sMusic = {
    name: "80's",
    headerPostfix: " Vibe",
    style: "theme/80s/style.css",
    particleColors: ["#00d4ff", "#ffff00", "#ff0043"], 
    particleShape: "edge", // Squares look more like 8 bit / arcade pixels
    wheelPrimarycolor: "#1a1a1a" // Matte Black (Rock 'n' Roll aesthetic)
};

const themeRockMetal = {
    name: "Rock",
    headerPostfix: " Power!",
    style: "theme/rock_metal/style.css",
    // Grayscale colors to look like sparks or stage dust
    particleColors: ["#ffffff", "#999999", "#444444"], 
    particleShape: "star", // Sharp, aggressive edges
    wheelPrimarycolor: "#1a1a1a" // Deep Charcoal / Matte Black
};


const themes = {
    "default": themeDefault,
    "christmas": themeChristmas,
    "90s": theme90sMusic,
    "80s": theme80sMusic,
    "rock_metal": themeRockMetal,
};

var themeSelected = themeDefault;

function changeTheme() {
  const select = document.getElementById("themeSelector");
  const themeLink = document.getElementById("theme-link");

  const theme = themes[select.value];

  // Swap the file path to the selected theme
  themeLink.setAttribute("href", theme.style);

  themeSelected = theme;
}
