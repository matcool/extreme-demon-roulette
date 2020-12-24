<template>
    <div
        v-if="show"
        class="flex flex-col justify-center items-center left-0 top-0 right-0 bottom-0 fixed"
    >
        <div
            @click="close"
            class="absolute left-0 top-0 right-0 bottom-0 bg-black opacity-50 z-10"
        ></div>
        <div class="relative z-20">
            <article>
                <slot></slot>
            </article>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';

export default defineComponent({
    name: 'Modal',
    props: {
        show: Boolean,
        cancelable: Boolean,
    },
    emits: ['close'],
    setup(props, ctx) {
        function close() {
            if (props.cancelable) ctx.emit('close');
        }
        return {
            close,
        };
    },
});
</script>
