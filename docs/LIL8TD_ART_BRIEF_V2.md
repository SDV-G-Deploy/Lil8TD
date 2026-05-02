# Lil8TD Art Brief V2

Status: active production brief for Sprite Set V2.

Source inputs:
- `docs/LIL8TD_VISUAL_RESEARCH_PACK_V1_DANDADAN.md`
- `docs/LIL8TD_VISUAL_DOCTRINE_V1.md`
- LW2B visual/UI principles as internal benchmark

---

## 1. North star

Lil8TD should look like a **warm handcrafted fantasy miniatures battlefield**.

Not a generic web demo.  
Not a noisy anime poster.  
Not a cheap mobile TD.

Target feeling:
- cozy
- crafted
- old-school
- readable
- charming
- slightly strange/magical
- small heroic tower pieces vs tiny invading raiders

Working direction:

**Cozy RTS Miniatures**  
plus  
**Dandadan-style accent energy**

Meaning:
- calm and earthy base world
- energetic, higher-contrast combat accents
- stronger silhouette drama in towers/enemies
- selective supernatural color spikes

---

## 2. Visual identity in one sentence

**Lil8TD is a handcrafted old-school RTS miniature board with selective crimson/teal supernatural energy used to make towers, enemies, and combat feel more iconic.**

---

## 3. Style pillars

### 3.1 Calm board, vivid gameplay
Terrain must stay calmer than towers, enemies, and FX.

### 3.2 Silhouette before detail
Every gameplay-critical object must read by shape first.

### 3.3 Crafted material language
The world should feel built from:
- moss
- earth
- dusty stone
- dark wood
- bronze/brass
- parchment

### 3.4 Accent as punctuation, not wallpaper
Crimson / teal / amber are for emphasis, not for flooding the whole screen.

### 3.5 Tiny characters, not tokens
Enemies should feel like little raiders/creatures with personality.

### 3.6 Towers are hero pieces
Towers should be the visual stars of the board.

---

## 4. Palette doctrine

## 4.1 Base palette
Use these families for most of the screen:
- moss green
- olive green
- muted earth brown
- dusty stone gray-brown
- dark wood brown
- parchment cream
- bronze/brass

These carry:
- ground
- path base
- tower bases
- UI slabs and panels

## 4.2 Accent palette
Use the user-provided palette as the main accent/mood system.

### Warm aggression
- `#B9152A` crimson_red
- `#E23A36` warm_red
- `#6E1324` deep_wine

Use for:
- burst tower heat/core
- enemy hot accents
- danger markers
- hit flashes
- elite hostility cues

### Frost / psychic / supernatural separation
- `#123F46` dark_teal
- `#1C6B69` forest_teal
- `#4FB6A9` cyan_fog
- `#B7D6C8` pale_mist

Use for:
- frost tower identity
- slow/status FX
- mystical enemy families later
- cold atmospheric accents

### Noble ornament
- `#D39A3A` gold_thread
- `#F2B94B` amber_highlight

Use for:
- trims
- insignia
- UI highlights
- selection accents
- rare premium ornament

### Deep shadow system
- `#101018` deep_black
- `#1B1B2A` charcoal_shadow
- `#2A1C2E` dark_plum_shadow

Use for:
- silhouette grounding
- sprite depth
- dramatic combat accents
- richer shadow hierarchy

## 4.3 Hard palette rules
- Base terrain must stay quieter than units.
- Accent colors must not dominate the whole board.
- No acid saturation.
- No pastel softness for core combat reads.
- Use at most 1-2 strong accent families in a single gameplay moment.

---

## 5. Terrain brief

## Goal
Make the field feel like a crafted diorama, not a repeated carpet.

## Required traits
- calm moss board
- visible but quiet tile seams
- clustered variation, not random speckle noise
- rare larger macro patches for anti-repetition
- low-contrast detail frequency

## Needed asset families
- grass family A: base moss
- grass family B: warmer dry patches
- grass family C: cooler shaded moss
- sparse decorative overlays: clumps, stones, tiny flowers, tiny mushrooms
- buildable tile variants that remain readable as build space

## Do not do
- checkerboard variation
- equal detail on every tile
- strong decorative motifs everywhere
- crimson/teal base terrain flooding

---

## 6. Path brief

## Goal
The path is the board spine and must read first.

## Required traits
- compacted earth center
- darker shoulders/rims
- worn highlight bands
- occasional side stones
- occasional very sparse ornament rhythm

## Optional accent logic
- tiny warm banner/flag notes
- subtle magic contamination only on special variants later

## Do not do
- high-contrast decorative path patterns
- path that competes with enemies
- path texture so detailed it breaks lane read

---

## 7. Tower brief

## Tower system rule
All towers should feel like **tiny fortified hero pieces**.

Shared construction grammar:
- base/plinth
- body mass
- clear top silhouette
- readable trim/highlight
- dark aperture/shadow pocket
- role-specific energy accent

## Arrow Tower
Identity:
- dependable precision
- upright posture
- ranged discipline

Shape language:
- mast / bow arc / bolt tip / pennant
- slightly taller profile
- crisp directional tension

Main accents:
- warm neutral base + gold + restrained crimson detail

## Burst Tower
Identity:
- hot explosive alchemy
- heavier and broader
- dangerous core

Shape language:
- kettle cannon / round chamber / bomb mass
- broad horizontal weight
- ember mouth / heated center

Main accents:
- earth/wood base + crimson/warm-red core + amber highlight

## Frost Tower
Identity:
- eerie control / ritual cold / magical precision

Shape language:
- vertical crystal crown
- elegant spire
- colder silhouette tension

Main accents:
- cool teal/cyan energy over neutral stone/wood base

## Tower success test
At gameplay size on a phone screenshot:
- player should notice towers first,
- tell they are different by shape,
- and sense role before reading text.

---

## 8. Enemy brief

## Enemy system rule
Enemies should read like **tiny invading characters**, not lane markers.

## Grunt
Identity:
- baseline raider infantry
- grounded and sturdy

Shape language:
- centered body
- cap/helmet/horns
- shield or solid arm mass

## Runner
Identity:
- speed, trickiness, pressure

Shape language:
- forward lean
- narrow body
- fox-like or darting silhouette
- readable motion streak / scarf / ear language if helpful

## Brute
Identity:
- heavy threat
- slow pressure
- intimidating mass

Shape language:
- wide torso
- large shoulders/arms
- horned or crowned heavy shape

## Enemy success test
At gameplay size:
- grunt = balanced soldier
- runner = fast nuisance
- brute = heavy mass

If this is not obvious in motion, redesign wins over polish.

---

## 9. UI brief

## Goal
UI must feel carved from the same world as the board.

Base language:
- wood
- bronze
- parchment
- inset shadow
- carved command slab

Accent usage:
- amber for premium/readability edges
- crimson for danger/emergency states
- teal for frost/magic-specific states only

## Priorities
- strong hierarchy
- compact command readability
- no generic web-app feeling
- no overdecorated chrome

## Do not do
- anime-tech UI
- too many badge colors at once
- visual competition with gameplay area

---

## 10. FX and motion brief

## Goal
Use visual energy to make combat feel more alive without harming readability.

## Motion doctrine
- render-only smoothing/interpolation is allowed
- tiny bob/facing accents are allowed
- no sim changes for feel

## FX doctrine
- attacks should have directional impulse
- hits should have short, satisfying punctuation
- frost should feel cold and elegant, not noisy
- burst should feel hot and weighty, not just bright
- arrow should feel crisp and precise

## Dandadan influence belongs here most strongly
This is where kinetic accent logic should live.

---

## 11. Readability invariants

These rules override taste experiments:

1. Path reads first.
2. Towers read second.
3. Enemies read third but clearly.
4. Terrain never overpowers gameplay pieces.
5. Accent colors explain role/power, not background decoration.
6. HP/effects remain legible on mobile screenshots.
7. Hit mapping must stay visually honest.
8. No asset beauty is worth gameplay confusion.

---

## 12. Anti-patterns

Do not:
- add more detail just to feel productive
- cover terrain with noise
- make everything equally contrasty
- use Dandadan drama on the whole map all the time
- drift into cheap mobile fantasy TD visuals
- use glow as a replacement for silhouette design
- overrender tiny sprites until they become muddy

---

## 13. Sprite Set V2 scope

Minimum required for V2:
- new terrain family set
- new path family set
- tower redraws (arrow / burst / frost)
- enemy redraws (grunt / runner / brute)
- updated role FX accents
- optional small UI icon/trim set

Preferred extras:
- tower upgrade stage overlays
- 2-frame enemy walk variants
- better projectile impact caps

---

## 14. Review checklist for every asset

Ask:
- Does it read by silhouette?
- Does it hold up on phone screenshots?
- Is it quieter or louder than it should be?
- Does it belong to the same world as the rest?
- Is the accent usage disciplined?
- Is this beauty, or just more pixels?

---

## 15. Production recommendation

Next correct execution step:

1. lock this brief,
2. make a clean Sprite Set V2 pass against it,
3. review only from gameplay scale and mobile screenshots,
4. reject subtle diffs that do not produce emotional improvement.

---

## 16. One-sentence brief

**Build Lil8TD Sprite Set V2 as a cozy handcrafted RTS miniature battlefield with calm earthy terrain, heroic tower silhouettes, tiny characterful enemies, and selective Dandadan-style crimson/teal combat energy.**
