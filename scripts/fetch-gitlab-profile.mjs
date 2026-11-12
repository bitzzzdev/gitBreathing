import fs from 'node:fs/promises';

const username = process.env.GITBREATHING_USERNAME || 'bitzzdev';
const token = process.env.GITLAB_TOKEN;
const api = (process.env.CI_API_V4_URL || 'https://gitlab.com/api/v4').replace(/\/$/, '');

if (!token) {
  throw new Error('GITLAB_TOKEN is required. Add a GitLab personal access token with read_api and write_repository scopes to CircleCI project environment variables.');
}

async function get(path) {
  const response = await fetch(`${api}${path}`, {
    headers: { 'PRIVATE-TOKEN': token },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitLab API request failed (${response.status}) for ${path}: ${detail.slice(0, 300)}`);
  }

  return {
    data: await response.json(),
    total: Number(response.headers.get('x-total') || 0),
  };
}

const users = await get(`/users?username=${encodeURIComponent(username)}`);
const account = users.data.find((item) => item.username === username);

if (!account) {
  throw new Error(`GitLab user "${username}" was not found.`);
}

const profileResult = await get(`/users/${account.id}`);
const profile = profileResult.data;

const projects = [];
for (let page = 1; page <= 20; page++) {
  const params = new URLSearchParams({
    visibility: 'public',
    order_by: 'star_count',
    sort: 'desc',
    per_page: '100',
    page: String(page),
  });
  const result = await get(`/users/${account.id}/projects?${params}`);
  projects.push(...result.data);
  if (result.data.length < 100) break;
}

const today = new Date();
today.setUTCHours(0, 0, 0, 0);
const end = new Date(today);
end.setUTCDate(end.getUTCDate() + (6 - end.getUTCDay()));
const start = new Date(end);
start.setUTCDate(start.getUTCDate() - 370);
const dateKey = (date) => date.toISOString().slice(0, 10);
const startDate = dateKey(start);
const beforeDate = dateKey(today);

const events = [];
for (let page = 1; page <= 100; page++) {
  const params = new URLSearchParams({
    after: startDate,
    before: beforeDate,
    per_page: '100',
    page: String(page),
  });
  const result = await get(`/users/${account.id}/events?${params}`);
  events.push(...result.data);
  if (result.data.length < 100) break;
}

const daily = new Map();
for (const event of events) {
  const date = String(event.created_at || '').slice(0, 10);
  if (date >= startDate && date <= beforeDate) {
    daily.set(date, (daily.get(date) || 0) + 1);
  }
}

const weeks = [];
for (let week = 0; week < 53; week++) {
  const contributionDays = [];
  for (let day = 0; day < 7; day++) {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + week * 7 + day);
    const key = dateKey(date);
    const count = daily.get(key) || 0;
    const level = count === 0 ? 0 : count < 2 ? 1 : count < 5 ? 2 : count < 10 ? 3 : 4;
    const colors = ['#202520', '#465247', '#657c66', '#8ca58a', '#cbd5c8'];
    contributionDays.push({
      date: key,
      contributionCount: count,
      color: colors[level],
    });
  }
  weeks.push({ contributionDays });
}

const totalActivityEvents = [...daily.values()].reduce((sum, count) => sum + count, 0);
const user = {
  login: profile.username,
  name: profile.name,
  bio: profile.bio,
  pronouns: profile.pronouns,
  location: profile.location,
  company: profile.organization,
  websiteUrl: profile.website_url,
  avatarUrl: profile.avatar_url,
  twitterUsername: String(profile.twitter || '').replace(/^@/, ''),
  createdAt: profile.created_at,
  repositories: {
    totalCount: projects.length,
    nodes: projects.map((project) => ({
      name: project.name,
      url: project.web_url,
      description: project.description,
      stargazerCount: project.star_count,
      forkCount: project.forks_count,
      primaryLanguage: null,
    })),
  },
  contributionsCollection: {
    contributionCalendar: {
      totalContributions: totalActivityEvents,
      weeks,
    },
  },
};

await fs.mkdir('dist', { recursive: true });
await fs.writeFile('dist/profile-data.json', `${JSON.stringify({ data: { user } }, null, 2)}\n`);
console.error(`Fetched GitLab profile data and ${totalActivityEvents} activity events across ${daily.size} active days.`);
process.stdout.write(String(totalActivityEvents));
