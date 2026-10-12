import { DeployInfo } from './types';

interface VercelConfig {
  token?: string;
  projectId?: string;
  teamId?: string;
}

export async function getLatestDeployment(config: VercelConfig): Promise<DeployInfo> {
  const { token, projectId, teamId } = config;

  if (!token) {
    return {
      state: 'UNKNOWN',
      errorMessage: 'Token da Vercel não configurado (opcional)',
    };
  }

  try {
    let url = `https://api.vercel.com/v6/deployments?limit=1`;
    if (projectId) {
      url += `&projectId=${projectId}`;
    }
    if (teamId) {
      url += `&teamId=${teamId}`;
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.text();
      return {
        state: 'UNKNOWN',
        errorMessage: `Erro Vercel (${res.status}): ${err}`,
      };
    }

    const data = await res.json();
    const latest = data.deployments?.[0];

    if (!latest) {
      return { state: 'UNKNOWN' };
    }

    return {
      state: latest.state || 'UNKNOWN',
      url: latest.url ? `https://${latest.url}` : undefined,
      createdAt: latest.createdAt,
    };
  } catch (err: any) {
    return {
      state: 'ERROR',
      errorMessage: err.message || 'Falha ao conectar à API Vercel',
    };
  }
}
