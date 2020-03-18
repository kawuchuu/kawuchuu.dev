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
    'G3IzATmzA3o',
    'Wk8VzWlnpFk',
    '9DwrEx-69PM',
    'lSqkG3QEsRw',
    'jSUBf13bKOU',
    'VBOBHSdoHL8',
    'z2QAAJeHF2s',
    'cQ2UTZ-S9Q8',
    'C7X6BLiB2Ec',
    '3UpdJMSAP10',
    'CYk1CtYzz0o',
    'FTpvuY4Y1AE',
    'VhzGugcr_aQ',
    '2bwO3lZkTHs',
    'FivBqy6VG4w',
    '1Oya4xMfRfw',
    'K6KkeYwAFHE',
    'syxR6VzzAqQ',
    'yx_BIFCFpaA',
    'eGl1CzBxtRQ',
    'mFOLcD_w5sc',
    'Riz2ON11Vso',
    'lOdQfelEVaY',
    'ouBKNNeGbh8'
]

let game = [gc, cf, nl];

let activeGame = game[0];

let tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
let firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: nl[0],
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
    }, 500)
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
            }, 500)
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
    }
    activeGame = game[newgame];
    player.mute();
    player.loadVideoById(activeGame[parseInt(moment().format('HH'))]);
    player.playVideo();
    setTimeout(() => {
        player.seekTo(0);
        player.unMute();
    }, 500);
}