// Month Array (used for retrieving month name)
const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Converts a ISO6801 string to a human readable string for the date
function convertISOtoDate(isoString) {
    let d = new Date(isoString);
    return (`${d.getUTCDate()} ${month[d.getUTCMonth()]} ${d.getUTCFullYear()}`);
}

// Converts a ISO6801 string to a human readable string for the time
function convertISOtoTime(isoString) {
    let d = new Date(isoString);
    if (d.getUTCMinutes() < 10) {
      return (`${d.getUTCHours()}:0${d.getUTCMinutes()} UTC`);
    } else {
      return (`${d.getUTCHours()}:${d.getUTCMinutes()} UTC`);
    }
}

// Takes a User ID and returns the appropriate path for a profile picture
function getProfilePathFromID(id) {
    // If valid
    if (id) {
        // Hash
        let hashCode = hash(id);
        let numToUse = Math.abs(hashCode % 8);
        return `/avatars/avatar${numToUse}.png`;
    } else { // If invalid, return the default (same as favicon)
        return "/favicon.ico";
    }
}

// Adapted from https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
// Simple Hash Function
function hash(string) {
    let hash = 0;
    if (string.length === 0) return hash;
    for (let i = 0; i < string.length; i++) {
      let chr = string.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export {convertISOtoDate, convertISOtoTime, getProfilePathFromID};