# GitBreathing

A configurable GitHub profile composition engine. It turns public GitHub profile data, contribution history, repository metrics and original animated ASCII motifs into one embeddable SVG, plus standalone breathing art.

## Profile README output

After GitHub Actions runs, embed the complete generated profile with one ordinary Markdown image:

```md
![GitBreathing profile](https://gitlab.com/bitzzdev/gitbreathing/-/raw/main/dist/profile.svg)
```

No JavaScript, iframe, external widget or custom HTML script is required in the README. GitHub displays the generated SVG as an image. For platforms that block SVG, use the individual PNG/GIF assets.

## What can be displayed

Configure `readme.show` in `gitbreathing.json` to select any combination of the available public fields. The studio exposes each field as an independent checkbox, including:

- Avatar, display name, username, bio, pronouns, status, hireability, location, company and website
- GitHub social accounts and manually configured links
- ORCID, including a manually supplied ORCID URL
- Followers, following, public repositories, received stars, starred repositories, gists and organizations
- Commit, pull request, issue, code-review, discussion and authored-comment totals, plus current and longest active-day streaks
- Top repository languages, pinned repositories, top repositories by stars, contributed repositories and GitHub Projects
- Total contributions and the daily contribution calendar

The workflow fetches public profile fields and the contribution calendar through GitHub GraphQL. Missing or private fields are omitted. Social accounts not exposed by GitHub can be added under `socials`, and ORCID can be set under `orcid`.

GitHub Projects are fetched separately because GitHub's repository-scoped `GITHUB_TOKEN` cannot access Projects. To include the Projects field, add an optional `GH_PROJECT_TOKEN` Actions secret (or GitLab CI/CD variable) containing a classic personal access token with the `read:project` scope. Without it, the Projects section is omitted without blocking the rest of the profile render.

## Composition and anime-inspired corner art

The generated profile follows the portfolio design system at [bitz.is-a.dev](https://bitz.is-a.dev/): Paper Mono typography, near-black surfaces, fine structural separators, monochrome data panels and a restrained cave-like atmosphere. The browser studio loads the same Paper Mono font files from the portfolio. The standalone SVG names Paper Mono with monospace fallbacks for GitHub's image renderer.

Each corner can be configured independently in `readme.corners`:

- `fire`: animated `doom-fire` scene rendered through `ascii.rest` into a self-contained SVG
- `titan`: original freedom-wing geometry
- `demon`: original sword-form geometry
- `cursed`, `chakra`, `pirate`, `spirit`, `hunter`, `dragon`, `moon`, `vines`, `cave`
- `none`: no decoration

The studio includes presets for Attack on Titan, Demon Slayer, Jujutsu Kaisen, Naruto, One Piece, Bleach, Solo Leveling, Dragon Ball, Chainsaw Man, Hunter x Hunter, My Hero Academia, Tokyo Ghoul, JoJo's Bizarre Adventure, Frieren, Evangelion, Spy x Family and Fullmetal Alchemist. The anime presets are original motifs inspired by broad genre visual language. They are not official anime artwork, character illustrations, studio logos or copied screenshots. This avoids bundling unlicensed show assets. For freely reusable animated ASCII scenes and effects, the renderer uses [ascii.rest](https://ascii.rest/), an MIT-licensed library.

## Quick start

Requires Node.js 22 or newer.

```sh
npm install
cp config.example.json gitbreathing.json
# Edit username, selected profile fields and corner motifs.
npm run build
npm test
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
