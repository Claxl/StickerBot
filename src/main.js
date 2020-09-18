const {
  create,
  Client,
  decryptMedia
} = require("@open-wa/wa-automate");
const request = require('request');
const fs = require('fs');

create().then((client) => start(client));
class stickers {
	  constructor(){
		  this._id = "";
		  this._url = [];
		  this._usedUrl = [];
	  }
	  set Id(id){
		this._id = id;
	  }
	  get Id(){return this._id;}
	  set url(url){
		  this._url.push( url);
	  }
	  get url(){return this._url;}
	  set usedUrl(url){
		  this._usedUrl.push(url);
	  }
	  get usedUrl(){return this._usedUrl;}
}
stick = new Array();
for(var k = 0;k<50;k++){
	stick[k] = new stickers();
}
var check = 1;
var i = 0;
var indexGroup = 0;
var url;
var index;
var sticker = 0;
function idSearch(id,index){
	if(index===0)	return false;
	for(var i = 0;i<index;i++){
		if(stick[i].id === id){	return i;}
	}
	return false;
}
async function start(client) {
	client.onMessage(async message => {
		console.log("================================ DEBUG ===============================");
		console.log(message.chatId);
		if(message.isGroupMsg ===false){
			var ID = idSearch(message.chatId,i);
			console.log(ID);
			if((ID=== false)||(ID === message.Id)){
				index = ID;
				if(index === false){ 
					index = 0;
					console.log(index);
				}
				stick[i].id = message.chatId;
				console.log(stick[i].id);
				i++;
			}
		}
		console.log(message.type);
		console.log("=============================END====================================");
		check = 1;
		if((message.body ==="!Guida")||(message.body==="!guida")){
			console.log("Guida");
			client.sendText(message.from,'Collegati al sito https://giphy.com/ \n\nScegli la gif da te preferita\n\nTieni premuto e clicca "Condividi" Se ti trovi su safari\nTieni premuto e clicca "immagine in altra scheda"  Se ti trovi su chrome\n\nPoi invia quel link');
			client.sendText(message.from,"https://youtu.be/aGc8Po8G0Bo  \n\n\nEcco a te una piccola videoguida per safari\n");
			client.sendText(message.from,"https://youtu.be/YBe_7KzvQ_g \n\n\nEcco a te una piccola videoguida per chrome\n");
			client.sendText(message.from,"Se invece vuoi uno sticker statico, manda una foto\n\nN.B. potrebbe prendere solo la parte centrale della foto");
			check = 0;
		}
		if((message.body === "!Creator")||(message.body==="!creator")){
			console.log("Creator");
			client.sendText(message.from,"https://www.instagram.com/whataboutclaxl/ \n\n\n https://github.com/Claxl \n\n\nContattami per qualsiasi problema sul bot, se vuoi contribuire alla sua crescita");
			check = 0;
		}
		if((sticker === 1)&& (message.body.charAt(5)=== ":")){
			client.sendGiphyAsSticker(message.from,message.body);
			client.sendText(message.from,"Tutto ok! Attendi un attimo");
			sticker = 0;
			check = 0;
		}
		if(message.body==="!url"){
			console.log(stick[index].usedUrl);
			for(var k = 0 ; k< stick[index].usedUrl.length;k++){
				client.sendText(message.from,(k+1)+"\t"+stick[index].usedUrl[k]);
			}
			//client.sendText(message.from,+stick[index].usedUrl);
			client.sendText(message.from,"Inviami il link inerente alla gif che non ha funzionato e provvederò a reinviarla");
			sticker = 1;
			check = 0;
		}
		if (message.body.charAt(5)=== ":"){
			console.log(message.body);
			var withNoDigits = message.body.replace(/\d+/, '');
			console.log(withNoDigits);
			if(client.sendGiphyAsSticker(message.from,withNoDigits)){
				console.log("SUCCESS");
				client.sendText(message.from,"Tutto ok! Attendi un attimo");
				client.sendText(message.from,"Se non dovesse arrivare entro un paio di secondi la gif sarà di dimensioni troppo grandi riprovare con un'altra");
			}else{
				console.log("FAIL");
				client.sendText(message.from,"Fallito l'invio, riprovare");
			}
			check = 0;
		}
		if ((message.mimetype)&&(message.isGroupMsg ===false)) {
			if ( message.type === "image") {
				const mediaData = await decryptMedia(message);
				const imageBase64 = `data:${message.mimetype};base64,${mediaData.toString("base64")}`;
				client.sendText(message.from,"Grazie per l'immagine sta arrivando il tuo sticker fresco fresco!");
				await client.sendImageAsSticker(message.from, imageBase64);
			}
			if ( (message.type === "video")&&(message.duration < 15)) {
				const mediaData = await decryptMedia(message);
				const filename = "prova.mp4";
				fs.writeFile(filename, mediaData, (err) => {
					if (err) throw err;
					console.log('The file has been saved!');
					var postData={
						api_key: "zjlFTId5PXa6u3xQQAWB6RqTKqsOYiVI",
						file:{
							value : fs.createReadStream("prova.mp4"),
							options:{
								filename: "prova.mp4",
								contentType: ".mp4"
							}
						},
					};
					var options={
						url:'https://upload.giphy.com/v1/gifs?api_key='+postData.api_key,
						formData: postData,
						json:true
					};
					check = 0;
					console.log("upload via "+options.url);
					const p = new Promise((resolve,reject)=>{
						request.post(options,function(e,resp,body){
							if(e||resp.statusCode!==200) console.log("giphy upload failed : " + e);
							url= "https://media.giphy.com/media/"+body.data.id+"/giphy.gif";
							console.log("UPLOADED");
							//var index = idSearch(message.from,i);
							stick[index].url = url;
							client.sendText(message.from,"Ho preso in carico il tuo video/gif se ci dovesserò essere errori nella ricezione, usa il comando !url");
							client.sendText(message.from,"Resta in attesa il tuo sticker sta arrivando");
							setTimeout(function(){		
								client.sendGiphyAsSticker(message.from, stick[index].url[0]);
								console.log(stick[index].url);
								stick[index].usedUrl = stick[index].url[0];
								stick[index].url.splice(stick[index].url[0], 1);
								console.log(stick[index].url);
								client.sendText(message.from,"Ecco a te il tuo sticker");
								console.log("INVIATO");
								},50000)
						});
					});
				});
				console.log("DONE");
			}
			check = 0;
		}
		if ((message.body === 'Ciao')||(message.body === 'ciao')) {
		  client.sendText(message.from, "Ciao, benvenuto.🔥🔥\n\nUsa il comando !comandi (o !Comandi), per sapere tutto ciò che puoi fare\n");
		}else{
			if(((message.type==="chat")&&(check === 1 ))||(message.data==="!comandi")||(message.data === "!Comandi")){
				client.sendText(message.from,"I comandi sono i seguenti : \n\n!Guida (o !guida):\nScrivi questo per le guide sui due maggiori browser per sapere come fare\n\n!Creator (o !creator)");
				console.log("Comandi");	
			}
		}
	});
    client.onIncomingCall(async call=>{
        await client.sendText(call.peerJid._serialized, 'Mi dispiace ma niente chiamate');
		client.contactBlock(call.peerJid);
    });
}

