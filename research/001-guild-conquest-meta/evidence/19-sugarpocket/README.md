# Sugar Pocket skill and rune dataset (client 1.4.002)

| | |
|---|---|
| Source | `https://cookieruncrumble.app/sugar-pocket/assets/index-CAL2QT8S.js` |
| Fetched | 2026-09-27 |
| Capture | `skills-runes-1.4.002.json` |
| sha256 of `skills-runes-1.4.002.json` | `c13734631959a3ebab1012bb77d0783ae58ad58917c0959bc8d9b0299fddcfd2` |
| sha256 of the bundle `index-CAL2QT8S.js` | `a17de1ae3490eda848ffa3704174685e7b9d179a5cee42cc4f6792b04b2ad80e` |
| Cited as | `web:sugarpocket-bundle-1.4.002` |

## What the capture is

`skills-runes-1.4.002.json` is the JSON literal the bundle passes to `JSON.parse(`…`)` (the call starts at character offset 6172890 of `index-CAL2QT8S.js`). It was extracted from the bundle, pretty-printed, and checked to be deep-equal to the parsed literal. It isn't a response from any API.

Top-level keys: `slots`, `pools`, `rerollCosts`, `recommendations`, `stageBosses`.

`recommendations[<cookie gameId>]` holds `{ version, grades }`. `grades` is keyed by skill grade (`"0"`, `"1"`, `"3"`, `"5"`, `"7"`, `"9"`), and each grade holds `heals`, `damages`, `buffs`, `debuffs`, `otherEffects`, `cooldowns` and `sources` (the skill asset ids the values came from).

- A buff carries `effectType`, `rawValue` (basis points: `7000` = 70%), `base` (`Fixed`, `CastersAttackPoint` or `CastersHealthPoint`) and `maxStack`.
- A debuff carries `effect`, `effectType`, `maxStack` and `basePercent`, the debuff's base application chance in percent (not its magnitude).

Cookie gameIds map to names through the Sugar Pocket catalog capture `../12-glossary-src/cookieruncrumble_app_api_catalog_gameplay.json` (`cookies[].gameId`, `name.ko`). A cookie's `starGrowth[].skillStep` says which skill step each star count reaches. The grade keys, in ascending order, are skill steps 0 upward, and each step is first reached at the star count equal to its grade key.

## Formulas, quoted from the bundle

Every formula clamps its inputs with this helper:

```js
var Or=(e,t,n)=>Number.isFinite(e)?Math.min(n,Math.max(t,e)):t;
```

**Stat layering** (inside `function Gn(e,t,n,r=100)`, where `n` maps effect types to summed values):

```js
a=(e,t,r)=>Math.max(0,Math.floor(e*(1+(n[r]||0)/100)+(n[t]||0)))
…attack:a(i.attack,`AttackPointAddition`,`AttackPointMultiplier`),defense:a(i.defense,`DefensePointAddition`,`DefensePointMultiplier`),hp:a(i.hp,`HealthPointAddition`,`HealthPointMultiplier`)
```

stat = `floor(base × (1 + Multiplier/100) + Addition)`

**Skill damage** (`Ar`):

```js
function Ar(e,t,n=0){return Math.max(0,Math.floor(Or(e,0,0xe8d4a51000)*Math.fround(Or(t,0,1e6))*(1+Or(n,0,1e4)/100)))}
```

skill damage = `floor(ATK × fround(coef) × (1 + skillAmp/100))`

**Buff scaling** (`jr`):

```js
function jr(e,t,n=0){return Math.floor(Or(e,0,0xe8d4a51000)*t*(1+Or(n,0,1e4)/100))/1e4}
```

buff = `floor(base × rawValue × (1 + casterSkillAmp/100)) / 1e4`

**Debuff application chance** (`Mr`):

```js
function Mr(e){let t=BigInt(Math.round(Or(e.focus,0,1e9)*1e4)),n=BigInt(Math.round(Or(e.resistance,0,1e9)*1e4)),r=n>0n?t*10000n/n:10000n,i=BigInt(Math.round(Or(e.focusPercent??0,-1e4,1e4)*100)),a=BigInt(Math.round(Or(e.resistancePercent??0,-1e4,1e4)*100)),o=r+i-a,s=BigInt(Math.round(Or(e.basePercent,0,100)*100))*o/10000n;return{nominalPercent:Or(Number(s)/100,0,100),discretePercent:Or((Number(s)+1)/100,0,100),multiplier:Number(o)/1e4}}
```

debuff chance = `basePercent × (focus/resist + focus% − resist%)`
