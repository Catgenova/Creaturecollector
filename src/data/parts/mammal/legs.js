// Mammal legs. Origin = the joint on the body (shoulder or hip). Legs hang down (+y).
// One silhouette per leg. The near hind leg carries a full haunch that overlaps the torso;
// the far copy hides behind it. On upright bodies the forelegs hang as arms.
// Evolutions (evoLegStages): stage 2 grows the limb and bares claws (hoofed kinds get a hoof
// band and fetlock tufts); stage 3 grows it again, lengthens the claws and adds armour bands.
import { mLeg, toes, sock } from './_shared.js';
import { SH, HL, L } from '../_dsl.js';
import { evoLegStages } from '../_evo.js';

const shadeBack = SH('M-14,-16 L-3,-16 L-2,50 L-14,50 Z', 0.12);
const lightFront = HL('M2,-6 L6,-6 L6,20 L3,20 Z', 0.16);

export const M_LEGS_FRONT = [
  mLeg({
    id: 'fox', slot: 'legsFront', name: 'Slim', tags: ['fox'], dom: 0.5, w: 3,
    shapes: [[[-9, -8], [2, -12], [10, -6], [9, 8], [8, 26], [13, 33], [15, 39, 0.3], [9, 43], [-5, 42], [-8, 36], [-8, 26], [-9, 8]]],
    extra: [sock(22, 'a'), shadeBack, lightFront, toes(-2, 12, 42, 2, 3)],
    stages: evoLegStages([-2, 12, 42], 30),
  }),
  mLeg({
    id: 'cat', slot: 'legsFront', name: 'Dainty', tags: ['cat'], dom: 0.5, w: 3,
    shapes: [[[-8, -8], [3, -11], [9, -5], [8, 10], [7, 28], [10, 34], [12, 39, 0.3], [6, 42], [-6, 41], [-8, 35], [-8, 26], [-9, 10]]],
    extra: [sock(32, 's'), shadeBack, lightFront, toes(-2, 10, 41, 2, 3)],
    stages: evoLegStages([-2, 10, 41], 30),
  }),
  mLeg({
    id: 'bear', slot: 'legsFront', name: 'Thick', tags: ['bear'], dom: 0.55, w: 2,
    shapes: [[[-11, -8], [2, -12], [12, -6], [12, 10], [12, 28], [16, 34], [17, 40, 0.3], [9, 44], [-8, 43], [-12, 36], [-12, 26], [-12, 10]]],
    extra: [shadeBack, SH('M-14,34 L20,34 L20,48 L-14,48 Z', 0.1), HL('M2,-6 L7,-6 L7,22 L3,22 Z', 0.14), toes(-6, 14, 43, 3, 4)],
    stages: evoLegStages([-6, 14, 43], 30, { claws: 4 }),
  }),
  mLeg({
    id: 'rabbit', slot: 'legsFront', name: 'Short', tags: ['rabbit'], dom: 0.45, w: 2,
    shapes: [[[-7, -6], [2, -9], [8, -4], [7, 8], [6, 20], [10, 26], [12, 31, 0.3], [6, 34], [-5, 33], [-7, 28], [-7, 20], [-8, 8]]],
    extra: [shadeBack, HL('M2,-4 L5,-4 L5,16 L3,16 Z', 0.16), toes(-2, 10, 33, 2, 2.5)],
    stages: evoLegStages([-2, 10, 33], 22),
  }),

  mLeg({
    id: 'deer', slot: 'legsFront', name: 'Slender', tags: ['deer', 'hoofed'], dom: 0.5, w: 2,
    shapes: [[[-7, -8], [3, -11], [8, -5], [7, 10], [6, 30], [7, 40], [9, 46, 'c'], [8, 50], [-4, 50], [-6, 46], [-5, 40], [-6, 26], [-7, 10]]],
    extra: [sock(43, 'a', -30, 30, 1.5), L('M1,45 L1,50', 'k', 1.2, { op: 0.5 }), SH('M-10,-14 L-2,-14 L-1,54 L-10,54 Z', 0.12), HL('M2,-4 L5,-4 L5,22 L3,22 Z', 0.16)],
    stages: evoLegStages([0, 0, 50], 36, { hoof: [-4, 44] }),
  }),
  mLeg({
    id: 'wolf', slot: 'legsFront', name: 'Sturdy', tags: ['wolf'], dom: 0.55, w: 2,
    shapes: [[[-10, -8], [2, -12], [11, -6], [10, 8], [9, 26], [14, 33], [16, 39, 0.3], [10, 44], [-6, 43], [-10, 36], [-9, 26], [-10, 8]]],
    extra: [shadeBack, SH('M-12,34 L20,34 L20,48 L-12,48 Z', 0.1), lightFront, toes(-4, 14, 43, 3, 3.5)],
    stages: evoLegStages([-4, 14, 43], 30, { claws: 4 }),
  }),
  mLeg({
    id: 'mouse', slot: 'legsFront', name: 'Tiny', tags: ['mouse'], dom: 0.4, w: 3,
    shapes: [[[-6, -6], [2, -8], [7, -3], [6, 8], [5, 18], [9, 22], [10, 26, 0.3], [5, 29], [-4, 28], [-6, 24], [-6, 16], [-7, 8]]],
    extra: [sock(20, 'a', -30, 30, 2), SH('M-9,-10 L-2,-10 L-1,32 L-9,32 Z', 0.12), HL('M2,-3 L4.5,-3 L4.5,12 L2.5,12 Z', 0.16), toes(-2, 8, 28, 2, 2.2)],
    stages: evoLegStages([-2, 8, 28], 18, { claws: 2 }),
  }),
];

export const M_LEGS_BACK = [
  mLeg({
    id: 'fox', slot: 'legsBack', name: 'Springy', tags: ['fox'], dom: 0.5, w: 3,
    shapes: [[[-16, -8], [-4, -16], [10, -12], [18, 0], [16, 12], [11, 22], [8, 30], [12, 36], [13, 41, 0.3], [6, 44], [-6, 43], [-9, 37], [-7, 28], [-8, 20], [-14, 14], [-18, 4]]],
    extra: [
      sock(28, 'a'),
      L('M-10,14 C-2,20 8,18 14,10', 'k', 1.6, { op: 0.3 }),
      SH('M-22,8 C-10,20 4,22 18,12 L22,24 L-22,24 Z', 0.12), SH('M-12,26 L14,26 L14,48 L-12,48 Z', 0.1),
      HL('M-8,-12 C0,-16 8,-12 10,-6 C4,-8 -4,-8 -10,-4 Z', 0.16),
      toes(-4, 10, 43, 2, 3),
    ],
    stages: evoLegStages([-4, 10, 43], 30),
  }),
  mLeg({
    id: 'cat', slot: 'legsBack', name: 'Supple', tags: ['cat'], dom: 0.5, w: 3,
    shapes: [[[-16, -6], [-4, -16], [10, -12], [18, 2], [14, 14], [10, 24], [8, 32], [12, 38], [12, 42, 0.3], [4, 44], [-6, 43], [-9, 36], [-8, 26], [-10, 18], [-16, 10], [-19, 2]]],
    extra: [
      sock(32, 's'),
      L('M-10,12 C-2,18 8,16 14,8', 'k', 1.6, { op: 0.3 }),
      SH('M-22,6 C-10,18 4,20 18,10 L22,22 L-22,22 Z', 0.12), SH('M-12,26 L14,26 L14,48 L-12,48 Z', 0.1),
      HL('M-8,-12 C0,-16 8,-12 10,-6 C4,-8 -4,-8 -10,-4 Z', 0.16),
      toes(-4, 8, 43, 2, 3),
    ],
    stages: evoLegStages([-4, 8, 43], 30),
  }),
  mLeg({
    id: 'bear', slot: 'legsBack', name: 'Stout', tags: ['bear'], dom: 0.55, w: 2,
    shapes: [[[-18, -8], [-4, -18], [12, -14], [20, 0], [18, 14], [14, 26], [14, 34], [18, 40], [18, 43, 0.3], [8, 46], [-8, 45], [-12, 38], [-12, 28], [-12, 18], [-18, 10], [-21, 2]]],
    extra: [
      L('M-12,14 C-2,20 8,18 16,10', 'k', 1.6, { op: 0.3 }),
      SH('M-24,8 C-10,22 6,22 20,10 L24,24 L-24,24 Z', 0.12), SH('M-14,36 L22,36 L22,50 L-14,50 Z', 0.1),
      HL('M-8,-14 C0,-18 10,-14 12,-8 C6,-10 -4,-10 -10,-6 Z', 0.14),
      toes(-6, 14, 45, 3, 4),
    ],
    stages: evoLegStages([-6, 14, 45], 32, { claws: 4 }),
  }),
  mLeg({
    id: 'rabbit', slot: 'legsBack', name: 'Haunch', tags: ['rabbit'], dom: 0.55, w: 2,
    shapes: [[[-18, -6], [-6, -18], [10, -16], [20, -2], [18, 12], [12, 22], [10, 30], [22, 34], [26, 38, 0.3], [22, 42], [-4, 42], [-10, 38], [-10, 28], [-12, 18], [-18, 10], [-22, 2]]],
    extra: [
      L('M-12,14 C-2,20 8,18 16,8', 'k', 1.6, { op: 0.3 }),
      SH('M-24,6 C-10,20 6,22 20,8 L24,24 L-24,24 Z', 0.12), SH('M-14,32 L30,32 L30,46 L-14,46 Z', 0.1),
      HL('M-10,-14 C0,-18 10,-14 12,-8 C6,-10 -4,-10 -10,-6 Z', 0.14),
      toes(2, 22, 41, 3, 3),
    ],
    stages: evoLegStages([2, 22, 41], 28, { claws: 4 }),
  }),

  mLeg({
    id: 'deer', slot: 'legsBack', name: 'Lithe', tags: ['deer', 'hoofed'], dom: 0.5, w: 2,
    shapes: [[[-16, -8], [-4, -16], [10, -12], [18, 0], [16, 12], [10, 22], [6, 32], [8, 42], [9, 48, 'c'], [8, 52], [-4, 52], [-6, 48], [-5, 40], [-7, 28], [-10, 18], [-16, 10], [-19, 2]]],
    extra: [
      sock(45, 'a', -30, 30, 1.5), L('M1,47 L1,52', 'k', 1.2, { op: 0.5 }),
      L('M-10,12 C-2,18 8,16 14,8', 'k', 1.6, { op: 0.3 }),
      SH('M-22,6 C-10,18 4,20 18,10 L22,22 L-22,22 Z', 0.12), SH('M-10,28 L12,28 L12,56 L-10,56 Z', 0.1),
      HL('M-8,-12 C0,-16 8,-12 10,-6 C4,-8 -4,-8 -10,-4 Z', 0.16),
    ],
    stages: evoLegStages([0, 0, 52], 38, { hoof: [-4, 46] }),
  }),
  mLeg({
    id: 'wolf', slot: 'legsBack', name: 'Powerful', tags: ['wolf'], dom: 0.55, w: 2,
    shapes: [[[-18, -8], [-4, -18], [12, -14], [20, 0], [18, 12], [12, 22], [9, 30], [13, 36], [14, 42, 0.3], [7, 45], [-7, 44], [-10, 37], [-8, 28], [-9, 20], [-15, 14], [-20, 4]]],
    extra: [
      L('M-12,14 C-2,20 8,18 16,10', 'k', 1.6, { op: 0.3 }),
      SH('M-24,8 C-10,22 6,22 20,10 L24,24 L-24,24 Z', 0.12), SH('M-12,34 L18,34 L18,48 L-12,48 Z', 0.1),
      HL('M-8,-14 C0,-18 10,-14 12,-8 C6,-10 -4,-10 -10,-6 Z', 0.14),
      toes(-6, 14, 44, 3, 3.5),
    ],
    stages: evoLegStages([-6, 14, 44], 30, { claws: 4 }),
  }),
  mLeg({
    id: 'mouse', slot: 'legsBack', name: 'Nimble', tags: ['mouse'], dom: 0.4, w: 3,
    shapes: [[[-12, -6], [-2, -12], [8, -8], [12, 2], [10, 12], [8, 20], [12, 26], [13, 30, 0.3], [6, 33], [-4, 32], [-8, 27], [-7, 18], [-10, 10], [-13, 2]]],
    extra: [
      sock(24, 'a', -30, 30, 2),
      L('M-7,10 C-1,14 6,13 10,7', 'k', 1.4, { op: 0.3 }),
      SH('M-16,4 C-8,14 2,16 12,8 L16,18 L-16,18 Z', 0.12),
      HL('M-6,-10 C0,-12 6,-10 8,-5 C3,-7 -3,-7 -7,-3 Z', 0.16),
      toes(-2, 10, 32, 2, 2.2),
    ],
    stages: evoLegStages([-2, 10, 32], 20, { claws: 2 }),
  }),
];
