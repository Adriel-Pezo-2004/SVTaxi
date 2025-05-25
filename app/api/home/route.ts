import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    // Obtener userId de la cookie
    const cookie = request.headers.get('cookie');
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1];

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Usando MongoDB Aggregation para sumar los kilómetros
    const totalKilometers = await prisma.taximetro.aggregate({
      where: { userId },
      _sum: {
        kmrecord: true
      }
    });

    // Obtener los registros normales
    const [savings, taximetroRecords] = await Promise.all([
      prisma.savings.findMany({
        where: { userId },
        orderBy: { fecha: 'desc' },
      }),
      prisma.taximetro.findMany({
        where: { userId },
        orderBy: { fecha: 'desc' },
      })
    ]);

    return NextResponse.json({
      savings,
      taximetroRecords,
      totals: {
        kilometers: totalKilometers._sum.kmrecord || 0,
        earnings: savings.reduce((sum, s) => sum + s.IngresoNeto, 0)
      }
    });

  } catch (error) {
    console.error('[HOME_GET]', error);
    return NextResponse.json(
      { error: 'Error al obtener registros' },
      { status: 500 }
    );
  }
}