window.onSpotifyWebPlaybackSDKReady = () => {
    const token = 'BQAKgBxvPdPkrsDZ5FMOvpFxSXUSDBXLgT0UNRRMc99nbtEw5h1pGLI7CinaOC7ZHBTwvFfDr-fsdSwPxr7RPQX7LJl5z83AxVYrBJh2zNKB6SFX9OdCKDTBCf8uB7qsQGEzp7JUbgzV4R-frxMwsB5wWbmRTE7enzzY';
    const player = new Spotify.Player({
        name: 'Firetail',
        getOAuthToken: cb => {cb(token);}
    })
    player.addListener('initialization_error', ({message}) => {
        console.error(message);
    });
    player.addListener('authentication_error', ({message}) => {
        console.error(message);
    });
    player.addListener('account_error', ({message}) => {
        console.error(message);
    });
    player.addListener('playback_error', ({message}) => {
        console.error(message);
    });

    player.addListener('player_state_changed', state => {
        console.log(state);
        let currentSong = state.track_window.current_track;
        document.querySelector('#song').textContent = `${currentSong.name} by ${currentSong.artists[0].name}`
    });

    player.addListener('ready', ({device_id}) => {
        console.log('Ready. Device ID:', device_id);
    })

    player.addListener('not-ready', ({device_id}) => {
        console.log('Device has gone offline:', device_id)
    })

    player.connect();

    let next = document.querySelector('#next');
    next.addEventListener('click', () => {
        player.nextTrack().then(() => {
            console.log('Skipped a track');
        })
    })
    let prev = document.querySelector('#prev');
    prev.addEventListener('click', () => {
        player.previousTrack().then(() => {
            console.log('Set to previous track');
        })
    })
}