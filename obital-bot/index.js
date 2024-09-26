require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {Client, GatewayIntentBits, REST, Routes} = require('discord.js');

// Discord 클라이언트 초기화
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// 금지 단어 목록 로드
const loadFilteredWords = (guildId) => {
    const filePath = path.join(__dirname, './data/filteredWords.json');
    try {
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
            console.log("금지 단어 목록 파일이 없어서 새로 생성했습니다.");
        }
        const data = fs.readFileSync(filePath, 'utf8');
        const filteredWords = JSON.parse(data);
        return filteredWords[guildId] || []; // 특정 서버의 금지 단어 반환
    } catch (error) {
        console.error("금지 단어 목록 로드 중 오류 발생:", error);
        return [];
    }
};

// 금지 단어 목록 저장
const saveFilteredWords = (guildId, words) => {
    const filePath = path.join(__dirname, './data/filteredWords.json');
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        const filteredWords = JSON.parse(data);

        // 서버 ID에 해당하는 금지 단어 목록 업데이트
        filteredWords[guildId] = words;

        // 업데이트된 목록을 JSON 파일에 저장
        fs.writeFileSync(filePath, JSON.stringify(filteredWords, null, 2));
        console.log(`서버 ${guildId}의 금지 단어 목록이 업데이트되었습니다.`);
    } catch (error) {
        console.error("금지 단어 목록 저장 중 오류 발생:", error);
    }
};

// 슬래시 명령어 등록
const registerCommands = async () => {
    const commands = [
        {
            name: 'add',
            description: '금지 단어를 추가합니다.',
            options: [
                {
                    name: '단어',
                    type: 3, // STRING
                    description: '추가할 금지 단어',
                    required: true,
                },
            ],
        },
        {
            name: 'delete',
            description: '금지 단어를 삭제합니다.',
            options: [
                {
                    name: '단어',
                    type: 3, // STRING
                    description: '삭제할 금지 단어',
                    required: true,
                },
            ],
        },
        {
            name: 'list',
            description: '현재 설정된 금지 단어를 조회합니다.',
        },
    ];

    const rest = new REST({version: '10'}).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('슬래시 명령어 등록 중...');
        // 모든 서버에 명령어 등록
        const guilds = await client.guilds.fetch();
        for (const guild of guilds.values()) {
            await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, guild.id), {
                body: commands,
            });
        }
        console.log('슬래시 명령어 등록 완료!');
    } catch (error) {
        console.error("슬래시 명령어 등록 중 오류 발생:", error);
    }
};

// 단어 필터링 함수
const checkForFilteredWords = (message) => {
    const guildId = message.guild.id; // 서버 ID 가져오기
    const filteredWords = loadFilteredWords(guildId);
    const messageContent = message.content.toLowerCase(); // 메시지를 소문자로 변환

    // 금지 단어 확인
    for (const word of filteredWords) {
        if (messageContent.includes(word.toLowerCase())) {
            return {word, guildId}; // 발견된 단어와 서버 ID 반환
        }
    }

    return null; // 발견된 단어가 없을 경우 null 반환
};

// 단어 마스킹 함수
const maskFilteredWords = (message, filteredWord) => {
    const regex = new RegExp(filteredWord, 'gi');
    return message.replace(regex, '[검열 삭제]');
};

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    // console.log(`메시지 내용: ${message.content}`); // 메시지 내용 로그
    // 금지 단어 감지
    const warningData = checkForFilteredWords(message);
    if (warningData) {
        const {word, guildId} = warningData;

        // console.log(`검출된 단어: ${word}`);

        // 단어 마스킹 처리
        const modifiedMessage = maskFilteredWords(message.content, word);

        // 랜덤 경고 메시지 배열
        const warningMessages = [
            `[검열] 조사 결과 반역자는 해당 단어를 일상 생활에서 사용한 것으로 밝혀졌습니다. 사용에 주의하세요.`,
            `[검열] 메시지에서 당국의 주목을 끌 수 있는 단어가 감지되었습니다.`,
            `[검열] 통제된 민주주의 체제에 반하는 내용은 검열됩니다.`
        ];

        // 랜덤하게 경고 메시지 선택
        const randomWarning = warningMessages[Math.floor(Math.random() * warningMessages.length)];

        // 경고 메시지 및 메시지 삭제
        await message.reply({
            content: `${randomWarning}\n ${message.author}: ${modifiedMessage}`
        });

        // 원본 메시지 삭제
        await message.delete();
    }
});

// 슬래시 명령어 처리
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const {commandName, options} = interaction;

    if (commandName === 'add') {
        const newWord = options.getString('단어');
        const guildId = interaction.guild.id; // 서버 ID 가져오기

        // 현재 금지 단어 목록 가져오기
        const filteredWords = loadFilteredWords(guildId);

        // 새 단어 추가
        const updatedWords = [...filteredWords, newWord];
        saveFilteredWords(guildId, updatedWords);

        await interaction.reply(`금지 단어 목록에 "${newWord}"를 추가했습니다.`);
    } else if (commandName === 'delete') {
        const wordToRemove = options.getString('단어');
        const guildId = interaction.guild.id; // 서버 ID 가져오기

        // 기존 금지 단어 목록에서 단어 제거
        const currentWords = loadFilteredWords(guildId);
        const updatedWords = currentWords.filter(word => word !== wordToRemove);

        // 업데이트된 목록 저장
        saveFilteredWords(guildId, updatedWords);

        await interaction.reply(`금지 단어 목록에서 "${wordToRemove}"를 삭제했습니다.`);
    } else if (commandName === 'list') {
        const guildId = interaction.guild.id; // 서버 ID 가져오기
        const currentWords = loadFilteredWords(guildId);

        if (currentWords.length === 0) {
            await interaction.reply("현재 설정된 금지 단어가 없습니다.");
        } else {
            await interaction.reply(
                `금지 단어 목록: \n ${currentWords.map(word => `- ${word}`).join('\n')}`)
            ;
        }
    }
});

// 봇 준비 완료 시 이벤트
client.once('ready', () => {
    console.log(`로그인 : ${client.user.tag}`);
});

// 봇 로그인
client.login(process.env.DISCORD_TOKEN);

// 슬래시 명령어 등록 실행
registerCommands();
