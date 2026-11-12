import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function renderProfile(show) {
  const temporary = await mkdtemp(path.join(tmpdir(), 'gitbreathing-profile-'));
  const outputDir = path.join(temporary, 'dist');
  const configPath = path.join(temporary, 'config.json');
  try {
    await mkdir(outputDir, { recursive: true });
    const repositories = Array.from({ length: 7 }, (_, index) => ({
      name: `repository-${index + 1}`,
      url: `https://github.com/sample-user/repository-${index + 1}`,
      description: `Fixture repository ${index + 1}`,
      stargazerCount: index + 1,
      forkCount: 0,
      primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
    }));
    const config = {
      username: 'sample-user',
      website: 'https://example.com/',
      orcid: 'https://orcid.org/0000-0000-0000-0000',
      outputDir,
      socials: {
        GitHub: 'https://github.com/sample-user',
        LinkedIn: 'https://linkedin.com/in/sample-user',
        X: 'https://x.com/sample-user',
      },
      readme: {
        show,
        corners: {
          topLeft: 'fire',
          topRight: 'fire',
          bottomLeft: 'fire',
          bottomRight: 'fire',
        },
        visualizations: {
          total: { enabled: false },
          daily: { enabled: false },
        },
      },
    };
    const profileData = {
      data: {
        user: {
          login: 'sample-user',
          name: 'Sample User',
          bio: 'A profile renderer fixture',
          websiteUrl: 'https://example.com/',
          twitterUsername: 'sample-user',
          socialAccounts: {
            nodes: [
              { provider: 'GITHUB', url: 'https://github.com/sample-user' },
              { provider: 'LINKEDIN', url: 'https://linkedin.com/in/sample-user' },
              { provider: 'TWITTER', url: 'https://x.com/sample-user' },
            ],
          },
          followers: { totalCount: 12 },
          following: { totalCount: 8 },
          repositories: { totalCount: 7, nodes: repositories },
          pinnedItems: { nodes: [] },
          starredRepositories: { totalCount: 4 },
          gists: { totalCount: 2 },
          organizations: { nodes: [] },
          projectsV2: { nodes: [] },
          repositoriesContributedTo: { nodes: [] },
          contributionsCollection: {
            totalCommitContributions: 11,
            totalIssueContributions: 2,
            totalPullRequestContributions: 3,
            totalPullRequestReviewContributions: 4,
            contributionCalendar: {
              totalContributions: 20,
              weeks: [],
            },
          },
          repositoryDiscussions: { totalCount: 1 },
          repositoryDiscussionComments: { totalCount: 2 },
          issueComments: { totalCount: 3 },
          commitComments: { totalCount: 4 },
          status: null,
        },
      },
    };

    await writeFile(configPath, JSON.stringify(config));
    await writeFile(path.join(outputDir, 'profile-data.json'), JSON.stringify(profileData));
    const result = spawnSync(
      process.execPath,
      ['--import', 'tsx', 'scripts/profile.ts'],
      {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, GITBREATHING_CONFIG: configPath },
      },
    );
    assert.equal(result.status, 0, result.stderr || result.stdout || 'Profile renderer failed.');
    return await readFile(path.join(outputDir, 'profile.svg'), 'utf8');
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

test('profile fields remain independent and repository metrics use fetched data', async () => {
  const socialOnly = await renderProfile([
    'name', 'username', 'socials', 'website', 'stars', 'repositories',
  ]);
  assert.match(socialOnly, /<title>Sample User · GitBreathing profile<\/title>/);
  assert.match(socialOnly, /href="https:\/\/linkedin\.com\/in\/sample-user"/);
  assert.doesNotMatch(socialOnly, /href="https:\/\/x\.com\/sample-user"/);
  assert.doesNotMatch(socialOnly, /0000-0000-0000-0000/);
  assert.match(socialOnly, />28<\/text>/, 'stars should sum all seven fetched repositories');
  assert.equal((socialOnly.match(/PUBLIC REPOS/g) ?? []).length, 1, 'repository count should render once');

  const withIndependentLinks = await renderProfile([
    'name', 'username', 'socials', 'twitter', 'orcid', 'website', 'stars', 'repositories',
  ]);
  assert.equal((withIndependentLinks.match(/href="https:\/\/x\.com\/sample-user"/g) ?? []).length, 1);
  assert.equal((withIndependentLinks.match(/href="https:\/\/github\.com\/sample-user"/g) ?? []).length, 1);
  assert.match(withIndependentLinks, /href="https:\/\/orcid\.org\/0000-0000-0000-0000"/);
  assert.match(withIndependentLinks, /href="https:\/\/example\.com\//);
  for (const corner of ['fire-top-left', 'fire-top-right', 'fire-bottom-left', 'fire-bottom-right']) {
    assert.ok(withIndependentLinks.includes(corner), `missing namespaced animation: ${corner}`);
  }
});
