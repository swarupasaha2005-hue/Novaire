import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');

  if (!user) {
    return NextResponse.json({ error: 'User address is required' }, { status: 400 });
  }

  try {
    const activities = await prisma.activity.findMany({
      where: { userId: user },
      orderBy: { timestamp: 'desc' },
      take: 50,
      include: {
        epoch: true,
      }
    });

    const formattedActivities = activities.map(act => ({
      id: act.id,
      type: act.type, // 'deposit' | 'withdraw' | 'rollover' | 'claim'
      asset: act.epoch?.underlyingAsset || 'Unknown',
      amount: parseFloat(act.amount),
      valueUsd: parseFloat(act.amount), // Mocked value, should multiply by price
      timestamp: act.timestamp.toISOString(),
      txHash: act.txHash,
      status: 'completed',
    }));

    return NextResponse.json({ activities: formattedActivities });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
