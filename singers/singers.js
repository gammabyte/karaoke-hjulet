/**
 * SINGER MANAGEMENT SYSTEM 
 * Features: LocalStorage, Auto-Presets, and Callback on Close
 */

// 1. CONFIGURATION: Default names if storage is empty
//const DEFAULT_SINGERS = ["Santa Claus", "Mrs. Claus", "Rudolph", "The Grinch"];
const DEFAULT_SINGERS = [
  "Chris",
  "Birgitte",
  "Michael",
  "Robin",
  "Jana",
  "Rebecca",
  "Marie",
  "Emil",
  "Marcus",
  "Cecilia",
  "Martin",
  "Gitte",
  "Mette F",
  "Metta G",
  "Thomas",
  "Peter",
  "Victoria",
  "Susanne",
  "Jens",
  "Majken",
  "Camilla",
  "Patrick",
  "Mathilde",
  "Henrik",
  "Lise",
  "Karen",
  "Jakob S",
  "Jacob HB",
  "Jesper",
  "Mikkel",
];
/**
 * SINGER MANAGEMENT SYSTEM 
 * Features: LocalStorage, Auto-Presets, and Callbacks (Initial + OnClose)
 */

let onModalCloseCallback = null; 

/**
 * 1. CORE DATA LOGIC
 */
function getSingers() {
    const data = localStorage.getItem('karaoke_singers');
    let singers = data ? JSON.parse(data) : [];

    // Force presets if list is empty or doesn't exist
    if (singers.length === 0) {
        singers = [...DEFAULT_SINGERS];
        localStorage.setItem('karaoke_singers', JSON.stringify(singers));
    }
    return singers;
}

function saveSingers(singersArray) {
    localStorage.setItem('karaoke_singers', JSON.stringify(singersArray));
}

/**
 * 2. MODAL CONTROL LOGIC
 */
function openSingerModal(callback) {
    if (typeof callback === 'function') {
        onModalCloseCallback = callback;
    }

    const overlay = document.getElementById('singerOverlay');
    overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden'; 
    renderSingers();
}

function closeSingerModal() {
    const overlay = document.getElementById('singerOverlay');
    overlay.style.display = 'none';
    document.body.style.overflow = 'auto'; 

    const finalData = getSingers();
    if (onModalCloseCallback) {
        onModalCloseCallback(finalData);
    }
}

/**
 * 3. LIST ACTIONS
 */
function addSingerToList() {
    const input = document.getElementById('singerInput');
    const name = input.value.trim();
    
    if (name !== "") {
        let singers = getSingers();
        singers.push(name);
        saveSingers(singers);
        input.value = ''; 
        renderSingers();
    }
}

function removeSingerFromList(index) {
    let singers = getSingers();
    singers.splice(index, 1);
    saveSingers(singers);
    renderSingers(); 
}

function clearList() {
    if (confirm("Reset to default lineup?")) {
        localStorage.removeItem('karaoke_singers');
        renderSingers();
    }
}

/**
 * 4. UI RENDERING
 */
function renderSingers() {
    const listElement = document.getElementById('displayList');
    const singers = getSingers();

    listElement.innerHTML = singers.map((name, index) => `
        <li>
            <span>${name}</span>
            <button class="delete-btn" onclick="removeSingerFromList(${index})">×</button>
        </li>
    `).join('');
}

/**
 * 5. INITIALIZATION & GLOBAL LISTENERS
 */
window.addEventListener('click', function(event) {
    const overlay = document.getElementById('singerOverlay');
    if (event.target === overlay) {
        closeSingerModal();
    }
});

// INITIAL CALLBACK LOGIC
function initSingers(callback) {
    // 1. Store the callback for later modal closes
    if (typeof callback === 'function') {
        onModalCloseCallback = callback;
    }
    
    // 2. Get the current values (either from storage or defaults)
    const initialData = getSingers();
    
    // 3. Trigger the callback immediately so the main page has the data
    if (typeof callback === 'function') {
        callback(initialData);
    }
}
