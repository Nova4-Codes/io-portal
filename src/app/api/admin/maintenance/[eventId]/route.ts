import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role, MaintenanceEventType } from '@prisma/client';

// Zod schema for updating a maintenance event (all fields optional)
const updateMaintenanceEventSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty" }).max(255).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime({ message: "Invalid start date format" }).optional(),
  endDate: z.string().datetime({ message: "Invalid end date format" }).optional().nullable(),
  type: z.nativeEnum(MaintenanceEventType, { message: "Invalid maintenance type" }).optional(),
});

// Placeholder for getting current user's ID and role (MOCK)
async function getCurrentUser(req: NextRequest) {
  const tempAdminId = 4; // Replace with actual admin ID or auth logic
  const user = await prisma.user.findUnique({ where: { id: tempAdminId }});
  if (user && user.role === Role.ADMIN) {
    return { id: user.id, role: user.role };
  }
  return null;
}

// GET: Fetch a single maintenance event by ID
export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  const eventId = parseInt(params.eventId, 10);
  if (isNaN(eventId)) {
    return NextResponse.json({ message: 'Invalid event ID' }, { status: 400 });
  }

  try {
    const maintenanceEvent = await prisma.maintenanceEvent.findUnique({
      where: { id: eventId },
      include: { author: { select: { firstName: true, lastName: true, email: true }} },
    });

    if (!maintenanceEvent) {
      return NextResponse.json({ message: 'Maintenance event not found' }, { status: 404 });
    }
    return NextResponse.json(maintenanceEvent, { status: 200 });
  } catch (error) {
    console.error(`Error fetching maintenance event ${eventId}:`, error);
    return NextResponse.json({ message: 'An error occurred while fetching the event' }, { status: 500 });
  }
}

// PUT: Update an existing maintenance event
export async function PUT(req: NextRequest, { params }: { params: { eventId: string } }) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const eventId = parseInt(params.eventId, 10);
  if (isNaN(eventId)) {
    return NextResponse.json({ message: 'Invalid event ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validation = updateMaintenanceEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (validation.data.title !== undefined) dataToUpdate.title = validation.data.title;
    if (validation.data.description !== undefined) dataToUpdate.description = validation.data.description;
    if (validation.data.startDate !== undefined) dataToUpdate.startDate = new Date(validation.data.startDate);
    if (validation.data.endDate !== undefined) dataToUpdate.endDate = validation.data.endDate ? new Date(validation.data.endDate) : null;
    if (validation.data.type !== undefined) dataToUpdate.type = validation.data.type;
    
    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedEvent = await prisma.maintenanceEvent.update({
      where: { id: eventId },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating maintenance event ${eventId}:`, error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 400 });
    }
    if (error.code === 'P2025') { // Prisma error code for "Record to update not found."
        return NextResponse.json({ message: 'Maintenance event not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'An error occurred while updating the event' }, { status: 500 });
  }
}

// DELETE: Delete a maintenance event
export async function DELETE(req: NextRequest, { params }: { params: { eventId: string } }) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const eventId = parseInt(params.eventId, 10);
  if (isNaN(eventId)) {
    return NextResponse.json({ message: 'Invalid event ID' }, { status: 400 });
  }

  try {
    await prisma.maintenanceEvent.delete({
      where: { id: eventId },
    });
    return NextResponse.json({ message: 'Maintenance event deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting maintenance event ${eventId}:`, error);
    if (error.code === 'P2025') { // Prisma error code for "Record to delete does not exist."
        return NextResponse.json({ message: 'Maintenance event not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'An error occurred while deleting the event' }, { status: 500 });
  }
}