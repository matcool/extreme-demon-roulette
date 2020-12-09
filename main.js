// free .tk domain I dont care im poor
const api = 'https://matcool.tk';

let currentDemons = [];
let currentDemon = 0;
let currentPercent = 0;
let pastPercents = [];
let playing = false;

let lastCheckboxes = [true, true, false];

let preventLeaving = false;

exports.feather.replace(); // for the iconset
const axios = exports.axios;

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
        pastPercents.push(percent);
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
        confirmModal().then(s => {
            if (!s) return;
            domId('temp-column').remove();
            giveUp();
        })
    });
}

function giveUp(failed = true) {
    playing = false;
    preventLeaving = false;

    if (failed) {
        let title = domId('current-title');
        if (title)
            title.removeAttribute('id');
    }

    domId('demons').insertAdjacentHTML('beforeend', `\
<div class="box has-text-centered animate__animated animate__fadeInUp">
    <h1 class="title">Results</h1>
    <div class="content is-medium">
        <p>
        Number of demons: ${currentDemon} <br>
        Highest percent: ${currentPercent - 1}%
        </p>
        ${failed ? '' : '<p><span id="status-text" style="color: green;">GG</span></p>'}
        <a class="button is-info" id="btn-show-demons">Show remaining demons</a>
    </div>
</div>`);

    let btnStart = domId('btn-start');
    btnStart.classList.add('is-success');
    btnStart.classList.remove('is-danger');
    btnStart.innerText = 'Start';
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
    if (playing) {
        confirmModal().then(async s => {
            if (s) {
                await start(btn);
            }
        });
    } else {
        await start(btn);
    }
});
async function start(btn) {
    btn.setAttribute('disabled', true);
    playing = true;

    preventLeaving = true;

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
    pastPercents = [];

    domId('demons').textContent = '';

    if (!currentDemons.length || mainList !== lastCheckboxes[0] || extendedList !== lastCheckboxes[1] || legacyList !== lastCheckboxes[2]) {
        currentDemons = [
            ...(mainList ? (await axios.get(api + '/mainlist')).data : []), // 1 - 75
            ...(extendedList ? (await axios.get(api + '/extendedlist')).data : []), // 76 - 150
            ...(legacyList ? (await axios.get(api + '/legacylist')).data : [])
        ];
    }

    lastCheckboxes = [mainList, extendedList, legacyList];

    currentDemons.shuffle();
    nextDemon(true);

    btn.classList.remove('is-success');
    btn.classList.add('is-danger');
    btn.innerText = 'Restart';
    btn.removeAttribute('disabled');
};

clickEvent(domId('btn-save-load'), async (btn, e) => {
    e.stopPropagation();
    const state = {
        playing,
        demon: currentDemon,
        percent: currentPercent,
        percents: pastPercents,
        main: getCheckbox('chk-main-list'),
        extended: getCheckbox('chk-extended-list'),
        legacy: getCheckbox('chk-legacy-list'),
        demons: currentDemons.map(demon => Object.values(demon))
    };
    const loadedState = await saveLoadModal(state);
    if (loadedState) {
        if (loadedState.demons.length === 0) return;
        playing = loadedState.playing;
        setCheckbox('chk-main-list', loadedState.main);
        setCheckbox('chk-extended-list', loadedState.extended);
        setCheckbox('chk-legacy-list', loadedState.legacy);
        lastCheckboxes = [loadedState.main, loadedState.extended, loadedState.legacy];
        currentDemon = loadedState.demon;
        currentPercent = loadedState.percent;
        pastPercents = loadedState.percents;
        currentDemons = loadedState.demons.map(demon => {
            return {
                position: demon[0],
                name: demon[1],
                publisher: demon[2],
                video: demon[3]
            };
        });
        const demons = domId('demons');
        demons.innerHTML = '';
        for (let i = 0; i < currentDemon; ++i) {
            demons.insertAdjacentHTML('beforeend', getDemonHTML(currentDemons[i]));
            domId('temp-column').remove();
            let title = domId('current-title');
            title.insertAdjacentHTML('beforeend', `<span class="percent ml-1"> ${pastPercents[i]}%</span>`);
            title.removeAttribute('id');
        }
        if (playing) {
            nextDemon(true);
            let btn = domId('btn-start');
            btn.classList.remove('is-success');
            btn.classList.add('is-danger');
            btn.innerText = 'Restart';
            preventLeaving = true;
        } else {
            let failed = currentPercent <= 100;
            if (failed) {
                demons.insertAdjacentHTML('beforeend', getDemonHTML(currentDemons[currentDemon]));
                domId('temp-column').remove();
            }
            giveUp(failed);
        }
    }
});
