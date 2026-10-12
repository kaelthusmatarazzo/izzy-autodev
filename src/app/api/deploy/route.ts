import { NextRequest, NextResponse } from 'next/server';
import { getLatestDeployment } from '@/lib/vercel';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userToken = searchParams.get('token') || undefined;
    const userProjectId = searchParams.get('projectId') || undefined;

    const token = userToken || process.env.VERCEL_TOKEN;
    const projectId = userProjectId || process.env.VERCEL_PROJECT_ID;
    const teamId = process.env.VERCEL_TEAM_ID;

    const status = await getLatestDeployment({
      token,
      projectId,
      teamId,
    });

    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Falha ao consultar status na Vercel' },
      { status: 500 }
    );
  }
}
