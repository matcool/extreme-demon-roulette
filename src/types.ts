export interface PointercrateDemon {
    id: number;
    level_id: number;
    name: string;
    position: number;
    publisher: {
        id: number;
        name: string;
        banned: boolean;
    };
    requirement: number;
    verifier: {
        id: number;
        name: string;
        banned: boolean;
    };
    video: string | null;
}
