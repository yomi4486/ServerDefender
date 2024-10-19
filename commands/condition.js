// SlashCommandBuilder という部品を discord.js からインポートしています。
// これにより、スラッシュコマンドを簡単に構築できます。
const { SlashCommandBuilder } = require('discord.js');

var fs = require('fs');
var path = require('path');

// 以下の形式にすることで、他のファイルでインポートして使用できるようになります。

module.exports = {
	data: new SlashCommandBuilder()
		.setName('condition')
		.setDescription('このテキストチャンネルにおける保護の状態を確認します。'),
	execute: async function(interaction) {
		// DMでこのコマンドが実行された場合は処理を行わない
		if(interaction.guild){
			const channelID = interaction.guild.channels.cache.get(interaction.channelId)

			// configについての定義
			var config = JSON.parse( 
			  fs.readFileSync( 
				path.resolve( __dirname , "condition.json" ) 
			  ) 
			);
			if(config[channelID] == false){
				await interaction.reply('「#' + channelID.name + '」における保護は、現在無効です。');
			} else {
				await interaction.reply('「#' + channelID.name + '」における保護は、現在有効です。');
			}
		} else {
			await interaction.reply('### このコマンドはDMでは使用できません！\nサーバーへの追加はこちら: https://discord.com/oauth2/authorize?client_id=1177480062841397298&permissions=206848&scope=bot%20applications.commands');
		}
	},
};


// module.exportsの補足
// キー・バリューの連想配列のような形で構成されています。
//
// module.exports = {
//    キー: バリュー,
//    キー: バリュー,
// };
//