import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const snapshots = await prisma.tvlSnapshot.findMany({
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    return NextResponse.json({ 
      snapshots: snapshots.reverse() 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
