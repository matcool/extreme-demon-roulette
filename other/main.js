let currentDemons = [];
let currentDemon = 0;
let currentPercent = 0;
let playing = false;

let lastCheckboxes = [true, false];

let preventLeaving = false;

feather.replace();

let data;
axios.get('./data.bin', {
    responseType: 'arraybuffer'
}).then(response => {
    data = JSON.parse(pako.inflate(response.data, {to: 'string'}));
});

function getDemonElement(demon, currentPercent = 1, animation = 'fadeInUpBig') {
    const template = domId('demon-template').cloneNode(true);
    template.removeAttribute('id');
    template.classList.remove('hide');
    if (animation) {
        template.classList.add('animate__animated');
        template.classList.add('animate__' + animation);
    }
    // kinda jank but whatever
    template.innerHTML = template.innerHTML
    .replace('$demonName', demon.name)
    .replace('$demonCreator', demon.creator)
    .replace('$percent', currentPercent)
    .replace('$diff', demon.diff)
    .replace('$levelid', demon.id);
    return template;
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
    domId('demons').insertAdjacentElement('beforeend', getDemonElement(currentDemons[currentDemon], currentPercent));
    feather.replace();
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
                domId('demons').insertAdjacentElement('beforeend', getDemonElement(currentDemons[i], 0, false));

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

    const insane = getCheckbox('chk-insane');
    const hard = getCheckbox('chk-hard');

    if (!insane && !hard) {
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

    if (!currentDemons.length || insane !== lastCheckboxes[0] || hard !== lastCheckboxes[1]) {
        currentDemons = [
            ...(insane ? data.insane : []),
            ...(hard ? data.hard : [])
        ];
    }

    lastCheckboxes = [insane, hard];

    currentDemons.shuffle();
    nextDemon(true);

    btn.classList.remove('is-success');
    btn.classList.add('is-danger');
    btn.innerText = 'Restart';
    btn.removeAttribute('disabled');
};
