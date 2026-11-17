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

const themeNeonNights = {
    name: "Neon Nights",
    style: "theme/neon_nights/style.css",
    particleColors: ["#00F2FF", "#FF00B4", "#8B5CFF"],
    particleShape: "triangle",
    wheelPrimarycolor: "#00F2FF"
};

const themeDiscoFever = {
    name: "Disco Fever",
    style: "theme/disco_fever/style.css",
    particleColors: ["#D8E1FF", "#FF2AA1", "#4169E1"],
    particleShape: "star",
    wheelPrimarycolor: "#FF2AA1"
};

const themeTropicalHeat = {
    name: "Tropical Heat",
    style: "theme/tropical_heat/style.css",
    particleColors: ["#FF6B5E", "#25C6C8", "#FFD447"],
    particleShape: "circle",
    wheelPrimarycolor: "#FFD447"
};

const themeMidnightLounge = {
    name: "Midnight Lounge",
    style: "theme/midnight_lounge/style.css",
    particleColors: ["#D8B86A", "#2AB7A9", "#426A8C"],
    particleShape: "circle",
    wheelPrimarycolor: "#D8B86A"
};

const themeCandyPop = {
    name: "Candy Pop",
    style: "theme/candy_pop/style.css",
    particleColors: ["#FF75B5", "#FF9D3D", "#71E3B0"],
    particleShape: "star",
    wheelPrimarycolor: "#FF75B5"
};

const themes = {
    "default": themeDefault,
    "christmas": themeChristmas,
    "90s": theme90sMusic,
    "80s": theme80sMusic,
    "rock_metal": themeRockMetal,
    "neon_nights": themeNeonNights,
    "disco_fever": themeDiscoFever,
    "tropical_heat": themeTropicalHeat,
    "midnight_lounge": themeMidnightLounge,
    "candy_pop": themeCandyPop,
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
