// SlashCommandBuilderをdiscord.jsからインポート
const { SlashCommandBuilder,PermissionsBitField} = require('discord.js');
//以下の形式にすることで、他のファイルでインポートして使用可能。

var fs = require('fs');
var path = require('path');

module.exports = {	
	data: new SlashCommandBuilder()
		.setName('enable')
		.setDescription('このテキストチャンネルにおける保護を有効にします（デフォルトは有効です）'),
	execute: async function(interaction) {
		// DMでこのコマンドが実行された場合は処理を行わない
		if(interaction.guild){
			if(!interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator)){
				await interaction.reply('あなたは管理者権限がないためこのコマンドを実行できません！');
			} else {
				const channelID = interaction.guild.channels.cache.get(interaction.channelId)
				// configについての定義
				var config = JSON.parse( 
				  fs.readFileSync( 
					path.resolve( __dirname , "condition.json" ) 
				  ) 
				);

				if(config[channelID] == true || !(channelID in config)){
					await interaction.reply('「#' + channelID.name + '」における保護は、すでに有効になっています。');
				} else {
					await interaction.reply('「#' + channelID.name + '」における保護を有効にしました');
					today = new Date();
					console.log("[INFO: " +  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ] #" + channelID.name+ "における保護が有効になりました")
				}

				var data= {
					[channelID] : true
				}
				if (!(channelID in config) || config[channelID]==false){
					config[channelID] = data[channelID];
				}
				fs.writeFileSync(
					path.resolve( __dirname , "condition.json" ),
					JSON.stringify(config,null,'  '), 
					"utf-8"
				);
			}
		} else {
			await interaction.reply('### このコマンドはDMでは使用できません！\nサーバーへの追加はこちら: https://discord.com/oauth2/authorize?client_id=1177480062841397298&permissions=206848&scope=bot%20applications.commands');
		}
	},
};

// module.exportsの補足
// キー・バリューの連想配列のような形で構成
//
// module.exports = {
//    キー: バリュー,
//    キー: バリュー,
// };
//