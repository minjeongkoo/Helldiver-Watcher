const { loadFilteredWords, saveFilteredWords } = require('../utils/fileManager');

module.exports = {
    data: {
        name: '반역단어등록',
        description: '반역 단어를 추가합니다.',
        options: [
            {
                name: '단어',
                type: 3, // STRING
                description: '추가할 반역 단어',
                required: true,
            },
        ],
    },
    async execute(interaction) {
        const newWord = interaction.options.getString('단어'); // 사용자가 입력한 단어
        const guildId = interaction.guild.id; // 서버 ID 가져오기

        // 현재 금지 단어 목록 가져오기
        const filteredWords = loadFilteredWords(guildId);

        // 단어가 이미 목록에 있는지 확인
        if (filteredWords.includes(newWord)) {
            await interaction.reply({
                content: `😅 금지 단어 목록에 "${newWord}"(이)가 이미 존재합니다`,
                ephemeral: true
            });
            return; // 중복일 경우 추가 작업을 중단
        }

        if (filteredWords.length >= 30) {
            await interaction.reply({
                content: `😭 **반역 단어 목록은 30개 까지 추가할 수 있습니다.**\n현재 ${filteredWords.length}개가 등록되어 있습니다.`,
                ephemeral: true
            });
            return; // 30개 이상일 경우 추가 작업을 중단
        }

        // 새 단어 추가
        const updatedWords = [...filteredWords, newWord];
        saveFilteredWords(guildId, updatedWords);

        await interaction.reply({
            content: `✅ 검열 단어에 "${newWord}"(이)가 등록되었습니다!`,
            ephemeral: true
        });
    },
    // async execute(interaction) {
    //     const newWord = interaction.options.getString('단어');
    //     const guildId = interaction.guild.id;
    //     const filteredWords = loadFilteredWords(guildId);
    //     const updatedWords = [...filteredWords, newWord];
    //     saveFilteredWords(guildId, updatedWords);
    //
    //     await interaction.reply({
    //         content: `금지 단어 목록에 "${newWord}"를 추가했습니다.`,
    //         ephemeral: true
    //     });
    // }
};
