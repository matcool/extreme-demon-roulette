<template>
    <modal :show="show" :cancelable="true" @close="close(false)">
        <div class="md:w-96">
            <header class="bg-gray-50 p-4 rounded-t-lg">
                <h2 class="text-2xl">Save / Load</h2>
            </header>
            <section class="bg-white py-5 px-4">
                <input type="file" class="text-gray-800" @change="onFileChange" />
            </section>
            <footer class="flex justify-between md:justify-start bg-gray-100 p-4 rounded-b-lg">
                <button
                    @click="save"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                    Save
                </button>
                <button
                    @click="close(true)"
                    class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded ml-2 disabled:opacity-50"
                    :disabled="!file"
                >
                    Load
                </button>
            </footer>
        </div>
    </modal>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import Modal from './Modal.vue';

export default defineComponent({
    name: 'SaveModal',
    components: {
        Modal,
    },
    props: {
        show: Boolean,
    },
    emits: ['close', 'save'],
    setup(_, ctx) {
        const file: Ref<File | null> = ref(null);

        function close(load: boolean = false) {
            ctx.emit('close', load ? file.value : null);
            file.value = null;
        }

        function onFileChange(e: Event) {
            const target = e.target as HTMLInputElement;
            if (target) file.value = target.files![0];
        }

        function save() {
            ctx.emit('save');
        }

        return {
            close,
            onFileChange,
            file,
            save,
        };
    },
});
</script>
