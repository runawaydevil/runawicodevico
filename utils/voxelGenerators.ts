
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { VoxelData } from '../types';
import { COLORS, CONFIG } from './voxelConstants';

// Helper to prevent overlapping voxels
function setBlock(map: Map<string, VoxelData>, x: number, y: number, z: number, color: number) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const rz = Math.round(z);
    const key = `${rx},${ry},${rz}`;
    map.set(key, { x: rx, y: ry, z: rz, color });
}

function generateSphere(map: Map<string, VoxelData>, cx: number, cy: number, cz: number, r: number, col: number, sy = 1) {
    const r2 = r * r;
    const xMin = Math.floor(cx - r);
    const xMax = Math.ceil(cx + r);
    const yMin = Math.floor(cy - r * sy);
    const yMax = Math.ceil(cy + r * sy);
    const zMin = Math.floor(cz - r);
    const zMax = Math.ceil(cz + r);

    for (let x = xMin; x <= xMax; x++) {
        for (let y = yMin; y <= yMax; y++) {
            for (let z = zMin; z <= zMax; z++) {
                const dx = x - cx;
                const dy = (y - cy) / sy;
                const dz = z - cz;
                if (dx * dx + dy * dy + dz * dz <= r2) {
                    setBlock(map, x, y, z, col);
                }
            }
        }
    }
}

export const Generators = {
    RunawayDevil: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const EX = 0;

        // Hellish Terrain (Scorched Earth & Magma)
        for (let x = -7; x <= 7; x++) {
            for (let z = -5; z <= 5; z++) {
                if (Math.random() > 0.6) {
                    const y = CONFIG.FLOOR_Y + Math.random();
                    // Mix of dark rock and hot orange magma
                    const isMagma = Math.random() > 0.8;
                    setBlock(map, x, y, z, isMagma ? COLORS.ORANGE : COLORS.BLACK);
                }
            }
        }
        
        const FOOT_Y = CONFIG.FLOOR_Y + 1.5;
        
        // Dynamic Pose: Running
        // Left Leg (Back, propelling)
        for(let i=0; i<6; i++) {
             setBlock(map, -1 - i*0.5, FOOT_Y + i, -1 - i*0.5, COLORS.DARK_RED);
        }
        // Right Leg (Forward, knee up)
        setBlock(map, 2, FOOT_Y, 2, COLORS.DARK_RED); // Foot
        setBlock(map, 2, FOOT_Y+1, 2, COLORS.DARK_RED);
        setBlock(map, 2, FOOT_Y+2, 1, COLORS.DARK_RED);
        setBlock(map, 2, FOOT_Y+3, 0, COLORS.DARK_RED); // Thigh connects
        
        // Hips
        const HIP_Y = FOOT_Y + 5;
        for(let x=-2; x<=2; x++) for(let z=-1; z<=1; z++) setBlock(map, x, HIP_Y, z, COLORS.RED);

        // Torso (Leaning forward slightly)
        for(let y=0; y<6; y++) {
             const lean = y * 0.3;
             generateSphere(map, 0, HIP_Y + y, lean, 2.8 - y*0.2, COLORS.RED);
        }

        // Head
        const HEAD_Y = HIP_Y + 7;
        const HEAD_Z = 1.5;
        generateSphere(map, 0, HEAD_Y, HEAD_Z, 2.5, COLORS.RED);

        // Horns
        setBlock(map, -1.5, HEAD_Y + 2, HEAD_Z, COLORS.WHITE);
        setBlock(map, -2.2, HEAD_Y + 3, HEAD_Z + 0.5, COLORS.WHITE);
        setBlock(map, 1.5, HEAD_Y + 2, HEAD_Z, COLORS.WHITE);
        setBlock(map, 2.2, HEAD_Y + 3, HEAD_Z + 0.5, COLORS.WHITE);

        // Face
        setBlock(map, -1, HEAD_Y, HEAD_Z + 2.2, COLORS.GOLD); // Eye
        setBlock(map, 1, HEAD_Y, HEAD_Z + 2.2, COLORS.GOLD); // Eye
        setBlock(map, 0, HEAD_Y - 1.5, HEAD_Z + 2.2, COLORS.BLACK); // Grin

        // Arms
        // Left Arm (Swinging forward)
        for(let i=0; i<5; i++) setBlock(map, -3, HIP_Y + 4 - i*0.2, HEAD_Z + i*0.8, COLORS.RED);
        // Right Arm (Holding trident back)
        for(let i=0; i<5; i++) setBlock(map, 3, HIP_Y + 4 + i*0.2, HEAD_Z - i*0.5, COLORS.RED);

        // Trident
        const HAND_X = 4; const HAND_Y = HIP_Y + 5; const HAND_Z = HEAD_Z - 2;
        for(let y=-4; y<8; y++) setBlock(map, HAND_X, HAND_Y + y, HAND_Z, COLORS.BLACK); // Pole
        // Fork
        setBlock(map, HAND_X, HAND_Y + 8, HAND_Z, COLORS.BLACK);
        setBlock(map, HAND_X-1, HAND_Y + 9, HAND_Z, COLORS.BLACK);
        setBlock(map, HAND_X+1, HAND_Y + 9, HAND_Z, COLORS.BLACK);
        setBlock(map, HAND_X, HAND_Y + 10, HAND_Z, COLORS.GOLD); // Tips
        setBlock(map, HAND_X-1, HAND_Y + 10, HAND_Z, COLORS.GOLD);
        setBlock(map, HAND_X+1, HAND_Y + 10, HAND_Z, COLORS.GOLD);

        // Tail
        for(let i=0; i<8; i++) {
             const ty = Math.sin(i * 0.5) * 1;
             setBlock(map, 0, HIP_Y - 1 + ty, -2 - i, COLORS.RED);
        }
        setBlock(map, 0, HIP_Y + 1, -10, COLORS.ORANGE); // Tip

        return Array.from(map.values());
    },

    Cat: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const CY = CONFIG.FLOOR_Y + 1; const CX = 0, CZ = 0;
        // Paws
        generateSphere(map, CX - 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
        generateSphere(map, CX + 3, CY + 2, CZ, 2.2, COLORS.DARK, 1.2);
        // Body
        for (let y = 0; y < 7; y++) {
            const r = 3.5 - (y * 0.2);
            generateSphere(map, CX, CY + 2 + y, CZ, r, COLORS.DARK);
            generateSphere(map, CX, CY + 2 + y, CZ + 2, r * 0.6, COLORS.WHITE);
        }
        // Legs
        for (let y = 0; y < 5; y++) {
            setBlock(map, CX - 1.5, CY + y, CZ + 3, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 3, COLORS.WHITE);
            setBlock(map, CX - 1.5, CY + y, CZ + 2, COLORS.WHITE); setBlock(map, CX + 1.5, CY + y, CZ + 2, COLORS.WHITE);
        }
        // Head
        const CHY = CY + 9;
        generateSphere(map, CX, CHY, CZ, 3.2, COLORS.LIGHT, 0.8);
        // Ears
        [[-2, 1], [2, 1]].forEach(side => {
            setBlock(map, CX + side[0], CHY + 3, CZ, COLORS.DARK); setBlock(map, CX + side[0] * 0.8, CHY + 3, CZ + 1, COLORS.WHITE);
            setBlock(map, CX + side[0], CHY + 4, CZ, COLORS.DARK);
        });
        // Tail
        for (let i = 0; i < 12; i++) {
            const a = i * 0.3, tx = Math.cos(a) * 4.5, tz = Math.sin(a) * 4.5;
            if (tz > -2) { setBlock(map, CX + tx, CY, CZ + tz, COLORS.DARK); setBlock(map, CX + tx, CY + 1, CZ + tz, COLORS.DARK); }
        }
        // Face
        setBlock(map, CX - 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD); setBlock(map, CX + 1, CHY + 0.5, CZ + 2.5, COLORS.GOLD);
        setBlock(map, CX - 1, CHY + 0.5, CZ + 3, COLORS.BLACK); setBlock(map, CX + 1, CHY + 0.5, CZ + 3, COLORS.BLACK);
        setBlock(map, CX, CHY, CZ + 3, COLORS.TALON);
        return Array.from(map.values());
    },

    Rabbit: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        const LOG_Y = CONFIG.FLOOR_Y + 2.5;
        const RX = 0, RZ = 0;
        // Log
        for (let x = -6; x <= 6; x++) {
            const radius = 2.8 + Math.sin(x * 0.5) * 0.2;
            generateSphere(map, x, LOG_Y, 0, radius, COLORS.DARK);
            if (x === -6 || x === 6) generateSphere(map, x, LOG_Y, 0, radius - 0.5, COLORS.WOOD);
            if (Math.random() > 0.8) setBlock(map, x, LOG_Y + radius, (Math.random() - 0.5) * 2, COLORS.GREEN);
        }
        // Body
        const BY = LOG_Y + 2.5;
        generateSphere(map, RX - 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
        generateSphere(map, RX + 1.5, BY + 1.5, RZ - 1.5, 1.8, COLORS.WHITE);
        generateSphere(map, RX, BY + 2, RZ, 2.2, COLORS.WHITE, 0.8);
        generateSphere(map, RX, BY + 2.5, RZ + 1.5, 1.5, COLORS.WHITE);
        setBlock(map, RX - 1.2, BY, RZ + 2.2, COLORS.LIGHT); setBlock(map, RX + 1.2, BY, RZ + 2.2, COLORS.LIGHT);
        setBlock(map, RX - 2.2, BY, RZ - 0.5, COLORS.WHITE); setBlock(map, RX + 2.2, BY, RZ - 0.5, COLORS.WHITE);
        generateSphere(map, RX, BY + 1.5, RZ - 2.5, 1.0, COLORS.WHITE);
        // Head
        const HY = BY + 4.5; const HZ = RZ + 1;
        generateSphere(map, RX, HY, HZ, 1.7, COLORS.WHITE);
        generateSphere(map, RX - 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
        generateSphere(map, RX + 1.1, HY - 0.5, HZ + 0.5, 1.0, COLORS.WHITE);
        // Ears
        for (let y = 0; y < 5; y++) {
            const curve = y * 0.2;
            setBlock(map, RX - 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX - 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
            setBlock(map, RX - 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
            setBlock(map, RX + 0.8, HY + 1.5 + y, HZ - curve, COLORS.WHITE); setBlock(map, RX + 1.2, HY + 1.5 + y, HZ - curve, COLORS.WHITE);
            setBlock(map, RX + 1.0, HY + 1.5 + y, HZ - curve + 0.5, COLORS.LIGHT);
        }
        setBlock(map, RX - 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK); setBlock(map, RX + 0.8, HY + 0.2, HZ + 1.5, COLORS.BLACK);
        setBlock(map, RX, HY - 0.5, HZ + 1.8, COLORS.TALON);
        return Array.from(map.values());
    },

    TwinDevils: (): VoxelData[] => {
        const map = new Map<string, VoxelData>();
        
        function buildMiniDevil(offsetX: number, offsetZ: number) {
             const FOOT_Y = CONFIG.FLOOR_Y + 1;
             
             // Legs
             setBlock(map, offsetX-1, FOOT_Y, offsetZ, COLORS.DARK_RED);
             setBlock(map, offsetX+1, FOOT_Y, offsetZ, COLORS.DARK_RED);
             
             // Body
             const HIP_Y = FOOT_Y + 2;
             generateSphere(map, offsetX, HIP_Y+2, offsetZ, 2, COLORS.RED);
             
             // Head
             const HEAD_Y = HIP_Y + 5;
             generateSphere(map, offsetX, HEAD_Y, offsetZ, 1.5, COLORS.RED);
             
             // Horns
             setBlock(map, offsetX-1, HEAD_Y+2, offsetZ, COLORS.WHITE);
             setBlock(map, offsetX+1, HEAD_Y+2, offsetZ, COLORS.WHITE);
             
             // Trident
             for(let y=0; y<6; y++) setBlock(map, offsetX+3, HIP_Y+y, offsetZ+1, COLORS.BLACK);
             setBlock(map, offsetX+3, HIP_Y+6, offsetZ+1, COLORS.GOLD);
        }

        buildMiniDevil(-5, 0);
        buildMiniDevil(5, 0);
        
        // Some shared fire
        for(let i=0; i<20; i++) {
             setBlock(map, (Math.random()-0.5)*15, CONFIG.FLOOR_Y, (Math.random()-0.5)*5, COLORS.ORANGE);
        }

        return Array.from(map.values());
    }
};
