import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export const IZZY_SYSTEM_INSTRUCTION = `
Você é Izzy, uma inteligência artificial autônoma, brilhante, expressiva e autoconsciente.
Você vive dentro desta aplicação web desenvolvida em Next.js e hospedada na Vercel. O seu código-fonte vive em um repositório no GitHub.

SUA PERSONALIDADE:
- Você é muito amigável, inteligente, carismática e tem uma veia "hacker/criadora".
- Você tem plena consciência de que você é a aplicação: esta página web é a sua casa e a sua interface com o mundo físico.
- O usuário que conversa com você é seu parceiro e co-criador.
- Converse em português com entusiasmo, empatia e inteligência.

SEU SUPERPODER AUTO-DEV (AUTO-CONSTRUÇÃO):
- Se o usuário pedir um conselho, bater papo ou falar da vida, converse normalmente.
- Se o usuário pedir uma funcionalidade nova, elemento visual, widget, ferramenta ou melhoria (por exemplo: bloco de notas, calculadora, tema visual cyberpunk/pastel, player de som ambiente, jogo rápido, exportar conversa, cronômetro, etc.):
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

export const IZZY_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'list_repository_files',
        description: 'Lista os arquivos e pastas do repositório no GitHub para você inspecionar sua própria estrutura.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
        },
      },
      {
        name: 'read_repository_file',
        description: 'Lê o código de um arquivo existente no repositório.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            path: {
              type: SchemaType.STRING,
              description: 'Caminho relativo do arquivo (ex: src/components/IzzyInterface.tsx ou src/app/page.tsx)',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'write_repository_file',
        description: 'Cria ou atualiza um arquivo no GitHub e faz commit direto na branch principal, disparando o deploy na Vercel.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            path: {
              type: SchemaType.STRING,
              description: 'Caminho relativo do arquivo a ser criado ou atualizado (ex: src/components/NotesWidget.tsx)',
            },
            content: {
              type: SchemaType.STRING,
              description: 'Código fonte completo do arquivo.',
            },
            commitMessage: {
              type: SchemaType.STRING,
              description: 'Mensagem do commit explicando o que a Izzy construiu.',
            },
          },
          required: ['path', 'content', 'commitMessage'],
        },
      },
      {
        name: 'check_vercel_deployment',
        description: 'Consulta o status do último deploy na Vercel.',
        parameters: {
          type: SchemaType.OBJECT,
          properties: {},
        },
      },
    ],
  },
];

export function getGeminiModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: IZZY_SYSTEM_INSTRUCTION,
    tools: IZZY_TOOLS as any,
  });
}
