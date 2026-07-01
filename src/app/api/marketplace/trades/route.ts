import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const epochId = searchParams.get('epochId');

  try {
    const trades = await prisma.trade.findMany({
      where: epochId ? { epochId } : undefined,
      orderBy: { timestamp: 'desc' },
      take: 50,
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
