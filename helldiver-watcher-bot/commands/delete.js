const { loadFilteredWords, saveFilteredWords } = require('../utils/fileManager');

module.exports = {
    data: {
        name: '반역단어삭제',
        description: '반역 단어를 삭제합니다.',
        options: [
            {
                name: '단어',
                type: 3, // STRING
                description: '삭제할 반역 단어',
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const wordToRemove = interaction.options.getString('단어');
        const guildId = interaction.guild.id;
        const currentWords = loadFilteredWords(guildId);
        const updatedWords = currentWords.filter(word => word !== wordToRemove);
        saveFilteredWords(guildId, updatedWords);

        await interaction.reply({
            content: `✅ 반역 단어 목록에서 **"${wordToRemove}"**를 안전하게 삭제했습니다`,
            ephemeral: true
        });
    }
};
