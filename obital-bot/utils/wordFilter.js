const { loadFilteredWords } = require('../utils/fileManager');

const checkForFilteredWords = (message) => {
    const guildId = message.guild.id; // 서버 ID
    const filteredWords = loadFilteredWords(guildId);
    const messageContent = message.content.toLowerCase(); // 메시지를 소문자로 변환

    let words = [];
    // Check Words
    for (const word of filteredWords) {
        if (messageContent.includes(word.toLowerCase())) {
            words.push(word);
        }
    }
    console.log('words', words);
    return words.length > 0 ? {words, guildId} : null;
};


const maskFilteredWords = (message, filteredWord) => {
    const regex = new RegExp(`(${filteredWord.join('|')})`, 'g');;
    return message.replace(regex, '[검열삭제]');
};

module.exports = { checkForFilteredWords, maskFilteredWords };
