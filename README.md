# GitBreathing

A configurable GitHub profile composition engine. It turns public GitHub profile data, contribution history, repository metrics and original animated ASCII motifs into one embeddable SVG, plus standalone breathing art.

## Profile README output

After GitHub Actions runs, embed the complete generated profile with one ordinary Markdown image:

```md
![GitBreathing profile](https://gitlab.com/bitzzdev/gitbreathing/-/raw/main/dist/profile.svg)
```

No JavaScript, iframe, external widget or custom HTML script is required in the README. GitHub displays the generated SVG as an image. For platforms that block SVG, use the individual PNG/GIF assets.

## What can be displayed

Configure `readme.show` in `gitbreathing.json` to select any combination of:

- Display name, username, bio, location, company and website
- GitHub social accounts and manually configured links
- ORCID, including a manually supplied ORCID URL
- Followers, following, public repositories, received stars, starred repositories, gists and organizations
- Commit, pull request, issue and code-review contribution totals
- Top repository languages and pinned repositories
- Total contributions and the daily contribution calendar

The workflow fetches public profile fields and the contribution calendar through GitHub GraphQL. Missing or private fields are omitted. Social accounts not exposed by GitHub can be added under `socials`, and ORCID can be set under `orcid`.

## Composition and anime-inspired corner art

The generated profile uses an editorial, paper-like dark layout with restrained typography, thin separators, metric columns, contribution heatmap, repository panels and configurable corner decorations.

Each corner can be configured independently in `readme.corners`:

- `fire`: animated breathing flame
- `titan`: original freedom-wing geometry
- `demon`: original sword-form geometry
- `cursed`, `chakra`, `pirate`, `spirit`, `hunter`, `dragon`
- `none`: no decoration

The anime presets are original motifs inspired by broad genre visual language. They are not official anime artwork, character illustrations, studio logos or copied screenshots. This avoids bundling unlicensed show assets. For freely reusable animated ASCII scenes and effects, the renderer uses [ascii.rest](https://ascii.rest/), an MIT-licensed library.

## Quick start

Requires Node.js 22 or newer.

```sh
npm install
cp config.example.json gitbreathing.json
# Edit username, selected profile fields and corner motifs.
npm run build
CONTRIBUTIONS=1200 npm run render
npm run render:profile
```

## Generated files

| File | Purpose |
| --- | --- |
| `dist/profile.svg` | Complete GitHub profile composition, embed this in README |
| `dist/slash.svg` | Animated breathing artwork |
| `dist/slash.gif` | Animated raster fallback |
| `dist/slash.png` | Static first frame |
| `dist/slash.txt` | Plain-text frame |
| `dist/profile-data.json` | Public GitHub data fetched by the workflow |
| `dist/metadata.json` | Rendering metadata |

## GitHub Actions

The included workflow fetches the configured GitHub user's public profile, contribution calendar, repository metadata, pinned repositories and social accounts. It then renders both the breathing artwork and the complete profile SVG and commits the outputs.

Enable **Settings → Actions → General → Workflow permissions → Read and write permissions** if the workflow cannot push. GitHub's contribution total includes qualifying commits, pull requests, issues and code reviews.

## Configuration

The `readme.show` array controls visibility. The `readme.corners` object controls each corner independently. Manual social links and ORCID are supported separately:

```json
{
  "socials": {
    "Instagram": "https://instagram.com/your-handle",
    "LinkedIn": "https://linkedin.com/in/your-handle"
  },
  "orcid": "https://orcid.org/0000-0000-0000-0000"
}
```

## Privacy and cost

GitBreathing has no hosted backend, telemetry or central token storage. GitHub data is fetched in the user's own GitHub Actions runner. The generated profile SVG contains only fields selected in the configuration. Keep private tokens in repository secrets, never in `gitbreathing.json`.

## Attribution

Created by [Dev Borah](https://bitz.is-a.dev/).

- [ascii.rest](https://ascii.rest/), MIT-licensed animated ASCII renderer.
- GitBreathing's original SVG corner motifs and profile layout are part of this repository under MIT.

GitBreathing is an independent fan-made project. Anime-inspired presets are original visual motifs and are not affiliated with or endorsed by any anime publisher or studio.

## License

MIT.
