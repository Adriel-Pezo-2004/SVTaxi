import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { fecha, IngresoTotal, gastoGaso, gastoComision } = await request.json();

    // Obtener userId de la cookie
    const cookie = request.headers.get('cookie');
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1];

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let IngresoNeto = Number(IngresoTotal) - Number(gastoGaso) - Number(gastoComision);
    IngresoNeto = Math.round(IngresoNeto * 100) / 100;

    const saving = await prisma.savings.create({
      data: {
        fecha: new Date(fecha),
        IngresoTotal: Number(IngresoTotal),
        gastoGaso: Number(gastoGaso),
        gastoComision: Number(gastoComision),
        IngresoNeto,
        userId,
      },
    });

    return NextResponse.json({ message: 'Registro guardado correctamente.', IngresoNeto, saving });
  } catch (error) {
    return NextResponse.json({ error: 'Error al registrar ingreso.' }, { status: 500 });
  }
}