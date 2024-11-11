import { URL } from "url";
import axios from "axios";
import { AxiosResponse } from "axios";
import dotenv from "dotenv";
import semver from "semver";

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
  throw new Error('Missing GitHub Token');
}

interface PackageUrlObject {
  name: string;
  version: string;
  content: Buffer;
}

export async function uploadUrlHandler(packageUrl: string): Promise<PackageUrlObject> {
  const parsedUrl = new URL(packageUrl);

  if (parsedUrl.hostname === 'www.github.com') {
    return await handleGitHubUrl(parsedUrl);
  } else if (parsedUrl.hostname === 'www.npmjs.com') {
    return await handleNpmUrl(parsedUrl);
  } else {
    throw new Error('Unsupported URL Hostname');
  }
}

interface NPMResponse {
  name: string;
  version: string;
  dist: {
    tarball: string;
  }
}

async function handleNpmUrl(parsedUrl: URL): Promise<PackageUrlObject> {
  const pathParts = parsedUrl.pathname.split('/').slice(1);
  let name = '';
  let version = 'latest';

  if (pathParts[0] === '') {
    throw new Error('Invalid NPM URL');
  } else if (pathParts.length <= 2) {
    name = pathParts.pop()!;
  } else {
    version = pathParts.pop()!;
    pathParts.pop();
    name = pathParts.pop()!;
  }

  try {
    const response: AxiosResponse<NPMResponse> = await axios.get(`https://registry.npmjs.org/${name}/${version}`);
    if (response.status !== 200) {
      throw new Error('Failed to fetch package');
    }

    if (version === 'latest') {
      version = response.data.version;
    }

    const tarBallUrl = response.data.dist.tarball;

    const tarFile = await downloadTarUrl(tarBallUrl);

    return { name, version, content: tarFile };
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}

async function handleGitHubUrl(parsedUrl: URL): Promise<PackageUrlObject> {
  const pathParts = parsedUrl.pathname.split('/').slice(1);
  let tag = null;
  if (pathParts.includes('releases') && pathParts.includes('tag')) {
    tag = pathParts.pop()!;
    pathParts.pop();
    pathParts.pop();
  }

  if (pathParts.length < 2) {
    throw new Error('Invalid GitHub URL');
  }

  const repo = pathParts.pop()!;
  const owner = pathParts.pop()!;
  try {
    if (!tag) {
      tag = await getLatestTag(owner, repo);
    }

    if (tag) {
      const tarballUrl = `https://api.github.com/repos/${owner}/${repo}/tarball/${tag}`;
      const tarFile = await downloadTarUrl(tarballUrl, {'Authorization': `Bearer ${GITHUB_TOKEN}`});
      tag = semver.clean(tag) ?? '1.0.0';
      return { name: repo, version: tag, content: tarFile };
    } else {
      const tarballUrl = `https://github.com/${owner}/${repo}/tarball/`;
      const tarFile = await downloadTarUrl(tarballUrl, {'Authorization': `Bearer ${GITHUB_TOKEN}`});
      return { name: repo, version: '1.0.0', content: tarFile };

    }
  } catch (err: unknown) {
    throw new Error(err as string);
  }
}

async function getLatestTag(owner: string, repo: string): Promise<string | null> {
  const GITHUB_API_URL = `https://api.github.com/repos/${owner}/${repo}/tags`;

  try {
    const response = await axios.get(GITHUB_API_URL, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
      },
      params: {
        per_page: 1,
      },
    });

    if (response.data.length === 0) {
      return null;
    }

    return response.data[0].name;
  } catch (err: unknown) {
    throw new Error((err as Error).message);
  }
}

async function downloadTarUrl(tarUrl: string, headers?: Record<string, string>): Promise<Buffer> {
  const response = await axios.get(tarUrl, { 
    responseType: 'arraybuffer',
    headers: headers ?? {},
  });
  if (response.status !== 200) {
    throw new Error('Failed to fetch package');
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.data;
}