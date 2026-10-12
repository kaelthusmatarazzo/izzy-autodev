import { NextRequest, NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/gemini';
import { getRepoTree, getFileContent, writeOrUpdateFile } from '@/lib/github';
import { getLatestDeployment } from '@/lib/vercel';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Suporte a funções mais longas na Vercel Pro ou Hobby

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userApiKey, userGithubToken, userRepo, userBranch, userVercelToken, userProjectId } = body;

    // Chaves: prioriza corpo da requisição (definido no modal da interface) ou variáveis de ambiente da Vercel
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    const githubToken = userGithubToken || process.env.GITHUB_TOKEN;
    const githubRepo = userRepo || process.env.GITHUB_REPO;
    const githubBranch = userBranch || process.env.GITHUB_BRANCH || 'main';
    const vercelToken = userVercelToken || process.env.VERCEL_TOKEN;
    const vercelProjectId = userProjectId || process.env.VERCEL_PROJECT_ID;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Chave do Gemini não configurada. Defina GEMINI_API_KEY no arquivo .env.local ou nas configurações da interface.',
        },
        { status: 400 }
      );
    }

    const githubConfig = {
      token: githubToken || '',
      repo: githubRepo || '',
      branch: githubBranch,
    };

    const vercelConfig = {
      token: vercelToken,
      projectId: vercelProjectId,
    };

    const model = getGeminiModel(apiKey);

    // Preparar histórico para a API do Gemini
    const contents: any[] = [];
    const recentMessages = messages.slice(-10); // Mantém as 10 mensagens mais recentes para contexto ágil

    for (const msg of recentMessages) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    // Iniciar sessão de chat com histórico
    const chat = model.startChat({
      history: contents.slice(0, -1),
    });

    const latestMessage = contents[contents.length - 1];
    let result = await chat.sendMessage(latestMessage.parts);
    let response = await result.response;

    const toolExecutionLogs: any[] = [];
    let hasModifiedCode = false;

    // Loop de resolução de Function Calls (permite a Izzy ler e depois escrever se necessário)
    let turns = 0;
    while (response.functionCalls() && response.functionCalls()!.length > 0 && turns < 5) {
      turns++;
      const functionCalls = response.functionCalls()!;
      const functionResponses: any[] = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let toolResult: any = null;
        let status: 'success' | 'error' = 'success';

        try {
          if (name === 'list_repository_files') {
            if (!githubConfig.token || !githubConfig.repo) {
              toolResult = { error: 'GITHUB_TOKEN ou GITHUB_REPO não configurados para inspecionar o repositório.' };
              status = 'error';
            } else {
              const files = await getRepoTree(githubConfig);
              toolResult = { files: files.slice(0, 50) }; // Limite de 50 arquivos para não estourar o prompt
            }
          } else if (name === 'read_repository_file') {
            if (!githubConfig.token || !githubConfig.repo) {
              toolResult = { error: 'GITHUB_TOKEN ou GITHUB_REPO não configurados.' };
              status = 'error';
            } else {
              const fileData = await getFileContent(githubConfig, (args as any).path);
              toolResult = { content: fileData.content, sha: fileData.sha };
            }
          } else if (name === 'write_repository_file') {
            if (!githubConfig.token || !githubConfig.repo) {
              toolResult = { error: 'GITHUB_TOKEN ou GITHUB_REPO não configurados para salvar alterações no GitHub.' };
              status = 'error';
            } else {
              const writeRes = await writeOrUpdateFile(
                githubConfig,
                (args as any).path,
                (args as any).content,
                (args as any).commitMessage
              );
              toolResult = { success: true, path: writeRes.path, commitSha: writeRes.commitSha };
              hasModifiedCode = true;
            }
          } else if (name === 'check_vercel_deployment') {
            const deployInfo = await getLatestDeployment(vercelConfig);
            toolResult = deployInfo;
          } else {
            toolResult = { error: `Ferramenta desconhecida: ${name}` };
            status = 'error';
          }
        } catch (err: any) {
          toolResult = { error: err.message || 'Erro ao executar ferramenta' };
          status = 'error';
        }

        toolExecutionLogs.push({
          name,
          args,
          result: toolResult,
          status,
        });

        functionResponses.push({
          functionResponse: {
            name,
            response: toolResult,
          },
        });
      }

      // Envia os resultados das ferramentas de volta para a Izzy gerar a resposta final
      result = await chat.sendMessage(functionResponses);
      response = await result.response;
    }

    const replyText = response.text();

    return NextResponse.json({
      reply: replyText,
      toolCalls: toolExecutionLogs,
      hasModifiedCode,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/chat:', error);
    return NextResponse.json(
      {
        error: error.message || 'Erro interno ao processar conversa com a Izzy',
      },
      { status: 500 }
    );
  }
}
