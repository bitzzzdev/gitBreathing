# GitBreathing

Contribution-powered, deterministic **animated ASCII breathing art** for GitHub and GitLab profile READMEs. Your activity controls the slash's intensity, density, secondary cuts and particle field. The renderer produces an animated ASCII SVG, GIF, PNG preview, plain-text frame and metadata.

- Fourteen breathing styles with individual motion motifs and colour palettes.
- Combine and reorder styles to build layered techniques.
- ASCII-first rendering at 64 × 30 character cells, with animated SVG and GIF output.
- Contribution power changes the density and complexity of the art.
- Deterministic output for the same user, seed, style order, contribution count and renderer version.
- No characters, character sprites, ranks, hosted backend, telemetry or central token storage.
- Runs locally or in the user's own GitHub Actions / GitLab CI environment.

## Preview

<p align="center">
  <img src="https://raw.githubusercontent.com/bitzzdev/gitBreathing/main/dist/slash.svg" width="480" alt="Animated GitBreathing ASCII artwork">
</p>

The generated SVG is animated and works in GitHub READMEs without JavaScript. The GIF is provided for clients that do not animate SVG.

## Breathing styles

| Style | Visual language | Branch |
| --- | --- | --- |
| Sun | Solar arcs, radiating spokes and central slash | Origin |
| Moon | Layered crescents and curved cuts | Sun |
| Water | Flowing waves and rolling currents | Sun |
| Flame | Rising flame tongues and burning arcs | Sun |
| Thunder | High-speed lightning and angular cuts | Sun |
| Wind | Rotating gusts and sickle-like arcs | Sun |
| Stone | Heavy fractures and rock shards | Sun |
| Insect | Fine wing-like arcs and precise stings | Water |
| Serpent | Winding paths and coiling trails | Water |
| Flower | Petal loops and graceful circular cuts | Water |
| Love | Elastic ribbon-like curves | Flame |
| Sound | Concentric shock rings and rhythmic pulses | Thunder |
| Beast | Unpredictable claw marks | Wind |
| Mist | Obscuring fog banks and disappearing cuts | Wind |

The style lineage and colour families are based on the reference material listed under Attribution. The renderer creates original ASCII motion motifs, not screenshots, character art or copied anime frames. In the source material, most elemental visuals represent the swordsman's movements and are not literal elemental attacks.

## Quick start

Requires Node.js 22 or newer.

```sh
npm install
cp config.example.json gitbreathing.json
# Edit gitbreathing.json, then render with a contribution count.
CONTRIBUTIONS=1200 npm run render
```

Generated files:

| File | Purpose |
| --- | --- |
| `dist/slash.svg` | Animated ASCII SVG for GitHub README |
| `dist/slash.gif` | Animated raster fallback |
| `dist/slash.png` | Static first-frame preview |
| `dist/slash.txt` | Plain-text ASCII frame |
| `dist/metadata.json` | Inputs, power, styles and output metadata |

## Test locally

```sh
npm run build
CONTRIBUTIONS=0 npm run render
CONTRIBUTIONS=1200 npm run render
CONTRIBUTIONS=5000 npm run render
```

Each render overwrites `dist/`. Inspect `dist/metadata.json` for the resolved contribution power and selected styles. For deterministic output, run the same config, seed and contribution count twice and compare the SHA-256 hashes of the generated files.

## Embed in a profile README

```html
<p align="center">
  <img src="https://raw.githubusercontent.com/USERNAME/REPOSITORY/BRANCH/dist/slash.svg" width="480" alt="Animated GitBreathing ASCII artwork">
</p>
```

Use the GIF if the target Markdown renderer does not animate SVG:

```md
![GitBreathing animated slash](https://raw.githubusercontent.com/USERNAME/REPOSITORY/BRANCH/dist/slash.gif)
```

## Configuration

Copy `config.example.json` to `gitbreathing.json`.

| Key | Description |
| --- | --- |
| `username` | Account whose activity determines power |
| `platform` | `github`, `gitlab` or `custom` |
| `styles` | Ordered styles, e.g. `["sun", "water", "mist"]` |
| `styleWeights` | Per-style intensity multiplier |
| `styleColors` | Optional per-style colour palette |
| `maxContributions` | Activity count at which maximum power is reached |
| `frames` / `fps` | GIF frame count and frame rate |
| `powerCurve` | Contribution response curve |
| `seed` | Optional explicit deterministic seed |
| `outputDir` | Generated asset directory |

The maximum art canvas is 64 × 30 characters. Higher contribution power increases the number of active slash layers, motif complexity and particle density. The selected styles, order, seed and user identity affect the composition.

## GitHub Actions

Copy `.github/workflows/gitbreathing.yml` into the repository containing `gitbreathing.json`. The workflow runs daily, manually and on repository pushes other than generated `dist/` updates. It queries the configured GitHub account's contribution calendar, generates the assets and commits them.

Enable **Settings → Actions → General → Workflow permissions → Read and write permissions** if the workflow cannot push. If your repository policy restricts the default token, use a repository-scoped token stored as `GH_TOKEN`. The token is consumed only inside your runner.

GitHub's `totalContributions` includes qualifying commits, pull requests, issues and code reviews. It is not a commit-only metric.

## GitLab CI/CD

The included `.gitlab-ci.yml` runs on schedules, manual pipelines and repository pushes. Add a masked `GITLAB_TOKEN` CI/CD variable with API read and repository write access. The sample pipeline counts GitLab Events API activity over a one-year window. This is an approximation, not a canonical contribution-calendar total. You can override it by setting `CONTRIBUTIONS` as a CI/CD variable.

## Cost and privacy

GitBreathing has no central service. Rendering runs in the user's browser, local environment or CI runner. API requests, CI minutes and storage use the user's own platform account and quotas. GitBreathing does not collect contribution data or credentials.

## Attribution

Created by **Dev Borah**:
- GitHub: https://github.com/bitzzdev
- GitLab: https://gitlab.com/bitzzdev

**ASCII renderer:** [ascii.rest](https://ascii.rest/) by [@bas3line](https://github.com/bas3line), MIT licensed. GitBreathing uses the package API to play custom ASCII pieces and generate animated SVGs. No ascii.rest source files have been copied into this repository. See [ascii.rest documentation](https://ascii.rest/docs/) and [its MIT licence](https://github.com/bas3line/ascii/blob/main/LICENSE).

**Breathing-style reference:** [Breathing Style, Kimetsu no Yaiba Wiki](https://kimetsu-no-yaiba.fandom.com/wiki/Breathing_Style), plus the linked style pages for the lineage and visual motifs. The wiki community content is licensed under [CC BY-SA](https://creativecommons.org/licenses/by-sa/3.0/) unless otherwise noted. GitBreathing uses it as a factual reference and does not copy its prose or artwork. GitBreathing is an independent fan-made project and is not affiliated with or endorsed by the author or publisher of Demon Slayer.

## License

GitBreathing's original source code is MIT licensed. Third-party dependencies retain their respective licences.
