# Lil8TD Sprite Set V2 Tasklist

Status: active production tasklist derived from `LIL8TD_ART_BRIEF_V2.md`.

Goal: turn Art Brief V2 into a compact, execution-friendly asset plan for the next real visual pass.

Direction lock:
**Cozy RTS Miniatures + Dandadan Accents**

---

## 1. Scope of this tasklist

This is not a general wishlist.
This is the minimum practical asset plan needed to move Lil8TD from iterative demo-art toward a coherent Sprite Set V2.

Asset groups:
1. terrain assets
2. path assets
3. tower assets
4. enemy assets
5. UI assets
6. FX assets
7. integration/review tasks

---

## 2. Terrain assets

## 2.1 Core grass families
- [x] Grass Family A — base moss field
- [x] Grass Family B — warmer dry moss/earth mix
- [x] Grass Family C — cooler shaded moss

## 2.2 Buildable readability layer
- [x] buildable tile variant pass that stays calm but clearly supports placement readability
- [x] ensure buildable tiles are quieter than towers/enemies

## 2.3 Anti-repetition set
- [x] macro patch variant 1
- [x] macro patch variant 2
- [x] sparse clump overlay
- [x] sparse stone overlay
- [x] tiny flower/mushroom overlay set

## 2.4 Terrain review checks
- [ ] no checkerboard feel
- [ ] no noisy carpet feel
- [ ] phone-screen screenshot still readable
- [ ] path remains the first terrain read

---

## 3. Path assets

## 3.1 Base path set
- [x] Path tile A — compacted dirt center
- [x] Path tile B — worn highlight variation
- [x] Path tile C — stronger shoulder/edge stones
- [x] Path tile D — dustier/worn variation

## 3.2 Path support pieces
- [x] subtle centerline rhythm variant
- [x] side-stone rhythm variant
- [x] low-count decorative roadside accent set

## 3.3 Optional future path pieces
- [ ] turn piece family
- [ ] entrance cap
- [ ] exit cap
- [ ] magical contamination variant (later, not base V2)

## 3.4 Path review checks
- [ ] reads instantly as route
- [ ] does not compete with enemies
- [ ] does not become decorative wallpaper
- [ ] still feels handcrafted and warm

---

## 4. Tower assets

## 4.1 Shared tower grammar pass
- [x] common plinth/base language
- [x] common material family: stone/wood/brass
- [x] integrated shadow pocket/aperture treatment
- [x] integrated trim/highlight logic

## 4.2 Arrow Tower
- [x] new hero silhouette pass
- [x] stronger mast / bow arc / bolt tip read
- [x] pennant refinement
- [x] restrained crimson accent version
- [ ] upgrade stage overlay concept (if time allows)

## 4.3 Burst Tower
- [x] new hero silhouette pass
- [x] cannon / kettle / bomb-body clarity
- [x] ember core accent refinement
- [x] broader horizontal mass read
- [ ] upgrade stage overlay concept (if time allows)

## 4.4 Frost Tower
- [x] new hero silhouette pass
- [x] taller crystal crown / spire refinement
- [x] teal/cyan magical accent pass
- [x] colder silhouette contrast vs warm map base
- [ ] upgrade stage overlay concept (if time allows)

## 4.5 Tower review checks
- [ ] towers are heroes of the board
- [ ] shape difference reads before color difference
- [ ] readable on mobile screenshot
- [ ] stronger than current V1 hand-drawn pass

---

## 5. Enemy assets

## 5.1 Shared enemy grammar pass
- [ ] unify scale logic across grunt/runner/brute
- [ ] ensure HP bars do not swallow silhouettes
- [ ] reinforce tiny-character read rather than token read

## 5.2 Grunt
- [ ] infantry silhouette refinement
- [ ] cap/helmet/horn read
- [ ] shield/arm mass clarification
- [ ] grounded neutral/hostile accent pass

## 5.3 Runner
- [ ] forward-lean silhouette refinement
- [ ] fox-like or darting body read
- [ ] readable speed accent/scarf/ear treatment
- [ ] stronger role read in motion

## 5.4 Brute
- [ ] wide heavy silhouette refinement
- [ ] shoulder/arm mass pass
- [ ] horn/crown heavy threat read
- [ ] darker plum-shadow accent treatment

## 5.5 Optional animation/motion-support
- [ ] 2-frame walk variant for runner
- [ ] 2-frame walk variant for grunt
- [ ] heavy bob or stomp cue for brute

## 5.6 Enemy review checks
- [ ] enemies feel like tiny raiders/creatures
- [ ] silhouette difference survives gameplay scale
- [ ] role read remains instant on lane
- [ ] no muddy overrendering

---

## 6. UI assets

## 6.1 Core frame pieces
- [ ] command slab corner set
- [ ] topbar trim strip
- [ ] panel separator motif
- [ ] button plaque enhancement pieces

## 6.2 Role and state icons
- [ ] Arrow icon
- [ ] Burst icon
- [ ] Frost icon
- [ ] danger marker accent
- [ ] magical/frost marker accent

## 6.3 UI accent pass
- [ ] amber highlight pass
- [ ] crimson danger state accent pass
- [ ] teal role-state accent pass

## 6.4 UI review checks
- [ ] still compact and readable
- [ ] feels from same world as board
- [ ] no generic web-app feeling
- [ ] no overdecorated chrome

---

## 7. FX assets

## 7.1 Arrow FX
- [ ] sharper arrow trail / impact read
- [ ] precise hit punctuation

## 7.2 Burst FX
- [ ] ember / blast core sprite pass
- [ ] weighty impact punctuation

## 7.3 Frost FX
- [ ] crystal/cold impact pass
- [ ] elegant slow marker refinement
- [ ] teal/cyan layering cleanup

## 7.4 Shared combat punctuation
- [ ] hit flash accent logic
- [ ] short impact cap sprites
- [ ] keep render-only safety

## 7.5 FX review checks
- [ ] effects feel juicier but not noisy
- [ ] role-specific identity is stronger
- [ ] combat remains readable on mobile

---

## 8. Integration tasks

## 8.1 Atlas / asset packaging
- [ ] decide whether V2 stays in one atlas or splits by family
- [ ] keep Pages-friendly static asset flow
- [ ] document atlas coordinates / asset mapping clearly

## 8.2 Renderer integration
- [ ] terrain variation mapping pass
- [ ] tower sprite replacement/integration
- [ ] enemy sprite replacement/integration
- [ ] UI frame/icon hookup
- [ ] FX hookup

## 8.3 Safety checks
- [ ] do not break input hit mapping
- [ ] do not break current deterministic smoke result
- [ ] keep fallback/render behavior sane during load

---

## 9. Review / validation tasks

## 9.1 Gameplay-scale review
- [ ] board read at normal desktop scale
- [ ] board read at mobile screenshot scale
- [ ] tower-first read check
- [ ] enemy-second read check
- [ ] path-first terrain check

## 9.2 Aesthetic review
- [ ] feels handcrafted, not procedural
- [ ] feels warm, not bland
- [ ] feels stylized, not cheap-mobile
- [ ] Dandadan energy appears as accent, not wallpaper

## 9.3 Technical review
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run smoke`
- [ ] asset load sanity
- [ ] GitHub Pages deploy sanity

---

## 10. Recommended execution order

### Phase A — terrain + path foundation
1. core grass families
2. anti-repetition macro patches
3. base path set

### Phase B — tower hero pass
4. Arrow hero redraw
5. Burst hero redraw
6. Frost hero redraw

### Phase C — enemy character pass
7. Grunt character pass
8. Runner character pass
9. Brute character pass

### Phase D — FX and UI support
10. tower/enemy role icons
11. attack/hit FX pass
12. small command-frame enhancement

### Phase E — review and tighten
13. mobile screenshot review
14. readability corrections
15. only then optional extra charm pass

---

## 11. Minimum success definition for Sprite Set V2

Sprite Set V2 is successful if:
- terrain no longer feels carpet-repetitive,
- path reads instantly and looks handcrafted,
- towers clearly feel like hero miniatures,
- enemies read as tiny characters instead of markers,
- board/UI feel like one world,
- the whole thing looks obviously better even in a phone screenshot.
