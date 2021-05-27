const params = new URLSearchParams(window.location.search);
window.onSpotifyWebPlaybackSDKReady = () => {
    if (!window.navigator.requestMediaKeySystemAccess) {
        console.log('Unable to request for DRM... assuming unavailable.');
        document.querySelector('.missing-widevine').style.display = 'block'
        document.querySelector('.init-msg').style.display = 'none'
    } else {
        navigator.requestMediaKeySystemAccess('com.widevine.alpha', [{
            "initDataTypes": ["cenc"],
            "audioCapabilities": [{
                "contentType": "audio/mp4;codecs=\"mp4a.40.2\""
            }],
            "videoCapabilities": [{
                "contentType": "video/mp4;codecs=\"avc1.42E01E\""
            }]
        }]).then(() => {
            if (localStorage.getItem('sp-token')) {
                startPlayer();
            } else {
                if (params.get('code') && params.get('state')) {
                    if (sessionStorage.getItem('temp-state') != params.get('state')) return console.error('Invalid state!')
                    requestToken('code', true, params.get('code'));
                    let spliturl = location.href.split('?')
                    history.replaceState({}, null, spliturl[0])
                    sessionStorage.removeItem('code-verifier');
                    sessionStorage.removeItem('temp-state');
                } else {
                    document.querySelector('.login').style.display = 'block'
                    document.querySelector('.init-msg').style.display = 'none'
                }
            }
        }).catch(err => {
            console.log('Could not find DRM');
            document.querySelector('.missing-widevine').style.display = 'block'
            document.querySelector('.init-msg').style.display = 'none'
        })
    }
}

let isRequestingToken = false;

let requestToken = async (type, createPlayer, code) => {
    let query;
    if (type == 'code') {
        let spliturl = location.href.split('?')
        query = new URLSearchParams({
            'client_id': '33b8b67edb3d4057acf6c21dce334c65',
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': spliturl[0],
            'code_verifier': sessionStorage.getItem('code-verifier')
        })
    } else if (type == 'refresh') {
        query = new URLSearchParams({
            'client_id': '33b8b67edb3d4057acf6c21dce334c65',
            'grant_type': 'refresh_token',
            'refresh_token': localStorage.getItem('refresh-token')
        })
    }
    fetch(`https://accounts.spotify.com/api/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: query.toString()
    }).then(async resp => {
        let parsedResp = await resp.json();
        if (parsedResp.error) return console.log(parsedResp)
        localStorage.setItem('sp-token', parsedResp.access_token);
        if (parsedResp.refresh_token) {
            localStorage.setItem('refresh-token', parsedResp.refresh_token);
        }
        localStorage.setItem('expires', Date.parse(new Date()) + (parsedResp.expires_in * 1000));
        if (createPlayer) {
            startPlayer();
        }
    })
}

setInterval(() => {
    const expires = localStorage.getItem('expires')
    if (expires) {
        if (new Date() > expires && !isRequestingToken) {
            isRequestingToken = true
            requestToken('refresh', false)
        }
    }
}, 1000)

let sendRequest = async (endpoint, method, type, data) => {
    const base = 'https://api.spotify.com/v1/'
    const token = localStorage.getItem('sp-token');
    let options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }
    if (method) options.method = method
    let urlFormat = `${base}${endpoint}`;
    if (type == 'body' && data) options['body'] = data
    if (type == 'query' && data) {
        const querys = new URLSearchParams(data).toString();
        urlFormat += `?${querys}`
    }
    let resp = await fetch(urlFormat, options);
    let respData = await resp.json();
    return respData;
}

let randomString = length => {
    let text = ''
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return text
}

document.querySelector('#login').addEventListener('click', async () => {
    const random = randomString(99);
    const buffer = new TextEncoder().encode(random);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const codeChallenge = btoa(String.fromCharCode.apply(null, new Uint8Array(hashBuffer))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const state = randomString(20);
    sessionStorage.setItem('temp-state', state);
    sessionStorage.setItem('code-verifier', random);
    let redirect = encodeURIComponent(location.href)
    window.location.href = `https://accounts.spotify.com/authorize?client_id=33b8b67edb3d4057acf6c21dce334c65&response_type=code&redirect_uri=${redirect}&code_challenge_method=S256&code_challenge=${codeChallenge}&state=${state}&scope=streaming%20user-read-email%20user-modify-playback-state%20user-read-private%20user-library-read%20user-follow-read%20playlist-read-private&show_dialog=true`
})

let logout = () => {
    localStorage.removeItem('sp-token');
    localStorage.removeItem('expires-in');
    localStorage.removeItem('refresh-token')
    location.reload();
}

let timeFormat = s => {
    if (isNaN(s)) return '-:--'
    let min = Math.floor(s / 60);
    let sec = Math.floor(s - (min * 60));
    if (sec < 10){ 
        sec = `0${sec}`;
    }
    return `${min}:${sec}`;
}

let player;
let currentState;

const songItem = Vue.component('song-item', {
    props: ['song'],
    template: '<div @click="newContext" :class="isActive" class="song"><img :style="isArtUsable" :src="song.image"/>{{ song.name }}</div>',
    computed: {
        isActive() {
            if (this.$vnode.key == this.$root.activeSongURI) {
                console.log(this)
                return 'active'
            } else {
                return ''
            }
        },
        isArtUsable() {
            if (!this.song.image) return 'display: none'
            else return ''
        },
        available() {
            if (!this.song.available) return 'unavailable'
            else return ''
        }
    },
    methods: {
        newContext() {
            let data = {
                offset: {
                    position: this.song.index
                },
                position_ms: 0
            }
            if (!vueStuff.uris) {
                data['context_uri'] = this.$root.selectedContext
            } else {
                data['uris'] = vueStuff.uris
            }
            console.log(data)
            data = JSON.stringify(data)
            sendRequest(`me/player/play?device_id=${player._options.id}`, 'PUT', 'body', data)
        }
    }
})

const albumImg = Vue.component('album-img', {
    props: ['url'],
    template: '<img class="album-img" alt="No image available" :src="url"/>'
})

const playlistOption = Vue.component('playlist-option', {
    props: ['playlist'],
    template: '<option value="playlist.id">{{playlist.name}}</option>'
})

let vueStuff = new Vue({
    data: {
        songs: [],
        playlists: [],
        selectedPlaylist: null,
        selectedContext: null,
        activeSongURI: '',
        albumArt: '',
        currentPlaylistSize: 0,
        selectedListType: 'playlistsLink',
        songItemAlbumArt: null,
        selectedIndex: 0,
        uris: null
    },
    methods: {
        updateArtist(evt) {
            sendRequest(`artists/${this.selectedPlaylist}/top-tracks`, 'GET', 'query', {market: country}).then(tracks => {
                console.log(tracks)
                if (evt) {
                    evt.target.textContent = 'Load more tracks'
                } else {
                    vueStuff.currentPlaylistSize = tracks.length
                }
                const currentSongLength = this.songs.length
                tracks.tracks.forEach((song, i) => {
                    this.songs.push({
                        name: `${song.album.name} - ${song.name}`,
                        id: song.uri,
                        image: song.album.images[2].url,
                        index: currentSongLength + i
                    })
                    this.uris.push(song.uri)
                })
            })
        },
        updateAlbum(evt) {
            sendRequest(`albums/${this.selectedPlaylist}/tracks`, 'GET', 'query', {limit: 50, offset: this.songs.length}).then(tracks => {
                console.log(tracks)
                if (evt) {
                    evt.target.textContent = 'Load more tracks'
                } else {
                    vueStuff.currentPlaylistSize = tracks.total
                }
                const currentSongLength = this.songs.length
                tracks.items.forEach((song, i) => {
                    this.songs.push({
                        name: `${song.artists[0].name} - ${song.name}`,
                        id: song.uri,
                        image: null,
                        index: currentSongLength + i
                    })
                })
            })
        },
        updatePlaylistItm(evt) {
            sendRequest(`playlists/${this.selectedPlaylist}/tracks`, 'GET', 'query', {limit: 100, offset: this.songs.length}).then(tracks => {
                if (evt) {
                    evt.target.textContent = 'Load more tracks'
                } else {
                    vueStuff.currentPlaylistSize = tracks.total
                }
                const currentSongLength = this.songs.length
                tracks.items.forEach((song, i) => {
                    this.songs.push({
                        name: `${song.track.artists[0].name} - ${song.track.name}`,
                        id: song.track.uri,
                        image: song.track.album.images[2].url,
                        index: currentSongLength + i
                    })
                })
            })
        },
        updateLikedItm(evt) {
            sendRequest(`me/tracks`, 'GET', 'query', {limit: 50, offset: this.songs.length}).then(tracks => {
                if (evt) {
                    evt.target.textContent = 'Load more tracks'
                } else {
                    vueStuff.currentPlaylistSize = tracks.total
                }
                const currentSongLength = this.songs.length
                console.log(tracks)
                tracks.items.forEach((song, i) => {
                    this.songs.push({
                        name: `${song.track.artists[0].name} - ${song.track.name}`,
                        id: song.track.uri,
                        image: song.track.album.images[2].url,
                        index: currentSongLength + i
                    })
                    this.uris.push(song.track.uri)
                })
            })
        },
        updateSongs(evt) {
            this.songs = []
            switch(this.selectedListType) {
                case "playlistsLink":
                    this.uris = null
                    this.updatePlaylistItm()
                break;
                case "albumsLink":
                    this.uris = null
                    this.updateAlbum()
                break;
                case "artistsLink":
                    this.uris = []
                    this.updateArtist()
                break;
                case "likedLink":
                    this.uris = []
                    this.updateLikedItm()
                break;
            }
        },
        updatePlaylist(evt) {
            this.selectedPlaylist = evt.target.value
            switch(this.selectedListType) {
                case "playlistsLink":
                    this.selectedContext = `spotify:playlist:${evt.target.value}`
                    break;
                case "albumsLink":
                    this.selectedContext = `spotify:album:${evt.target.value}`
                    break;
                case "artistsLink":
                    this.selectedContext = `spotify:artist:${evt.target.value}`
                    break;
                case "likedLink":
                    this.selectedContext = `spotify:user:${user.id}:collection`
            }
            this.selectedIndex = 0
        },
        loadMoreTracks(evt) {
            evt.target.textContent = 'Loading...'
            switch(this.selectedListType) {
                case "playlistsLink":
                    this.updatePlaylistItm(evt)
                break;
                case "albumsLink":
                    this.updateAlbum(evt)
                break;
                case "artistsLink":
                    this.updateArtist(evt)
                break;
                case "likedLink":
                    this.updateLikedItm(evt)
            }
        },
        updateListType() {
            this.playlists = []
            this.selectedPlaylist = null
            this.selectedContext = null
            switch(this.selectedListType) {
                case "playlistsLink":
                    sendRequest('me/playlists', 'GET', 'query', {limit: 50}).then(data => {
                        data.items.forEach(playlist => {
                            if (!vueStuff.selectedPlaylist) vueStuff.selectedPlaylist = playlist.id
                            if (!vueStuff.selectedContext) vueStuff.selectedContext = playlist.uri
                            vueStuff.currentPlaylistSize = playlist.tracks.total
                            vueStuff.playlists.push({
                                name: playlist.name,
                                id: playlist.id
                            })
                        })
                    })
                break;
                case "likedLink":
                    vueStuff.selectedPlaylist = 'liked'
                    vueStuff.selectedContext = `spotify:user:${user.id}:collection`
                break;
                case "albumsLink":
                    sendRequest('me/albums', 'GET', 'query', {limit: 50}).then(data => {
                        console.log(data)
                        data.items.forEach(album => {
                            album = album.album
                            if (!vueStuff.selectedPlaylist) vueStuff.selectedPlaylist = album.id
                            if (!vueStuff.selectedContext) vueStuff.selectedContext = album.uri
                            vueStuff.currentPlaylistSize = album.total
                            vueStuff.playlists.push({
                                name: album.name,
                                id: album.id,
                                albumArt: album.images[2].url
                            })
                        })
                    })
                break;
                case "artistsLink":
                    sendRequest('me/following', 'GET', 'query', {type: 'artist', limit: 50}).then(data => {
                        console.log(data)
                        data.artists.items.forEach(artist => {
                            if (!vueStuff.selectedPlaylist) vueStuff.selectedPlaylist = artist.id
                            if (!vueStuff.selectedContext) vueStuff.selectedContext = artist.uri
                            vueStuff.currentPlaylistSize = data.total
                            vueStuff.playlists.push({
                                name: artist.name,
                                id: artist.id
                            })
                        })
                    })
            }
        },
        selectNewList(evt) {
            document.querySelectorAll('.list-options h3').forEach(item => {
                item.classList.remove('active')
            })
            evt.target.classList.add('active')
            this.selectedListType = evt.target.id
        }
    },
    computed: {
        displayShowMore() {
            if (this.currentPlaylistSize > this.songs.length) {
                return true
            } else {
                return false
            }
        },
    },
    watch: {
        selectedPlaylist() {
            if (this.selectedPlaylist) this.updateSongs()
        },
        selectedListType() {
            console.log("UPDATED!!!!!! " + this.selectedListType)
            this.updateListType()
        }
    },
    el: '.main'
})

let country = null

let startPlayer = async () => {
    const token = localStorage.getItem('sp-token');
    const userFetch = await fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    window.user = await userFetch.json()
    if (user.error) {
        console.log('Token is not working... attempting to refresh');
        await requestToken('refresh')
        console.log('done refreshing!!')
        startPlayer()
        return;
    }
    if (user.product != 'premium') {
        document.querySelector('.missing-premium').style.display = 'block'
        document.querySelector('.init-msg').style.display = 'none'
        setTimeout(logout, 10000)
        return;
    }
    let name = user.display_name;
    country = user.country
    console.log(user)
    document.querySelector('#logout').addEventListener('click', logout)
    document.querySelector('#accountName').textContent = name
    document.querySelector('.main').style.display = 'flex'
    document.querySelector('.init-msg').style.display = 'none'
    player = new Spotify.Player({
        name: 'Web Playback SDK Prototype',
        getOAuthToken: cb => {cb(localStorage.getItem('sp-token'));}
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

    currentState = null;
    const seekBar = document.querySelector('#seekBar');
    let currentTime = 0;

    const doSeek = () => {
        seekBar.value = currentTime;
        currentTime = currentTime + 500;
        document.querySelector('#time').textContent = `${timeFormat(currentTime / 1000)}/${timeFormat(seekBar.max / 1000)}`
    }

    let seekInter = setInterval(doSeek, 500)

    let shuffle = document.querySelector('#shuffle')
    let repeat = document.querySelector('#repeat')

    player.addListener('player_state_changed', state => {
        currentState = state;
        if (state.duration) {
            seekBar.max = state.duration;
        }
        currentTime = state.position;
        if (!state.paused) {
            clearInterval(seekInter)
            seekInter = setInterval(doSeek, 500);
        } else {
            clearInterval(seekInter)
        }
        if (state.shuffle) {
            shuffle.children[0].textContent = 'ON'
        } else {
            shuffle.children[0].textContent = 'OFF'
        }
        switch(state.repeat_mode) {
            case 0:
                repeat.children[0].textContent = 'OFF'
                break;
            case 1:
                repeat.children[0].textContent = 'CONTEXT'
                break;
            case 2:
                repeat.children[0].textContent = 'TRACK'
                break;
        }
        let currentSong = state.track_window.current_track;
        if (currentSong) {
            vueStuff.albumArt = currentSong.album.images[0].url
        }
        document.querySelector('#song').textContent = `${currentSong.artists[0].name} - ${currentSong.name}`
        vueStuff.activeSongURI = state.track_window.current_track.uri
    });

    player.addListener('ready', ({device_id}) => {
        console.log('Ready. Device ID:', device_id);
        player._options.id = device_id
    })

    /* player.addListener('not-ready', ({device_id}) => {
        console.log('Device has gone offline:', device_id)
    }) */

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
    let pausePlay = document.querySelector('#pausePlay');
    pausePlay.addEventListener('click', () => {
        if (currentState.paused) {
            player.resume();
            clearInterval(seekInter)
            seekInter = setInterval(doSeek, 500);
        } else if (!currentState.paused) {
            player.pause();
            clearInterval(seekInter)
        }
    })
    seekBar.addEventListener('mousedown', () => {
        clearInterval(seekInter)
    })
    seekBar.addEventListener('mouseup', () => {
        clearInterval(seekInter)
        seekInter = setInterval(doSeek, 500);
    })
    seekBar.addEventListener('change', evt => {
        player.seek(evt.target.value)
        document.querySelector('#time').textContent = `${timeFormat(evt.target.value / 1000)}/${timeFormat(seekBar.max / 1000)}`
    })
    shuffle.addEventListener('click', () => {
        const isShuffle = (currentState.shuffle) ? false : true;
        shuffle.children[0].textContent = 'sending...'
        sendRequest('me/player/shuffle', 'PUT', 'query', {state: isShuffle})
    })

    repeat.addEventListener('click', () => {
        repeat.children[0].textContent = 'sending...'
        let repeatMode = 'off'
        switch(currentState.repeat_mode) {
            case 0:
                repeatMode = 'context';
                break;
            case 1:
                repeatMode = 'track';
                break;
            case 2:
                repeatMode = 'off';
                break;
            default:
                repeatMode = 'off';
                break;
        }
        sendRequest('me/player/repeat', 'PUT', 'query', {state: repeatMode})
    })
    
    sendRequest('me/playlists', 'GET', 'query', {limit: 50}).then(data => {
        data.items.forEach(playlist => {
            if (!vueStuff.selectedPlaylist) vueStuff.selectedPlaylist = playlist.id
            if (!vueStuff.selectedContext) vueStuff.selectedContext = playlist.uri
            vueStuff.currentPlaylistSize = playlist.tracks.total
            vueStuff.playlists.push({
                name: playlist.name,
                id: playlist.id
            })
        })
    })
}