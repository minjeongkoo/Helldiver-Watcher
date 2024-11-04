require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const addCommand = require('./commands/add');
const deleteCommand = require('./commands/delete');
const listCommand = require('./commands/list');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Command registration
const registerCommands = async () => {
    const commands = [addCommand.data, deleteCommand.data, listCommand.data];
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('슬래시 명령어 등록 중...');
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

// Handling messages
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return;

    const { checkForFilteredWords, maskFilteredWords } = require('./utils/wordFilter');

    const warningData = checkForFilteredWords(message);
    if (warningData) {
        const { words, guildId } = warningData;
        const modifiedMessage = maskFilteredWords(message.content, words);

        const warningMessages = [
            `**[검열]** 조사 결과 반역자는 해당 단어를 일상 생활에서 사용한 것으로 밝혀졌습니다. 사용에 주의하세요. ⛔\n`,
            `**[검열]** 메시지에서 당국의 주목을 끌 수 있는 단어가 감지되었습니다. 🇸🇪\n`,
            `**[검열]** 통제된 민주주의 체제에 반하는 내용은 검열됩니다. 👊\n`
        ];

        const randomWarning = warningMessages[Math.floor(Math.random() * warningMessages.length)];

        await message.reply({
            content: `${randomWarning}\n ${message.author}: ${modifiedMessage}`
        });

        await message.delete();
    }
});

// Handling interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === '반역단어등록') {
        await addCommand.execute(interaction);
    } else if (interaction.commandName === '반역단어삭제') {
        await deleteCommand.execute(interaction);
    } else if (interaction.commandName === '반역단어목록') {
        await listCommand.execute(interaction);
    }
});

// Bot ready event
client.once('ready', () => {
    console.log(`로그인 : ${client.user.tag}`);
});

// Bot login
client.login(process.env.DISCORD_TOKEN);

// Register commands
registerCommands();
