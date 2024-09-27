const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/filteredWords.json');

// Load filtered words from JSON file
const loadFilteredWords = (guildId) => {
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
            console.log("Filtered words file created");
        }
        const data = fs.readFileSync(filePath, 'utf8');
        const filteredWords = JSON.parse(data);
        return filteredWords[guildId] || [];
    } catch (error) {
        console.error("Error loading filtered words:", error);
        return [];
    }
};

// Save updated filtered words to JSON file
const saveFilteredWords = (guildId, words) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const filteredWords = JSON.parse(data);
        filteredWords[guildId] = words;
        fs.writeFileSync(filePath, JSON.stringify(filteredWords, null, 2));
        console.log(`Updated filtered words for guild ${guildId}`);
    } catch (error) {
        console.error("Error saving filtered words:", error);
    }
};

module.exports = { loadFilteredWords, saveFilteredWords };
