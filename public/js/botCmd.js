window.gameQueue=[];
var botCmd={
    "spinWheel":function(args,tag,channel){
        this.variable("wheelContainer").style.display="block";
        streamOverlay.wheel.spin();
    },
    "showWheel":function(args,tag,channel){
        this.variable("wheelContainer").style.display="block";
    },
    "sayHello":function(args,tag,channel){
        sayHello(voiceHello);
        let s=JSON.stringify(voiceHello);
        let result= bot.writeFile("./tmp/voiceHello.json", s);
        bot.message(`/me j'ai dit bonjour à tout le monde`);
        console.dir(voiceHello);
    },
    "getClip":function(args,tag,channel){
        console.log(channel)
                this.variable("twitchQuery").execQuery("getLastClip",{broadcaster:channel.slice(1)},(data)=>{
            console.dir(data[0]);
                    let url=data[0].embed_url+"&parent=127.0.0.1";
            this.variable("clipDiffuse").call(this,url,data[0].duration);
        })
    },
    "getDiscord":function(agrs,tag,channel){
        if (tag.username != channel.substring(1)) {
            bot.message(`/me vous n'avez pas accès à cette commande`);
            return;
        }
       // console.dir(bot.messages);
        bot.message("/me retrouvez mon discord : https://discord.gg/7rseSrxsvY");
        bot.messages[0].byPass=true;
        console.dir(bot.messages);
    },
    "setLiveName":function(args,tag,channel){
        if (tag.username != channel.substring(1)) {
            bot.message(`/me vous n'avez pas accès à cette commande`);
            return;
        }else{
            bot.readFile("../info.json", function (msg) {
               
                let liveInfo=JSON.parse(msg);
                liveInfo["liveName"]=args.join(" ");
                let s=JSON.stringify(liveInfo);
               let result= bot.writeFile("../info.json", s);
                bot.message(`/me Le nom du projet a changé`);
            })
        }
    },
    "setLiveInfo":function(args,tag,channel){
        if (tag.username != channel.substring(1)) {
            bot.message(`/me vous n'avez pas accès à cette commande`);
            return;
        }else{
            bot.readFile("../info.json", function (msg) {
               
                let liveInfo=JSON.parse(msg);
                liveInfo["jeux"]=args.join(" ");
                let s=JSON.stringify(liveInfo);
               let result= bot.writeFile("../info.json", s);
                bot.message(`/me Le nom du projet a changé`);
            })
        }
    },
    "getChannelInfo":function (args, tag, channel) {
        if (tag.username != channel.substring(1)) {
            bot.message(`/me vous n'avez pas accès à cette commande`);
            return;
        }
        bot.readFile("tmp/chaine.txt", function (msg) {
            bot.message(`/me ${msg}`);
        })

    },
    "setGameInfo":function (args, tag, channel) {
        bot.readFile("tmp/game.json", function (data) {
            var lib = JSON.parse(data);
            
            if (lib[CurrentChannel][args] != undefined) {
                game = lib[CurrentChannel][args];
                bot.message(`/me le jeu ${args} a été paramètré`);
            } else
                bot.message(`/me ${args} le jeu n'existe pas dans la liste`)
        });

    },
    "joinQueue":function (arg, tag, channel) {
        //     debugger
        if (!window.gameQueue.includes(tag.username)) {
            window.gameQueue.push(tag.username);
            this.message("/me @" + tag.username + " rejoint la file d'attente");
            this.writeFile("tmp/queue.json", JSON.stringify(window.gameQueue));
            this.variable("setQueue").call();
        } else {
            this.message("/me @" + tag.username + " tu es déjà dans la file d'attente");
        }
    },
    "leaveQueue":function (arg, tag, channel) {
        // debugger
        const indexElement = queue.indexOf(tag.username);
        queue.splice(indexElement, 1);
        bot.message("/me  @" + tag.username + " quitte la file d'attente");
        bot.writeFile("tmp/queue.json", JSON.stringify(queue));
        setQueue();
    },
    "resetQueue": function (arg, tag, channel) {
        //     debugger
        if (tag.username == "d4rkh0und") {
            queue = [];
            bot.message("/me la file d'attente d'attente a été réinitialisée");
            bot.writeFile("tmp/queue.json", JSON.stringify(queue));
            setQueue();
        }
    },
    "getGameInfo":function (arg, tag, channel) {
        let m = (game != undefined) ? `/me ${game.name} est un jeu ${game.editeur} sortie en ${game.sortie}` : `/me il n'y a pas de jeu paramètré`
        bot.message(m);
    }
}