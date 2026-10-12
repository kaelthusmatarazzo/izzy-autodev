import { NextRequest, NextResponse } from 'next/server';
import { generateContentWithFallback } from '@/lib/gemini';
import { getRepoTree, getFileContent, writeOrUpdateFile } from '@/lib/github';
import { getLatestDeployment } from '@/lib/vercel';
import { Content } from '@google/genai';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, userApiKey, userGithubToken, userRepo, userBranch, userVercelToken, userProjectId } = body;

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

    // Converter histórico de mensagens para o formato Content[] do @google/genai
    const contents: Content[] = [];
    const recentMessages = messages.slice(-10);

    for (const msg of recentMessages) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    let response = await generateContentWithFallback(apiKey, contents);

    const toolExecutionLogs: any[] = [];
    let hasModifiedCode = false;

    // Loop de resolução de Function Calls (Tools)
    let turns = 0;
    while (response.functionCalls && response.functionCalls.length > 0 && turns < 5) {
      turns++;
      const functionCalls = response.functionCalls;

      // Preserva o conteúdo original do modelo gerado pelo Gemini (com thoughtSignature e IDs)
      if (response.candidates && response.candidates[0]?.content) {
        contents.push(response.candidates[0].content);
      } else {
        contents.push({
          role: 'model',
          parts: functionCalls.map((call) => ({
            functionCall: {
              name: call.name,
              args: call.args as Record<string, any>,
            },
          })),
        });
      }

      const responseParts: any[] = [];

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
              toolResult = { files: files.slice(0, 50) };
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

        responseParts.push({
          functionResponse: {
            name,
            response: toolResult,
            ...((call as any).id ? { id: (call as any).id } : {}),
          },
        });
      }

      // Adiciona o retorno das ferramentas como resposta do usuário para o Gemini
      contents.push({
        role: 'user',
        parts: responseParts,
      });

      // Chama novamente o Gemini com os resultados
      response = await generateContentWithFallback(apiKey, contents);
    }

    const replyText = response.text || '';

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
