import { encode, decode } from '@msgpack/msgpack';
import { inflateSync, deflateSync, strFromU8, unzlibSync } from 'fflate';
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
    const encoded = encode(data);
    return deflateSync(encoded);
}

function isBase64Character(char: number): boolean {
    // A-Z 65-90
    // a-z 97-122
    // 0-9 48-57
    // + 43
    // / 47
    // = 61
    return (
        (char >= 65 && char <= 90) ||
        (char >= 97 && char <= 122) ||
        (char >= 48 && char <= 57) ||
        char === 43 ||
        char === 47 ||
        char === 61
    );
}

function handleOldSave(data: Uint8Array): RouletteState {
    const decoded = decode(unzlibSync(base64ToBytes(strFromU8(data)))) as any;
    return {
        current: decoded.demon,
        percent: decoded.percent,
        percents: decoded.percents,
        playing: decoded.playing,
        selectedLists: {
            main: decoded.main,
            extended: decoded.extended,
            legacy: decoded.legacy,
        },
        demons: decoded.demons.map((demon: any[]) => {
            return {
                position: demon[0],
                name: demon[1],
                creator: demon[2],
                video: demon[3],
                // no level id :(
            } as SimplifiedDemon;
        }),
    };
}

export function decompressState(data: Uint8Array): RouletteState {
    // maybe just check if the file ext is txt
    if (data.every(i => isBase64Character(i))) {
        return handleOldSave(data);
    }
    return decode(inflateSync(data)) as RouletteState;
}
