<template>
    <article class="flex flex-col md:flex-row p-5 shadow-lg w-full" :class="{'fade-in-up': animate}">
        <a :href="demon.video">
            <img class="w-full md:w-48 md:h-28" loading="lazy" :src="thumbnail" alt="thumbnail" />
        </a>
        <div class="flex mt-2 md:mt-0 justify-between md:justify-start">
            <div class="flex flex-col md:ml-5">
                <a :href="`https://pointercrate.com/demonlist/${demon.position}`">
                    <header class="text-xl md:text-3xl font-medium text-gray-900 hover:underline">
                        #{{ demon.position }} - {{ demon.name }}
                    </header>
                </a>
                <section class="text-lg italic text-gray-700">
                    by {{ demon.publisher.name }}
                </section>
            </div>
            <span v-if="percent" class="ml-3 mt-0.5 text-gray-500 text-2xl">{{ percent }}%</span>
        </div>
        <div v-if="active" class="flex md:flex-grow justify-center md:justify-end mt-4 md:mt-0">
            <div class="flex flex-col w-full md:w-auto">
                <input
                    type="number"
                    class="border rounded border-gray-200 shadow-inner p-2"
                    :placeholder="`Atleast ${currentPercent}%`"
                    v-model="iptPercent"
                />
                <div class="flex justify-between mt-5">
                    <button
                        @click="done()"
                        class="px-4 py-2 shadow bg-green-500 hover:bg-green-600 text-white rounded"
                    >
                        Done
                    </button>
                    <button
                        @click="giveUp()"
                        class="px-4 py-2 shadow bg-red-500 hover:bg-red-600 text-white rounded"
                    >
                        Give up
                    </button>
                </div>
            </div>
        </div>
    </article>
</template>

<style>
    /*
        from https://github.com/animate-css/animate.css/blob/main/source/fading_entrances/fadeInUpBig.css
    */
    @keyframes fadeInUpBig {
        from {
            opacity: 0;
            transform: translate3d(0, 2000px, 0);
        }

        to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
        }
    }

    .fade-in-up {
        animation-duration: 1s;
        animation-name: fadeInUpBig;
    }
    @media (prefers-reduced-motion) {
        .fade-in-up {
            animation: none;
        }
    }
</style>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from 'vue';
import { PointercrateDemon } from '../types';

export default defineComponent({
    name: 'Demon',
    props: {
        demon: {
            type: Object as PropType<PointercrateDemon>,
            required: true,
        },
        active: Boolean,
        percent: Number,
        currentPercent: Number,
        animate: {
            type: Boolean,
            default: true
        }
    },
    emits: ['done', 'give-up'],
    setup(props, ctx) {
        const thumbnail = computed(() => {
            const match = props.demon.video?.match(/https:\/\/www\.youtube\.com\/watch\?v=(.{11})/);
            return !!match
                ? `https://i.ytimg.com/vi/${match[1]}/mqdefault.jpg`
                : `https://i.ytimg.com/vi/a/mqdefault.jpg`;
        });
        const iptPercent = ref('');
        function done() {
            ctx.emit('done', parseInt(iptPercent.value));
        }
        function giveUp() {
            iptPercent.value = '';
            ctx.emit('give-up');
        }
        return {
            thumbnail,
            iptPercent,
            done,
            giveUp,
        };
    },
});
</script>
