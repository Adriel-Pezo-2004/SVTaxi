import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { kmrecord } = await request.json();
    const { id } = await params;

    const cookie = request.headers.get('cookie');
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1];

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const updatedRecord = await prisma.taximetro.update({
      where: { id, userId },
      data: { kmrecord: Number(kmrecord) }
    });

    return NextResponse.json({
      message: 'Registro actualizado',
      record: updatedRecord
    });
  } catch (error) {
    console.error('[TAXIMETRO_PUT]', error);
    return NextResponse.json(
      { error: 'Error al actualizar registro.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }){
  try {
    const { id } = await params;

    const cookie = request.headers.get('cookie');
    const userId = cookie
      ?.split('; ')
      .find(row => row.startsWith('userId='))
      ?.split('=')[1];

    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await prisma.taximetro.delete({
      where: { id, userId }
    });

    return NextResponse.json({ message: 'Registro eliminado' });
  } catch (error) {
    console.error('[TAXIMETRO_DELETE]', error);
    return NextResponse.json(
      { error: 'Error al eliminar registro.' },
      { status: 500 }
    );
  }
}