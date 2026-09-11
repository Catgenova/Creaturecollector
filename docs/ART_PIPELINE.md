# Art pipeline: AI-drawn parts, engine-assembled creatures

The engine keeps doing what it is good at (assembling, recolouring, animating,
fusing); the drawing comes from an image model. Parts are generated per class,
each class with its own skeleton, so fusions stay inside one anatomy.

## Ground rules for every image

- **One style, locked by a reference.** Generate one full creature first, keep
  it in the conversation as the style reference, and open every later prompt
  with "same style as the reference".
- **Side view facing right**, head slightly turned so both eyes show. Light
  from the top-left. Nothing behind the creature.
- **Look:** clean 2D game illustration, bold dark outline of even weight, flat
  cel shading with one shadow tone and one highlight, no texture noise, no
  gradients across the whole body, no background, no text, no ground shadow.
- **Colour:** fur, scales, skin and feathers in **light grey with darker grey
  shading**. The engine tints grey to the creature's palette; white areas stay
  light (belly, chest), and fixed-colour details (claws, beak, horns, teeth,
  eye whites) are drawn in their natural colour and are not tinted.
- **Transparent background** (ChatGPT image generation can output transparent
  PNGs when asked; Midjourney needs a background-removal pass).
- **One part per image, centred, large, nothing cropped.** Square canvas.
- **Attachment stubs.** Heads end in a flat-cut neck stub; legs start with a
  flat hip stub; wings, tails, fins and crests have a short flat root. Stubs
  are hidden behind the body when assembled.

## Skeletons (one per class)

Slots in order of drawing, back to front. `x N` means the same image is placed
N times (far copies are tinted darker automatically).

| Class | Body pose | Slots |
|---|---|---|
| Mammal | quadruped or upright biped | tail, back leg x2, front leg x2, body, arm x2 (bipeds), head, ears/horns |
| Reptile | low quadruped or serpent coil | tail, back spines, leg x4 (or none), body, head, crest/horns |
| Fish | horizontal fish body, face on body | tail fin, dorsal fin, body, pectoral fin x2, crest |
| Bird | upright oval body | tail feathers, far wing, leg x2, body, near wing, head with beak, crest |
| Insect | thorax and abdomen | abdomen tip/stinger, wing x2, leg x6, thorax+abdomen, head, antennae |
| Invertebrate | soft body or shell | tail/siphon, shell, tentacle or limb x4, body, face |
| Amphibian | squat body | tail (newts) or none, back leg x2, body, front leg x2, head |

Eyes and mouths are baked into heads for raster parts. Expression variants
(angry, sleepy, happy) are later head images, not separate parts.

## Batch 0: style test (do this first, 4 images)

1. A full mammal creature in the target style: fox-like quadruped, light grey
   fur with a white belly, orange eyes, bold outline, transparent background.
   This becomes the reference.
2. Same style: a mammal head only, fox-like, facing right, flat-cut neck stub
   at the bottom, light grey fur, transparent background, centred.
3. Same style: a mammal quadruped body only, no head, no legs, no tail, with
   flat-cut stubs where the neck, hips and tail attach, light grey fur with
   white belly, transparent background.
4. Same style: a single mammal front leg only, hanging straight down, flat-cut
   hip stub at the top, light grey fur, dark paw pads, transparent background.

Judge the four together: does the head sit on the body at the stub? Are the
outline weights the same? Does the grey tint cleanly? Adjust wording until
they match, then the batches below follow the same template per slot.

## Batch 1: mammals (about 24 images)

- Bodies: quadruped slim, quadruped heavy, biped round, biped upright (4)
- Heads: fox, cat, bear cub, rodent, hoofed, wolf (6)
- Ears/horns: pointed ears, round ears, long ears, curved horns, antlers (5)
- Legs: canine, hoof, paw-heavy, stubby (4)
- Arms: paw, claw (2)
- Tails: fluffy, thin, tufted (3)

Then reptiles, birds, fish, insects, invertebrates, amphibians in that order,
about 20 images each.

## What the engine does with them

1. Drop PNGs into `assets/parts/<class>/<slot>/<name>.png`.
2. Open the Parts tab anchor editor: click the attachment point(s) on each
   image, set the draw scale, save. Anchors are stored in a JSON manifest next
   to the images.
3. The build packs images into a sprite atlas and base64-embeds it, so the
   single-file `index.html` still holds everything (expect a few megabytes).
4. Recolour: grey pixels are tinted with the creature's palette colour for that
   slot using the existing paint genes; white stays light; saturated pixels
   (claws, eyes, beaks) are left alone.
5. Animation, fusion, battle, arena and saves are unchanged.
