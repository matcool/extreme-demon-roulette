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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// For closing modals
document.addEventListener('click', e => {
    let modal = document.querySelector('.modal.is-active:not(.important-modal)');
    if (modal && !e.target.closest('.modal.is-active .modal-content')) {
        modal.classList.remove('is-active');
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