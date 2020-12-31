<template>
    <modal :show="show" :cancelable="false" @close="close">
        <div class="md:w-96">
            <header class="bg-white p-4 rounded-t">
                <h2 class="text-2xl">Are you sure?</h2>
            </header>
            <footer class="flex justify-between md:justify-start bg-gray-100 p-4 rounded-b">
                <button
                    @click="giveUp"
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                    Yes
                </button>
                <button
                    @click="close"
                    class="px-4 py-2 bg-white hover:bg-gray-300 shadow rounded ml-2"
                >
                    No
                </button>
            </footer>
        </div>
    </modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Modal from './Modal.vue';

export default defineComponent({
    name: 'GiveUpModal',
    components: {
        Modal,
    },
    props: {
        show: Boolean,
    },
    emits: ['close', 'give-up'],
    setup(_, ctx) {
        function giveUp() {
            ctx.emit('give-up');
        }

        function close() {
            ctx.emit('close');
        }

        return {
            close,
            giveUp,
        };
    },
});
</script>
