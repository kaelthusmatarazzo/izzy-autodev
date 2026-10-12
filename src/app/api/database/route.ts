import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dbType = searchParams.get('dbType') || 'local';
  const dbUrl = searchParams.get('dbUrl') || '';
  const dbApiKey = searchParams.get('dbApiKey') || '';

  try {
    // Se for Supabase ou Neon, podemos fazer uma requisição de teste se houver credenciais
    if (dbType === 'supabase' && dbUrl && dbApiKey) {
      const res = await fetch(`${dbUrl}/rest/v1/izzy_memories?select=*`, {
        headers: {
          apikey: dbApiKey,
          Authorization: `Bearer ${dbApiKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, memories: data, source: 'supabase' });
      } else {
        const errText = await res.text();
        return NextResponse.json({ success: false, error: `Supabase Error: ${errText}` }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'DB em modo local ou configurado no cliente' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { dbType, dbUrl, dbApiKey, memory } = body;

    if (dbType === 'supabase' && dbUrl && dbApiKey && memory) {
      const res = await fetch(`${dbUrl}/rest/v1/izzy_memories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: dbApiKey,
          Authorization: `Bearer ${dbApiKey}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify(memory),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ success: true, data, source: 'supabase' });
      } else {
        const errText = await res.text();
        return NextResponse.json({ success: false, error: `Erro ao salvar no Supabase: ${errText}` }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, message: 'Memória processada' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
