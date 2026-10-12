import { FileItem } from './types';

interface GitHubConfig {
  token: string;
  repo: string; // "owner/repo"
  branch?: string;
}

function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Izzy-AutoDev-Engine',
    'Content-Type': 'application/json',
  };
}

export async function getRepoTree(config: GitHubConfig): Promise<FileItem[]> {
  const { token, repo, branch = 'main' } = config;
  const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;

  const res = await fetch(url, {
    headers: getHeaders(token),
    cache: 'no-store',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Falha ao obter árvore do GitHub (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const tree = data.tree || [];

  return tree
    .filter((item: any) => !item.path.startsWith('.next/') && !item.path.startsWith('node_modules/'))
    .map((item: any) => ({
      path: item.path,
      type: item.type === 'blob' ? 'file' : 'dir',
      size: item.size,
    }));
}

export async function getFileContent(
  config: GitHubConfig,
  path: string
): Promise<{ content: string; sha: string }> {
  const { token, repo, branch = 'main' } = config;
  const url = `https://api.github.com/repos/${repo}/contents/${path}?ref=${branch}`;

  const res = await fetch(url, {
    headers: getHeaders(token),
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(`Arquivo não encontrado: ${path}`);
    }
    const errorText = await res.text();
    throw new Error(`Erro ao ler arquivo ${path} (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

export async function writeOrUpdateFile(
  config: GitHubConfig,
  path: string,
  content: string,
  commitMessage: string
): Promise<{ commitSha: string; path: string }> {
  const { token, repo, branch = 'main' } = config;
  const url = `https://api.github.com/repos/${repo}/contents/${path}`;

  // Verificar se o arquivo já existe para obter o SHA atual
  let existingSha: string | undefined = undefined;
  try {
    const existing = await getFileContent(config, path);
    existingSha = existing.sha;
  } catch {
    // Arquivo novo, sha não necessário
  }

  const base64Content = Buffer.from(content, 'utf-8').toString('base64');

  const body: any = {
    message: commitMessage || `Izzy Auto-Dev: atualizou ${path}`,
    content: base64Content,
    branch: branch,
  };

  if (existingSha) {
    body.sha = existingSha;
  }

  const res = await fetch(url, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Erro ao salvar arquivo ${path} (${res.status}): ${errorText}`);
  }

  const result = await res.json();
  return {
    commitSha: result.commit?.sha || '',
    path,
  };
}
