import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const epochCount = await prisma.epoch.count();
    const userCount = await prisma.user.count();
    const latestTvl = await prisma.tvlSnapshot.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json({
      status: 'healthy',
      stats: {
        epochs: epochCount,
        users: userCount,
        tvl: latestTvl ? latestTvl.totalValue : '0',
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
