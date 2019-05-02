const Discrod = require('discord.js');
const spotify = require("../../spotify");
const ytdl = require('ytdl-core');

const yt = require('youtube-node');
const youtube = new yt();

youtube.setKey("AIzaSyB2awpuMjO1a9v7jyg8ySq09RIcu80grB0");

const syntax = "spotify!"

var servers = []

const validateURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
}

const Play = (connection, message, index) => {

    var str = `${servers[index].items[0].track.name} `;
    var artistsString = ""

    servers[index].items[0].track.artists.forEach(artist => {
        artistsString += `${artist.name} ${servers[index].items[0].track.artists.length > 1 ? "," : ""} `
    });

    str += artistsString;

    var embed = new Discrod.RichEmbed()
    .setAuthor(servers[index].items[0].track.name, "https://developer.spotify.com/assets/branding-guidelines/icon3@2x.png")
    .setThumbnail(servers[index].items[0].track.album.images[0].url)
    .setDescription(`**${servers[index].items[0].track.artists.length > 1 ? "Artists" : "Artist"}:** ${artistsString}`);

    message.channel.send(embed);

    // TODO!!!
    console.log(str)
    youtube.search(str, 2, (error, result) => {
        if (error) {
            console.log(error);
        }
        else {
            servers[index].dispatcher = connection.playStream(ytdl(`https://www.youtube.com/watch?v=${result.items[0].id.videoId}`, {filter: "audioonly"}))
            servers[index].items.shift();
            
            servers[index].dispatcher.on("end", () => {
                if(servers[index].items[0]){
                    Play(connection, message, index);
                } else {
                    connection.disconnect();
                    servers[index].playing = false;
                }
            })
        }
    });
}

module.exports = (message) => {
    if(message.content.includes(syntax) && message.content !== syntax){
        const command = message.content.split('!', 2)[1].split(" ", 1)[0];
        const args = message.content.split(" ");
        args.shift();
        switch (command) {
            case 'playlist':
                switch (args[0]) {
                    case 'set':
                        const url = args[1];
                        if(validateURL(url)){
                            if(url.includes('spotify') && url.includes('playlist')){
                                const id = url.split('/').pop();
                                spotify.getPlaylist(id)
                                .then(playlist => {
                                    var index = servers.findIndex(s => s.id == message.guild.id);
                                    if(index !== -1){
                                        servers[index].queue = playlist.body.tracks.items

                                    } else {
                                        servers.push({id: message.guild.id, items: [], playing: false, dispatcher: null});
                                        var index = servers.findIndex(s => s.id == message.guild.id);
                                        servers[index].items = playlist.body.tracks.items;

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

                    case 'clear':
                        if (index !== -1 && servers[index].queue.length > 1) {
                            servers[index].queue = []
                        } else {
                            message.channel.send("There is no current playlist")
                        }
                    break;
                }
            break;

            case 'player':
                var index = servers.findIndex(s => s.id == message.guild.id);
                if(message.member.voiceChannel){
                    const voiceChannel = message.member.voiceChannel;
                    switch (args[0]) {
                        case 'play':
                            if(servers[index] && servers[index].items.length > 1 && servers[index].playing == false){
                                voiceChannel.join()
                                .then(connection => {
                                    Play(connection, message, index);
                                })
                                .catch(error => {

                                });
                            } else {
                                message.channel.send("There are no songs to play...")
                            }
                            break;
                    
                        // case 'skip':
                        //     if(servers[index] && servers[index].items.length > 1 && servers[index].playing == true){
                        //         servers[index].items.shift();
                        //         voiceChannel.join()
                        //         .then(connection => {
                        //             Play(connection, message, index);
                        //         })
                        //         .catch(error => {

                        //         });
                        //     } else {
                                
                        //     }
                        // break;
                    }
                } else {
                    message.channel.send("You should be inside a voice channel.");
                }
            break;

            case 'queue':
                var index = servers.findIndex(s => s.id == message.guild.id);
                var str = "";
                if(index !== -1 && servers[index].items.length > 1){
                    for (let i = 0; i < servers[index].items.length; i++) {
                        const track = servers[index].items[i].track;
                        str += `${track.name} | `
                        track.artists.forEach((artist, index) => {
                            str += `**${artist.name}** `
                            if(index + 1 == track.artists.length){
                                str += "\n";
                            }
                        });
                    }
                    message.channel.send(str);
                } else {
                    message.channel.send("There is no current queue.")
                }
            break;
        }
    }
}