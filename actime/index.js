let nl = [
    'nCjikfzAxnE',
    '3zKqXMg28ko',
    'GRQO-4hY7D4',
    'IUocRahAMOU',
    'u1t5_DjMrfY',
    'EcEdFgHjikM',
    '12zcLNA3clo',
    'INf3NXheN50',
    'QFDMo7uLiD0',
    'STjSeTQJpkY',
    'NtbSi3mTVUc',
    '6fvTpGXs288',
    'kaZmtVCkcYY',
    'Iar-NrBmwZ0',
    '3AWQuELp8Q8',
    'AN6I-cxHxkM',
    'weHizIW296E',
    'khBwYuNGU6U',
    'i9FhWgjRP2U',
    'QXl5BZK2lHs',
    'Xsglvg3hK8g',
    '9oLZgF8LAA8',
    '-Zlfbpak0yU',
    'u-kvsJW-8G0'
]

let gc = [
    'D4kYl5m4b64',
    'fmKhqvgdtO8',
    'RfmwaD0t0Es',
    'kjvzd8i1bUk',
    '2L02IwIwZ50',
    '9CrB7pN6raM',
    'kJq4qzgs4hc',
    'c0DQXLKM4x0',
    'rOQEVbKhZNU',
    'gGAEwfRJlh4',
    '69BLvsnWr1w',
    't_T7EkVM6bg',
    'BpAUrpW2BSw',
    'q8rA3TTskHg',
    'mFJkRbayGwY',
    'DWUX7uek9vE',
    'qp1sqfkMWDU',
    'RCLqUYHWO8Y',
    '2KrLpPoydCM',
    'yNs-0aC6ZP8',
    'e0FS2R7VmOA',
    'cZD8VkPJ42M',
    'ZxLTPsUW7QM',
    'V7OwVLZfE_c'
]

let cf = [
    'xD-xDmjDmaY',
    'yje6mLBCGGQ',
    'ER9Y14j9cv8',
    'Uiyki6MOXTE',
    'fHkIH_V4BR8',
    'jPhVfB7RJ6g',
    'X4PWU-ZXnUo',
    'yD6xHtzxKoE',
    'O8oFqiVtATk',
    'CUmUCLSr9sM',
    'BSmsWF1rbmo',
    'pzXUzf159RQ',
    'V95zbEv-qLs',
    'exKeVRw6CbE',
    'RcRsshUJ49g',
    'sHIdhAiQHSE',
    'W15e7_mZ6YM',
    'zTJvNYlwE3g',
    'Nom8hyUNs5A',
    '4kzXhssr6k4',
    'g7frZDc-PZc',
    'X0q6GHsk4eo',
    'hhJzmoOYkTo',
    'qMeSD23TV9Y'
]

let nh = [
    'qDnrdeNDRio',
    'LjrMm_6zmNo',
    'oPCkJqbTpaA',
    '0Gpa29MRPys',
    'ROpWMf0Md6g',
    '_qSyWo0Tm4U',
    'lS0XGL2rWTI',
    'rdVBS1lHDC4',
    'QIx22FB3FXo',
    '7Rf6gOt_LdY',
    'hkP1kOKF2Yk',
    'AKXMNP23BnA',
    'KJp488yN3VM',
    'yWWoDrUZq04',
    'gD4Hh115gOk',
    'uhnNzw4x7sE',
    'cLBhI_9njKw',
    'vc1zlXMyZow',
    'WH_rj-YzzXI',
    'AK5mUK5IQvs',
    'du10VZTTZp8',
    'HxXOrY_DtVw',
    'zANebE1wNjw',
    '5hVFsARLcV0'
]

let game = [gc, cf, nl, nh];

let activeGame = game[3];
let activeGameNum = 3;

let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: nh[0],
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        },
        playerVars: {'autoplay': 0, 'controls': 0, 'start': 0}
    });
}

function onPlayerReady(event) {
    player.mute();
    player.cueVideoById(activeGame[parseInt(moment().format('HH'))]);
    setTimeout(() => {
        //player.seekTo(0);
        //player.unMute();
    }, 100);
    if (isPaused) {
        player.pauseVideo();
        pauseControl.textContent = 'play_arrow';
    } else {
        //pauseControl.textContent = 'pause';
        //player.playVideo();
    }
    if (isMute) {
        player.mute();
        muteControl.textContent = 'volume_off';
    } else {
        muteControl.textContent = 'volume_up';
        player.unMute();
    }
    updateTitle(activeGameNum);
    document.querySelector('.cover h1').style.display = 'none'
    document.querySelector('.cover i').style.display = 'block'
}

function updateTitle(gamenum) {
    let title;
    switch(gamenum) {
        case 0:
            title = 'Animal Crossing';
            break;
        case 1:
            title = 'Animal Crossing: City Folk';
            break;
        case 2:
            title = 'Animal Crossing: New Leaf'
            break;
        case 3:
            title = 'Animal Crossing: New Horizons'
            break;
    }
    document.querySelector('.control-title').textContent = `${title} - ${moment().format('ha')}`
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        player.playVideo(); 
    }
}

let visible = false;
let colon = document.querySelector('#colon');

setTimeout(() => {
    setInterval(() => {
        let hour = moment().format('HH');
        let minute = moment().format('mm');
        let second = moment().format('ss');
        if (minute == '00' && second == '00') {
            player.mute();
            player.loadVideoById(activeGame[parseInt(hour)]);
            player.playVideo();
            setTimeout(() => {
                player.seekTo(0);
                player.unMute();
            }, 500);
            if (isPaused) {
                player.pauseVideo();
                pauseControl.textContent = 'play_arrow';
            } else {
                pauseControl.textContent = 'pause';
                player.playVideo();
            }
            if (isMute) {
                player.mute();
                muteControl.textContent = 'volume_off';
            } else {
                muteControl.textContent = 'volume_up';
                player.unMute();
            }
            updateTitle(activeGameNum);
        }
        document.querySelector('#hour').textContent = hour;
        document.querySelector('#minute').textContent = minute;
        if (visible) {
            colon.style.opacity = 0;
            visible = false;
        } else {
            colon.style.opacity = 1;
            visible = true;
        }
    }, 500)
}, 100)

function updateGame(newgame) {
    document.querySelectorAll('.switch-game').forEach(e => {
        e.classList.remove('active');
    });
    updateTitle(newgame);
    switch(newgame) {
        case 0:
            document.querySelector('#gc').classList.add('active');
            break;
        case 1:
            document.querySelector('#cf').classList.add('active');
            break;
        case 2:
            document.querySelector('#nl').classList.add('active');
            break;
        case 3:
            document.querySelector('#nh').classList.add('active');
    }
    activeGameNum = newgame;
    activeGame = game[newgame];
    player.mute();
    player.loadVideoById(activeGame[parseInt(moment().format('HH'))]);
    player.playVideo();
    setTimeout(() => {
        player.seekTo(0);
        player.unMute();
    }, 500);
    if (isPaused) {
        player.pauseVideo();
        pauseControl.textContent = 'play_arrow';
    } else {
        pauseControl.textContent = 'pause';
        player.playVideo();
    }
    if (isMute) {
        player.mute();
        muteControl.textContent = 'volume_off';
    } else {
        muteControl.textContent = 'volume_up';
        player.unMute();
    }
}

let isPaused = false;
let isMute = false;

let pauseControl = document.querySelector('.pause');
let muteControl = document.querySelector('.mute');

function controlClick(control) {
    switch(control) {
        case 'pause':
            if (!isPaused) {
                player.pauseVideo();
                pauseControl.textContent = 'play_arrow';
                isPaused = true;
            } else {
                pauseControl.textContent = 'pause';
                player.playVideo();
                isPaused = false;
            }
            break;
        case 'mute':
            if (!isMute) {
                player.mute();
                muteControl.textContent = 'volume_off';
                isMute = true;
            } else {
                muteControl.textContent = 'volume_up';
                player.unMute();
                isMute = false;
            }
            break;
    }
}

document.querySelector('.cover i').addEventListener('click', evt => {
    pauseControl.textContent = 'pause';
    player.playVideo();
    evt.target.parentNode.style.display = 'none'
})