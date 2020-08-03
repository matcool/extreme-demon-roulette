const proxy = 'https://cors-anywhere.herokuapp.com/';
const pointercrate = 'https://pointercrate.com/api/v1/demons/';

let currentDemons = [];
let currentDemon = 0;
let currentPercent = 0;

function getDemonHTML(demon, currentPercent=1) {
    return `
<div class="box">
    <div class="columns is-1">
        <div class="column is-narrow">
            <figure class="image">
                <a href="https://youtu.be/${demon.video}"><img src="https://i.ytimg.com/vi/${demon.video}/mqdefault.jpg" class="yt-thumb"></a>
            </figure>
        </div>
        <div class="column">
            <a href="https://pointercrate.com/demonlist/${demon.position}/"><h1 class="title" id="current-title">#${demon.position} - ${demon.name}</h1></a>
            <h2 class="subtitle"><i>by ${demon.publisher}</i></h2>
        </div>
        <div id="temp-column" class="column is-narrow">
            <input id="ipt-percent" class="input" type="number" placeholder="Atleast ${currentPercent}%">
            <div class="columns is-1">
                <div class="column">
                    <a class="button is-success" id="btn-done">Done</a>
                </div>
                <div class="column">
                    <a class="button is-danger" id="btn-give-up">Give up</a>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

async function getDemons(limit=75, after=0) {
    const response = await axios.get(proxy + pointercrate + `?limit=${limit}&after=${after}`);
    return response.data.map(demon => {
        let video = demon.video;
        if (video && video.includes('youtube')) {
            // hacky but whatever
            video = video.substring(video.length - 11, video.length);
        } else {
            video = null;
        }
        return {
            position: demon.position,
            name: demon.name,
            publisher: demon.publisher.name,
            video
        }
    });
}

function domId(id) {
    return document.getElementById(id);
}

function getCheckbox(id) {
    return domId(id).checked;
}

function getInput(id) {
    return domId(id).value;
}

// https://stackoverflow.com/a/6274381/9124836
Object.defineProperty(Array.prototype, 'shuffle', {
    value: function() {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});

function nextDemon(first=false) {
    if (!first) {
        let percent = Number(getInput('ipt-percent'));
        if (percent < currentPercent) {
            bulmaToast.toast({
                message: `Your % needs to be atleast ${currentPercent}%, otherwise give up`,
                type: 'is-warning'
            });
            return;
        }
        let title = domId('current-title');
        title.textContent += ` (${percent}%)`;
        title.id = null;
        currentPercent = percent + 1;
        currentDemon++;
        domId('temp-column').remove();
        if (percent >= 100) {
            giveUp(false);
            return;
        }
    }
    domId('demons').insertAdjacentHTML('beforeend', getDemonHTML(currentDemons[currentDemon], currentPercent));
    domId('btn-done').addEventListener('click', e => nextDemon());
    domId('btn-give-up').addEventListener('click', e => {
        domId('temp-column').remove();
        giveUp();
    });
}

function giveUp(failed=true) {
    domId('demons').insertAdjacentHTML('beforeend', `
    <div class="box has-text-centered">
        <h1 class="title">Results</h1>
        <div class="content is-medium">
            <p>
            Number of demons: ${currentDemon} <br>
            Highest %: ${currentPercent - 1}%
            </p>
            <p>Status: <span id="status-text" style="color: ${failed ? 'red' : 'green'};">${failed ? 'FAILED' : 'GG'}</span></p>
        </div>
    </div>
    `);
    domId('btn-start').removeAttribute('disabled');
}

domId('btn-start').addEventListener('click', async e => {
    const btn = domId('btn-start');
    btn.setAttribute('disabled', true);

    const mainList = getCheckbox('chk-main-list');
    const extendedList = getCheckbox('chk-extended-list');

    if (!mainList && !extendedList) {
        bulmaToast.toast({
            message: 'Please select atleast one of the checkboxes',
            type: 'is-danger',
        });
        btn.removeAttribute('disabled');
        return;
    }

    currentDemon = 0;
    currentPercent = 1;

    domId('demons').textContent = '';

    if (!currentDemons.length) {
        if (mainList)
            currentDemons = currentDemons.concat(await getDemons(75, 0)); // 1 - 75
        if (extendedList)
            currentDemons = currentDemons.concat(await getDemons(75, 75)); // 76 - 150
    }

    currentDemons.shuffle();
    nextDemon(true);
});
