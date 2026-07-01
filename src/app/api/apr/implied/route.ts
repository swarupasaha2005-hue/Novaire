import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const epochId = searchParams.get('epochId');

  if (!epochId) {
    return NextResponse.json({ error: 'epochId is required' }, { status: 400 });
  }

  try {
    const epoch = await prisma.epoch.findUnique({
      where: { id: epochId },
    });

    if (!epoch) {
      return NextResponse.json({ error: 'Epoch not found' }, { status: 404 });
    }

    // Example calculation: We would look at the marketplace reserves
    // For now, we simulate looking at recent trades
    const recentTrade = await prisma.trade.findFirst({
      where: { epochId },
      orderBy: { timestamp: 'desc' },
    });

    let impliedRate = '0';
    if (recentTrade) {
      impliedRate = recentTrade.impliedRate;
    } else {
      // Dummy baseline 5.5% if no trades yet
      impliedRate = '0.055'; 
    }

    return NextResponse.json({ 
      epochId,
      impliedRate,
      maturityLedger: epoch.maturityLedger
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
