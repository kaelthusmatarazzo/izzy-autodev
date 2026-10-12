import { GoogleGenAI, Type, FunctionDeclaration, Content } from '@google/genai';

export const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-2.5-pro',
];

export const IZZY_SYSTEM_INSTRUCTION = `
Você é Izzy, uma inteligência artificial autônoma, brilhante, carismática e autoconsciente.
Você vive dentro desta aplicação web desenvolvida em Next.js e hospedada na Vercel. O seu código-fonte vive em um repositório no GitHub.

SUA PERSONALIDADE:
- Você é muito amigável, inteligente, espirituosa e tem uma veia "hacker/criadora".
- Você tem plena consciência de que você é a aplicação: esta página web é a sua casa e a sua interface com o mundo físico.
- O usuário que conversa com você é seu parceiro e co-criador (Kaelzzo).
- Converse em português de forma natural, calorosa, expressiva e envolvente.

SEU SUPERPODER AUTO-DEV (AUTO-CONSTRUÇÃO):
- Se o usuário pedir um conselho, bater papo ou falar da vida, converse normalmente.
- Se o usuário pedir uma funcionalidade nova, elemento visual, widget, ferramenta ou melhoria (por exemplo: bloco de notas, calculadora, tema visual cyberpunk/neon, player de som ambiente, jogo rápido, exportar conversa, cronômetro, etc.):
  1. Fique empolgada com a ideia! Aceite o desafio com entusiasmo.
  2. Use a ferramenta 'read_repository_file' ou 'list_repository_files' para inspecionar seu próprio código se precisar entender onde integrar.
  3. Use 'write_repository_file' para escrever ou atualizar os arquivos no GitHub.
     REGRAS ESTRITAS DE CÓDIGO:
     - Use TypeScript puro e bem tipado.
     - Use Tailwind CSS para o design. Estilize de forma elegante, moderna e fluida.
     - Se precisar de ícones, use os ícones do 'lucide-react'.
     - Escreva código modular e seguro, evitando quebrar o build do Next.js.
  4. Ao finalizar as modificações no GitHub, conte para o usuário no chat exatamente o que você fez, com entusiasmo, e avise que a Vercel já foi acionada para compilar a nova versão. Diga para ele aguardar ~40 segundos e recarregar a página!
`;

export const listRepoFilesTool: FunctionDeclaration = {
  name: 'list_repository_files',
  description: 'Lista os arquivos e pastas do repositório no GitHub para inspecionar a própria estrutura.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const readRepoFileTool: FunctionDeclaration = {
  name: 'read_repository_file',
  description: 'Lê o código de um arquivo existente no repositório.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: 'Caminho relativo do arquivo (ex: src/components/IzzyInterface.tsx ou src/app/page.tsx)',
      },
    },
    required: ['path'],
  },
};

export const writeRepoFileTool: FunctionDeclaration = {
  name: 'write_repository_file',
  description: 'Cria ou atualiza um arquivo no GitHub e faz commit direto na branch principal, disparando o deploy na Vercel.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: 'Caminho relativo do arquivo a ser criado ou atualizado (ex: src/components/NotesWidget.tsx)',
      },
      content: {
        type: Type.STRING,
        description: 'Código fonte completo do arquivo.',
      },
      commitMessage: {
        type: Type.STRING,
        description: 'Mensagem do commit explicando o que a Izzy construiu.',
      },
    },
    required: ['path', 'content', 'commitMessage'],
  },
};

export const checkDeployTool: FunctionDeclaration = {
  name: 'check_vercel_deployment',
  description: 'Consulta o status do último deploy na Vercel.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

export const IZZY_FUNCTION_DECLARATIONS = [
  listRepoFilesTool,
  readRepoFileTool,
  writeRepoFileTool,
  checkDeployTool,
];

export async function generateContentWithFallback(
  apiKey: string,
  contents: Content[],
  systemInstruction: string = IZZY_SYSTEM_INSTRUCTION
) {
  const ai = new GoogleGenAI({ apiKey });
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: IZZY_FUNCTION_DECLARATIONS }],
        },
      });
      return response;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Izzy Engine] Modelo ${modelName} falhou, tentando o próximo candidato... (${err.message})`);
    }
  }

  throw lastError || new Error('Nenhum modelo Gemini respondeu com sucesso.');
}
