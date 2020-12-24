<template>
    <div class="flex justify-center">
        <div class="flex flex-col">
            <h1 class="block md:hidden mt-5 text-3xl font-medium text-center text-gray-800">
                Extreme Demon Roulette
            </h1>
            <div class="flex mt-5 mx-3 justify-between items-center">
                <div class="flex flex-col text-gray-800">
                    <label>
                        <input type="checkbox" v-model="selected.mainList" />
                        Main list
                    </label>
                    <label>
                        <input type="checkbox" v-model="selected.extendedList" />
                        Extended list
                    </label>
                    <label>
                        <input type="checkbox" v-model="selected.legacyList" />
                        Legacy list
                    </label>
                </div>
                <h1 class="hidden md:block text-3xl font-medium text-center text-gray-800">
                    Extreme Demon Roulette
                </h1>
                <button
                    @click="start()"
                    class="text-white rounded px-4 py-2"
                    :class="{
                        'bg-green-500 hover:bg-green-600': !playing,
                        'bg-red-500 hover:bg-red-600': playing,
                        'opacity-60 cursor-not-allowed': fetching,
                    }"
                    :disabled="fetching"
                >
                    {{ playing ? 'Restart' : 'Start' }}
                </button>
            </div>
            <!-- switch gap to my-x -->
            <div class="flex flex-col items-center w-screen max-w-7xl gap-5 mt-10">
                <demon
                    v-for="(demon, i) in currentDemons"
                    :key="i"
                    :demon="demon"
                    :active="playing && i === currentDemon"
                    :currentPercent="currentPercent"
                    :percent="percents[i]"
                    @done="demonDone"
                    @give-up="showGiveUpModal = true"
                />
            </div>
            <article
                v-if="showResults"
                class="flex flex-col items-center mt-5 p-5 shadow-lg w-full"
            >
                <h2 class="text-3xl font-medium text-gray-800">Results</h2>
                <section class="text-xl mt-4 text-center">
                    <p>Number of demons: {{ percents.length }}</p>
                    <p>Highest percent: {{ currentPercent - 1 }}%</p>
                </section>
                <button
                    @click="showRemaining = true"
                    v-if="currentPercent < 100"
                    class="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                >
                    Show remaining demons
                </button>
            </article>
            <div v-if="showRemaining">
                <demon
                    v-for="(demon, i) in remainingDemons"
                    :key="i"
                    :demon="demon"
                    :active="false"
                    :currentPercent="0"
                    :percent="currentPercent + i + 1"
                    :animate="false"
                />
            </div>
            <!-- spacing -->
            <div class="mb-32"></div>
        </div>
    </div>
    <modal :show="showGiveUpModal" :cancelable="false" @close="showGiveUpModal = false">
        <div class="md:w-96">
            <header class="bg-white p-4 rounded-t">
                <h2 class="text-2xl">Are you sure?</h2>
            </header>
            <footer class="flex justify-between md:justify-start bg-gray-100 p-4 rounded-b">
                <button
                    @click="giveUp()"
                    class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                >
                    Yes
                </button>
                <button
                    @click="showGiveUpModal = false"
                    class="px-4 py-2 bg-white hover:bg-gray-300 shadow rounded ml-2"
                >
                    No
                </button>
            </footer>
        </div>
    </modal>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed } from 'vue';
import Demon from './components/Demon.vue';
import Modal from './components/Modal.vue';
import { PointercrateDemon } from './types';
import { shuffle, clearArray, fakeDemon, fakeDemonName } from './utils';

export default defineComponent({
    components: {
        Demon,
        Modal,
    },
    setup() {
        const selected = reactive({
            mainList: true,
            extendedList: true,
            legacyList: false,
        });

        let demons = reactive([] as PointercrateDemon[]);

        async function fetchDemons(
            after: number = 0,
            limit: number = 100
        ): Promise<PointercrateDemon[]> {
            const response = await fetch(
                `https://pointercrate.com/api/v1/demons/?limit=${limit}&after=${after}`
            );
            if (response.ok) {
                return await response.json();
            } else {
                return [];
            }
        }

        const playing = ref(false);
        const fetching = ref(false);

        async function start() {
            if (fetching.value) return;
            playing.value = true;
            fetching.value = true;
            showRemaining.value = false;
            clearArray(demons);
            currentDemon.value = -1;
            if (false) {
                for (let i = 0; i < 50; ++i) {
                    demons.push(fakeDemon(fakeDemonName(), 'MAT', null));
                }
            }
            if (selected.mainList) demons.push(...(await fetchDemons(0, 75)));
            if (selected.extendedList) demons.push(...(await fetchDemons(75, 75)));
            if (selected.legacyList) {
                demons.push(...(await fetchDemons(150)));
                // is this even worth it
                demons.push(...(await fetchDemons(250)).filter((demon) => demon.level_id));
            }
            fetching.value = false;
            shuffle(demons);
            currentDemon.value = 0;
            currentPercent.value = 1;
            clearArray(percents);
        }

        const currentDemons = computed(() => {
            return demons.slice(0, currentDemon.value + 1);
        });

        const currentDemon = ref(0);
        const currentPercent = ref(1); // maybe move this to a store?
        const percents = reactive([] as number[]); // maybe put this in the demon object

        function demonDone(percent: number) {
            if (isNaN(percent) || percent < currentPercent.value) return;
            if (percent >= 100) {
                percent = 100;
                playing.value = false;
            } else {
                currentDemon.value++;
            }
            currentPercent.value = percent + 1;
            percents.push(percent);
        }

        const showResults = computed(() => {
            return !playing.value && demons.length;
        });

        const showRemaining = ref(false);

        const remainingDemons = computed(() => {
            return demons
                .slice(currentDemon.value + 1)
                .filter((_, i) => currentPercent.value + i + 1 <= 100);
        });

        const showGiveUpModal = ref(false);

        function giveUp() {
            showGiveUpModal.value = false;
            playing.value = false;
        }

        return {
            demons,
            currentDemons,
            currentDemon,
            currentPercent,
            percents,
            demonDone,
            giveUp,
            selected,
            start,
            playing,
            fetching,
            showResults,
            showRemaining,
            remainingDemons,
            showGiveUpModal,
        };
    },
});
</script>
