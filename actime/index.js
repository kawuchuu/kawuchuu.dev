let nl = [
    'A_00O4KWBxY',
    'uX2NxSN49Tg',
    'LAioanQMG_A',
    '_pCBzrFnTlw',
    'eSfQrWXD94A',
    'zQLvrhUXwtE',
    'mWa-tiP3a_o',
    '-CtfRww-2YM',
    'OHxpIqpAjz0',
    'T9ieUkNOEf4',
    '25wXOGbmWOc',
    'TPFZhtkP7M0',
    'vZVS2FtVWHA',
    'G3rtW1G2Ixg',
    'LiXoQXCFhF8',
    'CM58GBw4JkE',
    'wqaKOCbeXmY',
    'HXG9zU2Lb6g',
    'iLSwc8wgJeo',
    'rmtKHo7GB64',
    'DhrsQO9Pkbs',
    'Fl4M-a3eBnw',
    'tEWFq1_NVSg',
    'ytHqYVbuLt4'
]

let gc = [
    'Ig4JSOlgNbw',
    'kY7Gbcxa1Bg',
    'B-H6D083baU',
    'fnRqvPX7CIM',
    'eTkwAlXSQJo',
    '0-lHUvnb8qU',
    'YyMbSLv3vOM',
    '9i_wJwlyHQI',
    'HnqGALKqm4s',
    '89QTfFT5YHE',
    'mjN3QtyeNBA',
    'mk6Cve1qIHk',
    'i6-FkYY_O_o',
    'gx2tIcs3M-o',
    'KT5MK2bWIPE',
    'RX-9L0LnBV8',
    'EiARr_2O2m4',
    'bbRxt0x9KDI',
    'ioHm_SOUcF0',
    'ejt_xLCwgC0',
    'VXMvi8AoPLw',
    '5F9ukR_d1mY',
    '6deFOq-1z7U',
    '09L3GiXDLdU'
]

let cf = [
    '8ASeD9YzI-M',
    'Wk8VzWlnpFk',
    '4PzksLbEQtY',
    'kncC_BBXtbI',
    'odOy6eGVGtk',
    'DbnBL3kNRkw',
    'UHt69jHris4',
    '1MiDDY3Sw80',
    'jz-pfw8uIE0',
    'aO6gj-WecLk',
    'VAXQ9P2Xnws',
    'ysTxMvXu3JA',
    'j5RBcHE0wCQ',
    'bwgTYUKH-aA',
    'EzNgk8hy4x8',
    'z03V_14Qb6s',
    '01iNgVNUNy0',
    'WQ1QdOukekk',
    '8UJPuzcwluw',
    'MBebP2G22b8',
    '9o9D4XtspWI',
    'F9RFOo2gma0',
    'pIMIdGm7q5U',
    '8jilIPs02Zw'
]

let nh = [
    'lqs34Ou0Rw8',
    'LJhvOKQZqC0',
    'bgdqH77h4qU',
    'C1cfkkscrI8',
    'GnLPAiLYmKw',
    'dJwg-mWj7xY',
    'PT3Gx-Ox5Ek',
    'Zj-z7P-P0eU',
    'YhpYzNZkg8E',
    'rw-NhaaC8bU',
    'mnC8Yj7GUBk',
    'bnzSJMLDm90',
    'FuMClV20DDg',
    'cTMHpVXBWVo',
    'ALRRqnJdAhc',
    'Lu7h28H52jM',
    'jHs6hIDmOFE',
    'pJvjbosEdHE',
    'lxgcDP-wppM',
    'ZMgj30uGeb0',
    '9n-LArbDkIk',
    'QEkytL-anQw',
    'GFBWicff5ZE',
    'HT-djWRbNN4'
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
        playerVars: {'autoplay': 1, 'controls': 0, 'start': 0}
    });
}

function onPlayerReady(event) {
    player.mute();
    player.loadVideoById(activeGame[parseInt(moment().format('HH'))]);
    event.target.playVideo();
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