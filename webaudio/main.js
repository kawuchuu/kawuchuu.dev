let ctx;
let gainFilter;
let bassFilter;
let trebleFilter;
let reverbConvolver;
let ctxBufferSource;
let ctxConvolverSource;
let impulseData;
let convolver;
let convolverGain;
let bkBuffer;
let addSeekBy = 0;

let speedRange = document.querySelector('#speedRange input');
let gainRange = document.querySelector('#gainRange input');
let trebleRange = document.querySelector('#trebleRange input');
let bassRange = document.querySelector('#bassRange input');
let reverbRange = document.querySelector('#reverbRange input');
let fileName = document.querySelector('#fileName');
let playingAni = document.querySelector('.playing-ani');
let pausePlay = document.querySelector('#pausePlay');
let stopBtn = document.querySelector('#stop');
let controls = document.querySelector('.controls');
let seekRange = document.querySelector('#seekRange');

let seekInterval = () => {
    window.dispatchEvent(seek);
}

setInterval(seekInterval, 1000);

let createNewAudioCtx = async hasGotBuffer => {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContext();
    gainFilter = ctx.createGain();
    bassFilter = ctx.createBiquadFilter();
    trebleFilter = ctx.createBiquadFilter();
    ctxBufferSource = ctx.createBufferSource();
    bassFilter.type = 'lowshelf';
    trebleFilter.type = 'highshelf';
    bassFilter.frequency.value = 200;
    trebleFilter.frequency.value = 2000;
    if (!hasGotBuffer) {
        let resp = await fetch('./subway.wav');
        let data = await resp.arrayBuffer();
        let waitForThing = new Promise(resolve => {
            ctx.decodeAudioData(data, impulseBuffer => {
                ctxConvolverSource = ctx.createBufferSource();
                convolver = ctx.createConvolver();
                convolver.buffer = impulseBuffer;
                convolver.normalize = true;
                convolverGain = ctx.createGain();
                console.log('wooooo');
                impulseData = impulseBuffer;
                resolve();
            })
        })
        await waitForThing;
    } else {
        ctxConvolverSource = ctx.createBufferSource();
        convolver = ctx.createConvolver();
        convolver.buffer = impulseData;
        convolver.normalize = true;
        convolverGain = ctx.createGain();
        console.log('wooooo');
    }
    console.log('Created new AudioContext with filters');
}

let playingAnimationToggle = enable => {
    if (enable) {
        playingAni.classList.add('start');
    } else {
        playingAni.classList.remove('start');
    }
}

document.querySelector('#selectFile').addEventListener('input', evt => {
    if (!evt.target.files[0]) return;
    if (ctx) ctx.close();
    playingAnimationToggle(false);
    fileName.textContent = "Reading file...";
    pausePlay.textContent = 'play_arrow';
    controls.classList.remove('active');
    let audioFile = evt.target.files[0];
    if (!audioFile.type.startsWith('audio')) {
        fileName.textContent = "You didn't select an audio file!"
        console.error('The file selected is not an audio file.');
        return;
    }
    let reader = new FileReader();
    reader.readAsArrayBuffer(audioFile);
    reader.onload = () => {
        readFile(reader.result, audioFile.name);
    }
})

let readFile = async (buffer, name) => {
    fileName.textContent = "Preparing file...";
    let waitForNewCtx = new Promise(async resolve => {
        await createNewAudioCtx();
        console.log('lol yeah finish')
        resolve();
    })
    await waitForNewCtx;
    let getBuffer = await ctx.decodeAudioData(buffer).catch(e => {
        fileName.textContent = "Failed to decode audio data!"
    })
    if (!getBuffer) return
    bkBuffer = getBuffer;
    fileName.textContent = `${name}`;
    addSeekBy = 0;
    play(getBuffer, 0);
    console.log('done!');
}

let play = (buffer, time) => {
    ctxBufferSource.buffer = buffer;
    ctxBufferSource.loop = true;
    ctxBufferSource.playbackRate.value = speedRange.value;
    gainFilter.gain.value = gainRange.value;
    trebleFilter.gain.value = trebleRange.value;
    bassFilter.gain.value = bassRange.value;
    ctxBufferSource.connect(gainFilter)
                .connect(bassFilter)
                .connect(trebleFilter)
                .connect(ctx.destination);
    console.log(ctxConvolverSource)
    ctxConvolverSource.buffer = buffer;
    ctxConvolverSource.loop = true;
    ctxConvolverSource.playbackRate.value = speedRange.value;
    convolverGain.gain.value = reverbRange.value;
    ctxConvolverSource.connect(convolver).connect(convolverGain).connect(ctx.destination);
    if (time) {
        ctxBufferSource.start(0, time, ctxBufferSource.buffer.duration);
        ctxConvolverSource.start(0, time, ctxBufferSource.buffer.duration);
    } else {
        ctxBufferSource.start(0);
        ctxConvolverSource.start(0);
    }
    controls.classList.add('active');
    seekRange.max = ctxBufferSource.buffer.duration / parseFloat(speedRange.value);
    if (ctx.state == 'running') {
        playingAnimationToggle(true);
        pausePlay.textContent = 'pause';
    }
}

let doSeek = async time => {
    ctx.close();
    addSeekBy = time;
    let waitForNewCtx = new Promise(async resolve => {
        await createNewAudioCtx(true);
        console.log('lol yeah finish')
        resolve();
    })
    await waitForNewCtx;
    play(bkBuffer, time / parseFloat(speedRange.value));
}

speedRange.addEventListener('input', evt => {
    ctxBufferSource.playbackRate.value = evt.target.value;
    ctxConvolverSource.playbackRate.value = evt.target.value;
    clearInterval(seekInterval);
    setInterval(seekInterval, parseFloat(evt.target.value) * 1000);
    seekRange.max = ctxBufferSource.buffer.duration / parseFloat(evt.target.value);
    document.querySelector('#speedRange div.item-title span.num').textContent = `${evt.target.value}x`;
})

gainRange.addEventListener('input', evt => {
    gainFilter.gain.value = evt.target.value;
    document.querySelector('#gainRange div.item-title span.num').textContent = `${evt.target.value}x`;
})

trebleRange.addEventListener('input', evt => {
    trebleFilter.gain.value = evt.target.value - 1;
    document.querySelector('#trebleRange div.item-title span.num').textContent = `${evt.target.value}x`;
})

bassRange.addEventListener('input', evt => {
    bassFilter.gain.value = evt.target.value - 1;
    document.querySelector('#bassRange div.item-title span.num').textContent = `${evt.target.value}x`;
})

reverbRange.addEventListener('input', evt => {
    convolverGain.gain.value = evt.target.value;
    document.querySelector('#reverbRange div.item-title span.num').textContent = `${evt.target.value}x`;
})

pausePlay.addEventListener('click', evt => {
    if (!ctx || ctx.state == 'closed') {
        fetch('./default.mp3').then(resp => {
            resp.arrayBuffer().then(buffer => {
                readFile(buffer, "albie - drifting away");
            })
        })
    } else if (ctx.state == 'running') {
        ctx.suspend();
        evt.target.textContent = 'play_arrow';
        playingAnimationToggle(false);
    } else if (ctx.state == 'suspended') {
        ctx.resume();
        evt.target.textContent = 'pause'
        playingAnimationToggle(true);
    }
})

stopBtn.addEventListener('click', evt => {
    ctx.close();
    fileName.textContent = "No song playing...";
    playingAnimationToggle(false);
    pausePlay.textContent = 'play_arrow';
    controls.classList.remove('active');
})

//event handling for seeking! such a stupid way of doing it but i have no other choice :(

const seek = new Event('seek');

let seekEvtFunc = () => {
    if (ctx) {
        seekRange.value = parseFloat(ctx.currentTime) + parseFloat(addSeekBy);
    }
}

window.addEventListener('seek', seekEvtFunc);

seekRange.addEventListener('mousedown', () => {
    window.removeEventListener('seek', seekEvtFunc);
})

seekRange.addEventListener('mouseup', () => {
    window.addEventListener('seek', seekEvtFunc);
})

seekRange.addEventListener('change', e => {
    doSeek(e.target.value);
})

//background animation

let bg = document.querySelector('.bg');

let mouseX = 0;
let mouseY = 0;
let bgMoveX = 0;
let bgMoveY = 0;
let speed = 0.03;

let doAnimation = () => {
    let distanceX = mouseX - bgMoveX;
    let distanceY = mouseY - bgMoveY;
    bgMoveX = bgMoveX + (distanceX * speed);
    bgMoveY = bgMoveY + (distanceY * speed);
    bg.style.left = bgMoveX + 'px';
    bg.style.top = bgMoveY + 'px';
    requestAnimationFrame(doAnimation)
}

doAnimation();

window.addEventListener('pointermove', evt => {
    if (evt.pointerType != 'mouse') {
        mouseX = 0;
        mouseY = 0;
        return;
    }
    mouseX = evt.pageX / 30;
    mouseY = evt.pageY /22;
})

document.querySelectorAll('.clear').forEach(el => {
    switch(el.id) {
        case "speedClear":
            el.addEventListener('click', () => {
                speedRange.value = 1;
                ctxBufferSource.playbackRate.value = 1;
                ctxConvolverSource.playbackRate.value = 1;
                clearInterval(seekInterval);
                setInterval(seekInterval, parseFloat(1) * 1000);
                seekRange.max = ctxBufferSource.buffer.duration / parseFloat(1);
                document.querySelector('#speedRange div.item-title span.num').textContent = `1x`;
            })
            break;
        case "gainClear":
            el.addEventListener('click', () => {
                gainRange.value = 1;
                gainFilter.gain.value = 1;
                document.querySelector('#gainRange div.item-title span.num').textContent = `1x`;
            })
            break;
        case "trebleClear":
            el.addEventListener('click', () => {
                trebleRange.value = 0;
                trebleFilter.gain.value = 0;
                document.querySelector('#trebleRange div.item-title span.num').textContent = `0x`;
            })
            break;
        case "bassClear":
            el.addEventListener('click', () => {
                bassRange.value = 0;
                bassFilter.gain.value = 0;
                document.querySelector('#bassRange div.item-title span.num').textContent = `0x`;
            })
            break;
        case "reverbClear":
            el.addEventListener('click', () => {
                reverbRange.value = 0;
                convolverGain.gain.value = 0;
                document.querySelector('#reverbRange div.item-title span.num').textContent = `0x`;
            })
            break;
        default:
            console.log('what lol')
    }
})

const disclaimer = document.querySelector('.disclaimer')

if (!localStorage.getItem('wa-disclaimer-accept')) {
    disclaimer.classList.add('show')
}

document.querySelector('#closeDisclaimer').addEventListener('click', () => {
    disclaimer.classList.remove('show')
    disclaimer.classList.add('hide')
    localStorage.setItem('wa-disclaimer-accept', true)
})