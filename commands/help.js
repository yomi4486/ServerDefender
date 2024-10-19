// SlashCommandBuilder という部品を discord.js からインポートしています。
// これにより、スラッシュコマンドを簡単に構築できます。
const { SlashCommandBuilder } = require('discord.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('このBotの使い方は？'),
	execute: async function(interaction) {
		if(interaction.guild){
			await interaction.reply('このBotは参加したテキストチャンネルで不適切な発言があった場合に削除を行います。\n(Botがサーバーに参加した瞬間から保護は始まります)\n`/disable`コマンドを打つと、そのチャンネルにおいての保護を無効にします。`/enable`コマンドで、再度有効化にできます。\n現在の保護の状態を確認したい場合は、`/condition`コマンドを使用してください。');
		} else {
			// DMでhelpコマンドが実行された場合は宣伝もしとく
			await interaction.reply('このBotは参加したテキストチャンネルで不適切な発言があった場合に削除を行います。\n(Botがサーバーに参加した瞬間から保護は始まります)\n`/disable`コマンドを打つと、そのチャンネルにおいての保護を無効にします。`/enable`コマンドで、再度有効化にできます。\n現在の保護の状態を確認したい場合は、`/condition`コマンドを使用してください。\n\nサーバーへの追加はこちら: https://discord.com/oauth2/authorize?client_id=1177480062841397298&permissions=206848&scope=bot%20applications.commands');
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