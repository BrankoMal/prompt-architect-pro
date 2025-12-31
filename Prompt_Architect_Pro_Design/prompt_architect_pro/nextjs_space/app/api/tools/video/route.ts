import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tools = await prisma.videoTool.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching video tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video tools' },
      { status: 500 }
    );
  }
}
