import { encode, decode } from '@msgpack/msgpack';
import { inflateSync, deflateSync } from 'fflate';
import { base64ToBytes } from 'byte-base64';
import type { PointercrateDemon, SimplifiedDemon, RouletteState } from './types';

export function simplifyDemon(demon: PointercrateDemon): SimplifiedDemon {
    const match = demon.video?.match(/https:\/\/www\.youtube\.com\/watch\?v=(.{11})/);
    return {
        name: demon.name,
        creator: demon.publisher.name,
        position: demon.position,
        levelID: demon.level_id,
        video: match ? match[1] : null,
    };
}

export function compressState(state: RouletteState): Uint8Array {
    const data = {
        ...state,
        // demons: state.demons.map(demon => Object.values(demon)),
        version: 1,
    };
    console.log(JSON.stringify(data));
    const encoded = encode(data);
    return deflateSync(encoded);
}

export function decompressState(data: Uint8Array): RouletteState {
    return decode(inflateSync(data)) as RouletteState;
}
