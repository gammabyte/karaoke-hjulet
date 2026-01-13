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
