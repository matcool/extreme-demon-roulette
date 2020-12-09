function domId(id) {
    return document.getElementById(id);
}

function getCheckbox(id) {
    return domId(id).checked;
}

function setCheckbox(id, val) {
    return domId(id).checked = val;
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

async function confirmModal() {
    return new Promise((resolve, reject) => {
        const modal = domId('usure-modal');
        modal.classList.add('is-active');
        const yes = domId('usure-yes');
        const no = domId('usure-no')
        let listener = e => {
            resolve(e.srcElement.id === 'usure-yes');
            modal.classList.remove('is-active');
            yes.removeEventListener('click', listener);
            no.removeEventListener('click', listener);
        };
        yes.addEventListener('click', listener);
        no.addEventListener('click', listener);
    });
}

async function saveLoadModal(state) {
    return new Promise((resolve, reject) => {
        const modal = domId('save-modal');
        modal.classList.add('is-active');
        const save = domId('btn-save');
        const load = domId('btn-load');
        const textArea = domId('ta-save-load');
        textArea.value = '';
        let listener = e => {
            if (e.srcElement.id === 'btn-save') {
                const encoded = exports.bytesToBase64(pako.deflate(exports.MessagePack.encode(state)));
                textArea.value = encoded;
                let blob = new Blob([encoded], {type: 'text/plain;charset=utf-8'});
                saveAs(blob, 'roulette-save.txt');
            } else {
                resolve(exports.MessagePack.decode(pako.inflate(exports.base64ToBytes(textArea.value))));
                modal.classList.remove('is-active');
                save.removeEventListener('click', listener);
                load.removeEventListener('click', listener);
            }
        };
        save.addEventListener('click', listener);
        load.addEventListener('click', listener);
        function modalClose() {
            modal.removeEventListener('modal-close', modalClose);
            save.removeEventListener('click', listener);
            load.removeEventListener('click', listener);
        }
        modal.addEventListener('modal-close', modalClose);
    });
}

domId('ipt-save-file').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (file) {
        domId('ta-save-load').value = await file.text();
    }
});

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// For closing modals
const modalCloseEvent = new Event('modal-close');
document.addEventListener('click', e => {
    let modal = document.querySelector('.modal.is-active:not(.important-modal)');
    if (modal && !(e.target.closest('.modal.is-active .modal-content') || e.target.closest('.modal.is-active .modal-card'))) {
        modal.classList.remove('is-active');
        modal.dispatchEvent(modalCloseEvent);
    }
})

domId('btn-help').addEventListener('click', e => {
    domId('help-modal').classList.add('is-active');
    e.stopPropagation();
});

window.addEventListener('beforeunload', e => {
    if (preventLeaving) {
        e.preventDefault();
        e.returnValue = '';
    }
});

new ClipboardJS('.copy-icon').on('success', function(e) {
    bulmaToast.toast({
        message: `Copied ${e.text} to your clipboard`,
        type: 'is-info',
    });
    e.clearSelection();
});