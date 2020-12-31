import { Ref } from 'vue';

export function unloadHandler(preventUnload: Ref<boolean>): () => void {
    const listener = (event: BeforeUnloadEvent) => {
        if (preventUnload.value) {
            event.preventDefault();
            event.returnValue = '';
            return true;
        }
    };
    window.addEventListener('beforeunload', listener);
    return () => {
        window.removeEventListener('beforeunload', listener);
    };
}
