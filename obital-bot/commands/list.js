const { loadFilteredWords } = require('../utils/fileManager');

module.exports = {
    data: {
        name: '반역단어목록',
        description: '현재 설정된 반역 단어를 조회합니다.',
    },
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const currentWords = loadFilteredWords(guildId);

        if (currentWords.length === 0) {
            await interaction.reply({
                content: '반역 단어 목록이 비어있어요 😭',
                ephemeral: true
            });
        } else {
            await interaction.reply({
                content: `✅ **반역 단어 목록 (${currentWords.length}/30)**: \n ${currentWords.map(word => `- ${word}`).join('\n')}`,
                ephemeral: true
            });
        }
    }
};
