import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role, MaintenanceEventType } from '@prisma/client';

// Zod schema for creating a maintenance event
const maintenanceEventSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255),
  description: z.string().optional().nullable(),
  startDate: z.string().datetime({ message: "Invalid start date format" }),
  endDate: z.string().datetime({ message: "Invalid end date format" }).optional().nullable(),
  type: z.nativeEnum(MaintenanceEventType, { message: "Invalid maintenance type" }),
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

// POST: Create a new maintenance event
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = maintenanceEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { title, description, startDate, endDate, type } = validation.data;

    const dataToCreate = {
      title,
      description: description, // Zod handles optional/nullable
      startDate: new Date(startDate), // startDate is a valid ISO string from z.string().datetime()
      endDate: (typeof endDate === 'string' && endDate) ? new Date(endDate) : null, // Ensure endDate is string before new Date()
      type,
      authorId: currentUser.id,
    };

    const newMaintenanceEvent = await prisma.maintenanceEvent.create({
      data: dataToCreate,
    });

    return NextResponse.json(newMaintenanceEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance event:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ message: 'An error occurred while creating the maintenance event' }, { status: 500 });
  }
}

// GET: Fetch all maintenance events (for admin or public, depending on needs)
export async function GET(req: NextRequest) {
  // For now, let's assume this is for admins to see all events.
  // Public fetching for employee dashboard might be filtered (e.g., only upcoming)
  const currentUser = await getCurrentUser(req);
   if (!currentUser || currentUser.role !== Role.ADMIN) {
    // If not admin, fetch only upcoming/active events for public view (e.g., employee dashboard)
    try {
        const now = new Date();
        const upcomingEvents = await prisma.maintenanceEvent.findMany({
            where: {
                OR: [
                    { startDate: { gte: now } }, // Starts in the future
                    { endDate: { gte: now } },   // Ends in the future (ongoing)
                    { endDate: null, startDate: { lte: now } } // No end date, started and ongoing
                ]
            },
            orderBy: { startDate: 'asc' },
            include: { author: { select: { firstName: true, lastName: true } } },
        });
        return NextResponse.json(upcomingEvents, { status: 200 });
    } catch (error) {
        console.error('Error fetching public maintenance events:', error);
        return NextResponse.json({ message: 'An error occurred while fetching maintenance events' }, { status: 500 });
    }
  }

  // Admin fetching all maintenance events
  try {
    const maintenanceEvents = await prisma.maintenanceEvent.findMany({
      orderBy: { startDate: 'desc' }, // Show most recent start dates first for admin
      include: { author: { select: { firstName: true, lastName: true, email: true }} },
    });
    return NextResponse.json(maintenanceEvents, { status: 200 });
  } catch (error) {
    console.error('Error fetching maintenance events for admin:', error);
    return NextResponse.json({ message: 'An error occurred while fetching maintenance events' }, { status: 500 });
  }
}