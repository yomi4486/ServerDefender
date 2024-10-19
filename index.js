const { Client, Collection, Events, GatewayIntentBits, WebSocketShardDestroyRecovery } = require('discord.js');
// 設定ファイルからトークン情報を呼び出し、変数に保存
const { token } = require('./config.json');

// クライアントインスタンスを作成
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers,GatewayIntentBits.GuildVoiceStates]});
const fs = require('fs');
const path = require('path');
// デコード用のモジュールを変数”querystring”に代入
var querystring = require("querystring");

// 絵文字を読み込むためのオブジェクト
const twemojiRegex = require('twemoji-parser/dist/lib/regex').default;

// クライアントオブジェクトが準備OKとなったとき実行
client.once(Events.ClientReady, c => {
    today = new Date();
	console.log("[INFO: " +  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ] "+`${c.user.tag}がログインします。`);
});

client.commands = new Collection();
// commandsフォルダから、.js拡張子のファイルを取得
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// 取得した.jsファイル内の情報から、コマンドと名前をListenner-botに対して設定
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING]  ${filePath} のコマンドには、必要な "data" または "execute" プロパティがありません。`);
	}
}

// コマンドが送られてきた際の処理
client.on(Events.InteractionCreate, async interaction => {
    // コマンドでなかった場合は早期リターン
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
    // 一致するコマンドがなかった場合
	if (!command) {
		console.error(` ${interaction.commandName} というコマンドは存在しません。`);
		return;
	}
	try {
        // コマンドを実行
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'コマンドを実行中にエラーが発生しました！', ephemeral: true });
	}
});

// カタカナをひらがなに統一する関数
function hiraToKana(str) {
    return str.replace(/[\u30a1-\u30f6]/g, function(match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
    });
}

// 全角英数字を半角に変換
function toHalfWidth(str) {
    str = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
    return str;
}

// 保護の状態が有効であった場合にメッセージの削除を行うための関数
function deleteMessage(str){
	// configについての定義
	var config = JSON.parse( 
        fs.readFileSync( 
            path.resolve( __dirname , "./commands/condition.json" ) 
        ) 
    );
    const channelID = str.guild.channels.cache.get(str.channelId)
    if(!(config[channelID] == false)){
        today = new Date();
        console.log("[INFO: " +  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + " ] " + "メッセージを消去しました")
        return str.delete().catch((error) => console.log(error));
    }
    
}

// 半角カタカナを全角カタカナに変換するための関数
function kanaHalfToFull(str) {
    var kanaMap = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・'
    };
    var reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
    return str.replace(reg, function (match) {
        return kanaMap[match];
    }).replace(/ﾞ/g, '゛').replace(/ﾟ/g, '゜');
};

// 全角の記号、文字を半角に、半角カタカナを全角に戻す、特殊記号やEmoji、スペース、改行を除外する関数
function kigoukesu(str,emoji){
    return str.replace('ω','').replace('『','').replace('』','').replace('〔','').replace('〕','').replace('•','').replace('【','').replace('】','').replace('｛','').replace('｝','').replace('Å','').replace('‥','').replace('〜','').replace('．','').replace('￥','').replace('\\ ','').replace('。','').replace('l','').replace('I','').replace('、','').replace('.','').replace('！','!').replace('!','').replace(',','').replace('?','').replace(' ','').replace('　','').replace('\n','').replace('・','').replace('…','').replace('；',';').replace(';','').replace('＠','@').replace('@','').replace('ﾀﾋ','死').replace('ー','-').replace('-','').replace('：',':').replace(':','').replace('｜','|').replace('|','').replace('＾','^').replace('^','').replace('¥','').replace('[','').replace(']','').replace('{','').replace('}','').replace('"','').replace('”','').replace('珍','ちん').replace('％','%').replace('%','').replace('ㅗ','').replace('国際','こくさい').replace('血','ち').replace('’','').replace('ㄴ','').replace('「','').replace('」','').replace('＆','&').replace('&','').replace('｀','`').replace('`','').replace('~','').replace('／','/').replace('/','').replace('＃','#').replace('#','').replace('＋','+').replace('+','').replace('＊','*').replace('*','').replace('ㅛ','').replace('↓','').replace('＿','').replace('＜','').replace('＞','').replace('(','').replace(')','').replace("'","").replace('‘','').replace('’','').replace('≒','').replace(emoji,'').replace('≠','').replace('»','').replace('≡','').replace('✔','').replace('♀','').replace('ㅤ',''); 
}

// 文字をデコードするための関数
function decode(str){
    return querystring.unescape(str);
}

// 分けて送信した縦読みに対する処理



// NGワードの定義を行う。ここに書く文字はひらがな、小文字
var NG_words = /|test|example|/

// バラバラに送信してごまかすバカもいるので対策
var tateyomi_str = ''
function tateyomi(str,message){
    tateyomi_str = tateyomi_str + str
    if(tateyomi_str.match(NG_words)){
        tateyomi_str = ''
        return deleteMessage(message);
    }
}

client.on('messageCreate', async (message) => {
        
        const mathEmojis = message.content.match(twemojiRegex);
        
        if(kanaHalfToFull(toHalfWidth(hiraToKana(kigoukesu(message.content,mathEmojis)).toLowerCase())) === 'しね'){
            deleteMessage(message);
        }

        // わざわざ文字をエンコードして下ネタを送るバカがいるのでここで対策
        if (decode(message.content).match(NG_words)) {
            // メッセージを削除する
            deleteMessage(message);
            return;
        }
        
        while(message.content !== str) {
            var str = message.content
            // 全角の記号、文字を半角に、半角カタカナを全角に戻す、特殊記号やEmoji、スペース、改行を除外
            message.content = kanaHalfToFull(toHalfWidth(hiraToKana(kigoukesu(message.content,mathEmojis)).toLowerCase()))
        }
        // 上記処理を施したうえでNGワード含まれていないか問題がないかを評価
        if (str.match(NG_words)) {
                // 上記チェックで引っかかった場合にまず一度メッセージを削除する
                deleteMessage(message);
        } else {
            tateyomi(str,message);
        }

});

// メッセージが編集されたとき、編集済みのメッセージに不適切な表現があった場合にも削除。
client.on('messageUpdate', async (oldMessage,newMessage) => {
    if (oldMessage.content === newMessage.content) {
        return; //内容の変更がなかった場合はリソースの無駄なので早期リターン
    }
    const mathEmojis = newMessage.content.match(twemojiRegex);
    
    if(kanaHalfToFull(toHalfWidth(hiraToKana(kigoukesu(newMessage.content,mathEmojis)).toLowerCase())) === 'しね'){
        newMessage.delete();
    }
    // わざわざ文字をエンコードして下ネタを送るバカがいるのでここで対策
    if (decode(newMessage.content).match(NG_words)) {
        // 上記チェックで引っかかった場合にまず一度メッセージを削除する
        deleteMessage(newMessage);
    }
    while(newMessage.content !== str) {
        var str = newMessage.content
        // 全角の記号、文字を半角に、半角カタカナを全角に戻す、特殊記号やEmoji、スペース、改行を除外
        newMessage.content = kanaHalfToFull(toHalfWidth(hiraToKana(kigoukesu(newMessage.content,mathEmojis)).toLowerCase()))
    }
    // 上記処理を施したうえでNGワード含まれていないか問題がないかを評価
    if (str.match(NG_words)) {
        // 上記チェックで引っかかった場合にまず一度メッセージを削除する
        deleteMessage(newMessage);
        return; 
    }
});

// ログイン
client.login(token);