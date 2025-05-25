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

    const records = await prisma.taximetro.findMany({ // ← Nombre exacto del modelo
      where: { userId },
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          select: {
            email: true
          }
        }
      }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error('[TAXIMETRO_GET]', error);
    return NextResponse.json(
      { error: 'Error al obtener registros.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { kmrecord } = await request.json();

    const cookie = request.headers.get('cookie');
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1];

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const newRecord = await prisma.taximetro.create({ // ← Nombre exacto del modelo
      data: {
        kmrecord: Number(kmrecord),
        userId
      }
    });

    return NextResponse.json(
      { 
        message: 'Registro guardado',
        record: newRecord 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[TAXIMETRO_POST]', error);
    return NextResponse.json(
      { error: 'Error al registrar' },
      { status: 500 }
    );
  }
}