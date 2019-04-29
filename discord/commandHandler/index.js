const spotify = require("../../spotify");

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
                            for (let i = 0; i <  playlist.body.tracks.items.length; i++) {
                                const track =  playlist.body.tracks.items[i].track;

                                message.channel.send(`p!play ${track.name}`);
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
        }
    }
}