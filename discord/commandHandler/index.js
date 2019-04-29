const spotify = require("../../spotify");
const ytdl = require('ytdl-core');

const syntax = "ps!"

function validateURL(str) {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

var servers = []

module.exports = (message) => {
    if(message.content.includes(syntax) && message.content !== syntax){
        const command = message.content.split('!', 2)[1].split(" ", 1)[0];
        const args = message.content.split(" ");
        args.shift();
        switch (command) {
            case 'playlist':
                const url = args[0];
                if(validateURL(url)){
                    if(url.includes('spotify') && url.includes('playlist')){
                        const id = url.split('/').pop();
                        spotify.getPlaylist(id)
                        .then(playlist => {
                            var index = servers.findIndex(s => s.id == message.guild.id);
                            if(index !== -1){
                                for (let i = 0; i <  playlist.body.tracks.items.length; i++) {
                                    const track =  playlist.body.tracks.items[i].track;
                                    servers[index].queue = [...servers[index].queue, track];
                                }
                            } else {
                                servers.push({id: message.guild.id, queue: []});
                                var index = servers.findIndex(s => s.id == message.guild.id);
                                for (let i = 0; i <  playlist.body.tracks.items.length; i++) {
                                    const track =  playlist.body.tracks.items[i].track;
                                    servers[index].queue.push(track);
                                }
                            }                        
                        })
                        .catch(error => {
                            console.log(error)
                        })
                    } else {
                        message.channel.send("Please send a valid spotify playlist URL");
                    }
                } else {
                    message.channel.send("Please enter a valid playlist URL");
                }
            break;
            case 'queue':
                const index = servers.findIndex(s => s.id == message.guild.id);
                var str = "";
                for (let i = 0; i < servers[index].queue.length; i++) {
                    const track = servers[index].queue[i];
                    str += `${track.name} | `
                    track.artists.forEach((artist, index) => {
                        str += `**${artist.name}** `
                        if(index + 1 == track.artists.length){
                            str += "\n";
                        }
                    });
                }
                message.channel.send(str);
            break;
        }
    }
}