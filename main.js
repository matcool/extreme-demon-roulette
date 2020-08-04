const proxy = 'https://cors-anywhere.herokuapp.com/';
const pointercrate = 'https://pointercrate.com/api/v1/demons/';

let currentDemons = [];
let currentDemon = 0;
let currentPercent = 0;

let lastCheckboxes = [true, true, false];

feather.replace(); // for the iconset

function getDemonHTML(demon, currentPercent = 1, animation = 'fadeInUpBig') {
    return `\
<div class="box ${animation ? 'animate__animated animate__' + animation : ''}">
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
            <div class="columns is-1 mt-1">
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

async function getDemons(limit = 75, after = 0) {
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
    value: function () {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
        return this;
    }
});

function clickEvent(element, listener) {
    element.addEventListener('click', e => {
        if (element.hasAttribute('disabled')) return;
        listener(element, e);
    });
}

function nextDemon(first = false) {
    if (!first) {
        let percent = Number(getInput('ipt-percent'));
        if (percent < currentPercent) {
            bulmaToast.toast({
                message: `Your % needs to be atleast ${currentPercent}%, otherwise give up`,
                type: 'is-warning'
            });
            return;
        }
        if (percent > 100) {
            bulmaToast.toast({
                message: 'really',
                type: 'is-warning'
            });
            return;
        }
        domId('temp-column').remove();
        let title = domId('current-title');
        title.insertAdjacentHTML('beforeend', `<span class="percent ml-1"> ${percent}%</span>`);
        title.removeAttribute('id');
        currentPercent = percent + 1;
        currentDemon++;

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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function giveUp(failed = true) {
    if (failed)
        domId('current-title').removeAttribute('id');
    domId('demons').insertAdjacentHTML('beforeend', `\
<div class="box has-text-centered animate__animated animate__fadeInUp">
    <h1 class="title">Results</h1>
    <div class="content is-medium">
        <p>
        Number of demons: ${currentDemon} <br>
        Highest percent: ${currentPercent - 1}%
        </p>
        <p><span id="status-text" style="color: ${failed ? 'red' : 'green'};">${failed ? 'FAILED' : 'GG'}</span></p>
        <a class="button is-info" id="btn-show-demons">Show remaining demons</a>
    </div>
</div>`);

    domId('btn-start').removeAttribute('disabled');
    if (!failed) {
        domId('btn-show-demons').remove();
    } else {
        clickEvent(domId('btn-show-demons'), async btn => {
            btn.setAttribute('disabled', true);
            for (let i = currentDemon + 1; i < currentDemons.length; ++i) {
                domId('demons').insertAdjacentHTML('beforeend', getDemonHTML(currentDemons[i], 0, false));

                let percent = currentPercent + i - currentDemon;

                domId('temp-column').remove();
                let title = domId('current-title');
                title.insertAdjacentHTML('beforeend', `<span class="percent ml-1" style="color: #e0e0e0; font-size: 0.6em !important;"> ${percent}%</span>`);
                title.removeAttribute('id');

                if (percent >= 100) {
                    break;
                }
            }
        });
    }
}

clickEvent(domId('btn-start'), async btn => {
    btn.setAttribute('disabled', true);

    const mainList = getCheckbox('chk-main-list');
    const extendedList = getCheckbox('chk-extended-list');
    const legacyList = getCheckbox('chk-legacy-list');

    if (!mainList && !extendedList && !legacyList) {
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

    if (!currentDemons.length || mainList !== lastCheckboxes[0] || extendedList !== lastCheckboxes[1] || legacyList !== lastCheckboxes[2]) {
        currentDemons = [
            ...(mainList ? await getDemons(75, 0) : []), // 1 - 75
            ...(extendedList ? await getDemons(75, 75) : []), // 76 - 150
            ...(legacyList ? (await getDemons(100, 150)).concat(await getDemons(100, 250)) : []) // two requests ☠️
        ];
    }

    lastCheckboxes = [mainList, extendedList, legacyList];

    currentDemons.shuffle();
    nextDemon(true);
});

// For closing modals
document.addEventListener('click', e => {
    let modal = document.querySelector('.modal.is-active');
    if (modal && !e.target.closest('.modal.is-active .modal-content')) {
        modal.classList.remove('is-active');
    }
})

domId('btn-help').addEventListener('click', e => {
    domId('help-modal').classList.add('is-active');
    e.stopPropagation();
});