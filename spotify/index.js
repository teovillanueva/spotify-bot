const spotifyWebApi = require('spotify-web-api-node');

const spotify = new spotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

spotify.clientCredentialsGrant()
.then((data) => {
    spotify.setAccessToken(data.body['access_token']);
}, (error) => {
    console.log(error);
});

setInterval(() => {
    spotify.clientCredentialsGrant()
    .then((data) => {
        spotify.setAccessToken(data.body['access_token']);
    }, (error) => {
        console.log(error);
    });
}, 3600 * 60);

// playlist.body.tracks.items[0].track.name

module.exports = spotify;