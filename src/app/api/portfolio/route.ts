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
    const userData = await prisma.user.findUnique({
      where: { id: user },
      include: {
        positions: {
          include: {
            epoch: true,
          }
        },
      }
    });

    if (!userData) {
      return NextResponse.json({ positions: [] });
    }

    // Format the response
    const formattedPositions = userData.positions.map(pos => ({
      epochId: pos.epochId,
      ptBalance: pos.ptBalance,
      ytBalance: pos.ytBalance,
      vaultShares: pos.vaultShares,
      underlyingAsset: pos.epoch.underlyingAsset,
      maturity: pos.epoch.maturityLedger,
    }));

    return NextResponse.json({ positions: formattedPositions });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
