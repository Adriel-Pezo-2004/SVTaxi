import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const savings = await prisma.savings.findMany({
      select: {
        id: true,
        fecha: true,
        IngresoTotal: true,
        gastoGaso: true,
        gastoComision: true,
        IngresoNeto: true,
        userId: true,
      },
      orderBy: { fecha: 'desc' },
    });
    return NextResponse.json({ savings });
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching savings' }, { status: 500 });
  }
}