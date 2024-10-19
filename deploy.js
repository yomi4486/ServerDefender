//RESTとRoutesをdiscord.jsパッケージからインポート
const { REST, Routes } = require('discord.js');

const disableFile = require('./commands/disable.js');
const enableFile = require('./commands/enable.js');
const helpFile = require('./commands/help.js');
const conditionFile = require('./commands/condition.js');

// 環境変数としてapplicationId, tokenの呼び出し
const { applicationId, token } = require('./config.json');

// 登録コマンドを呼び出してリスト形式で登録
const commands = [helpFile.data.toJSON(),
                  enableFile.data.toJSON(),
                  disableFile.data.toJSON(),
                  conditionFile.data.toJSON(),
                 ];


// DiscordのAPIには現在最新のversion10を指定
const rest = new REST({ version: '10' }).setToken(token);

// Discordサーバーにコマンドを登録
(async () => {
    try {
        await rest.put(
			Routes.applicationCommands(applicationId),
			{ body: commands },
		);
        console.log('Discordにコマンドが登録されました！');
    } catch (error) {
        console.error('コマンドの登録中にエラーが発生しました:', error);
    }
})();