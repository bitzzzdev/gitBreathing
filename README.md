# GitBreathing

Procedural, deterministic breathing-style pixel slash art for GitHub and GitLab profile READMEs. Contribution activity controls the slash's strength, density and detail. GitBreathing produces **both SVG and animated GIF**, plus a PNG preview and metadata.

- No character sprites or rank system. Only breathing-style slash effects.
- Sun, Moon, Water and Mist layers can be combined and reordered.
- Username, style composition and configuration seed the renderer, producing reproducible user-specific artwork.
- Contribution power scales from faint, sparse art to a dense 128 × 128 slash.
- No hosted backend, telemetry, central token storage or paid image API.
- Each user runs the workflow in their own GitHub Actions or GitLab CI/CD environment.

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
| `dist/slash.svg` | Crisp, scalable static README artwork |
| `dist/slash.gif` | Animated slash effect |
| `dist/slash.png` | Static raster preview |
| `dist/metadata.json` | Inputs and generated power metadata |

## Test it locally

There is currently no separate unit-test script. Use the build and render commands below as a TypeScript/build check and an end-to-end renderer smoke test.

```sh
# Type-check and build the browser studio
npm run build

# Render low-, medium- and high-activity samples
CONTRIBUTIONS=0 npm run render
CONTRIBUTIONS=1200 npm run render
CONTRIBUTIONS=5000 npm run render
```

Each render overwrites the files in `dist/`. With the example configuration (`maxContributions: 5000`, `resolution: 128`, `powerCurve: 1`), these counts correspond to 0%, 24% and 100% contribution power. Effective resolution and detail increase with power. Inspect `dist/metadata.json` after each run to check the actual power and resolution.

To verify deterministic output, run the same render twice without changing the config, seed or contribution count:

```sh
CONTRIBUTIONS=1200 npm run render
sha256sum dist/slash.svg dist/slash.gif dist/slash.png > /tmp/gitbreathing-first.sha256
CONTRIBUTIONS=1200 npm run render
sha256sum -c /tmp/gitbreathing-first.sha256
```

All three files should report `OK`.

## Example README output

After rendering, preview the generated assets in a README with:

```md
![GitBreathing static slash](dist/slash.svg)

![GitBreathing animated slash](dist/slash.gif)
```

To display them in a separate profile README, replace the placeholders with your repository and branch:

```html
<p align="center">
  <img src="https://raw.githubusercontent.com/USERNAME/REPOSITORY/BRANCH/dist/slash.svg" width="128" alt="GitBreathing static slash">
  <img src="https://raw.githubusercontent.com/USERNAME/REPOSITORY/BRANCH/dist/slash.gif" width="128" alt="GitBreathing animated slash">
</p>
```

## README embed

Embed both generated files directly so the README displays the static vector slash and the animated slash. GitHub and GitLab may apply different SVG security/rendering rules, so the GIF remains the animated compatibility output.

```html
<p align="center">
  <img src="https://raw.githubusercontent.com/USERNAME/REPOSITORY/BRANCH/dist/slash.svg" width="128" alt="GitBreathing static slash">
  <img src="https://raw.githubusercontent.com/USERNAME/REPOSITORY/BRANCH/dist/slash.gif" width="128" alt="GitBreathing animated slash">
</p>
```

For GitLab, replace the raw URL with the project's raw file URL. The GIF is animated and uses a dark backing for reliable GIF transparency behavior; SVG is intentionally static, transparent when configured, and lightweight.

## Configuration

Copy `config.example.json` to `gitbreathing.json`. Commit this file to your profile repository.

| Key | Description |
| --- | --- |
| `username` | Account whose activity determines power |
| `platform` | `github`, `gitlab` or `custom` |
| `styles` | Ordered style layers, e.g. `["sun", "water"]` |
| `styleWeights` | Per-style intensity multiplier, 0 to 3 |
| `styleColors` | Optional three-color palette per style |
| `effects` | Toggle glow, particles, secondary cuts and motion; tune particle density and slash thickness |
| `maxContributions` | Activity count at which maximum power is reached |
| `resolution` | Output resolution, 8 to 128 |
| `frames` / `fps` | GIF frame count and frame rate |
| `powerCurve` | Contribution response curve, 0.1 to 4 |
| `background` | `transparent` or `dark` |
| `seed` | Optional explicit seed; empty uses platform and username |

The same username, seed, style order, configuration, contribution count and renderer version produce the same frames. Animation phase is deterministic. Changing the contribution count changes the power, effective resolution and detail. The configured resolution is the maximum; low activity scales the actual output down toward 8 × 8. Effects can be individually enabled or disabled, and particle density and slash thickness are configurable.

## GitHub Actions

Copy `.github/workflows/gitbreathing.yml` into the repository containing `gitbreathing.json`. The workflow runs daily, manually, and on repository pushes other than generated `dist/` asset updates. It queries the configured GitHub account's contribution calendar with the repository's `GITHUB_TOKEN`, generates all output files and commits changes.

Enable **Settings → Actions → General → Workflow permissions → Read and write permissions** if the workflow cannot push. For a private target profile or organization policy that restricts the default token, use a repository-scoped token stored as `GH_TOKEN` and change the workflow's secret reference. The token is consumed only inside the user's runner.

GitHub's `totalContributions` includes qualifying commits, pull requests, issues and code reviews. It is not a commit-only metric. GitHub's contribution calendar uses its own qualifying-activity rules.

## GitLab CI/CD

The included `.gitlab-ci.yml` runs on schedules, manual pipelines and repository pushes. Its generated-art commit message is excluded to prevent a pipeline loop. Add a masked `GITLAB_TOKEN` CI/CD variable with API read access and repository write access. The pipeline uses it to fetch activity and push generated files. You can alternatively set `CONTRIBUTIONS` directly as a CI/CD variable.

The GitLab Events API is an activity-event feed, not a canonical contribution-calendar total. The sample pipeline paginates the Events API and uses the returned event count as an approximate activity metric. It accepts an explicit `CONTRIBUTIONS` override, which skips the API count. This is not a canonical contribution-calendar total: GitLab event types and retention policies differ by instance. For an exact custom metric, provide the count through your own CI variable or replace the fetch step with an API query matching your definition.

For a scheduled pipeline, configure a daily schedule in GitLab. Ensure the token is available to scheduled pipelines and the target branch permits CI pushes. Never commit tokens to `gitbreathing.json` or source control.

## Cost and privacy model

GitBreathing does not run a central service. Rendering happens in the user's own browser, local environment or CI runner. API requests, CI minutes and storage are charged against the user's own platform account and quotas. GitBreathing does not collect contribution data or credentials.

## Development

```sh
npm install
npm run dev
npm run build
CONTRIBUTIONS=1200 npm run render
```

## Attribution

Created by **Dev Borah**. If you use GitBreathing, retain attribution and include these creator profile links in your project documentation:

- GitHub: https://github.com/bitzzdev
- GitLab: https://gitlab.com/bitzzdev

## License

GitBreathing source code is licensed under the MIT License. Third-party dependencies retain their respective licenses.
