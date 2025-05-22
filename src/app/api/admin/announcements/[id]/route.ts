import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';

// Zod schema for updating an announcement (all fields optional)
const updateAnnouncementSchema = z.object({
  title: z.string().min(1, { message: "Title cannot be empty" }).max(255).optional(),
  content: z.string().min(1, { message: "Content cannot be empty" }).optional(),
  // publishedAt: z.string().datetime({ offset: true }).optional().nullable(), // REMOVED
  isActive: z.boolean().optional(),
});

// Placeholder for getting current user's ID and role
async function getCurrentUser(req: NextRequest) {
  // MOCK: Replace with actual authentication
  const tempAdminId = 4; // Updated to actual admin ID
  const user = await prisma.user.findUnique({ where: { id: tempAdminId }});
  if (user && user.role === Role.ADMIN) {
    return { id: user.id, role: user.role };
  }
  return null;
}

// GET: Fetch a single announcement by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    // For public access, you might want a different check or endpoint
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid announcement ID' }, { status: 400 });
  }

  try {
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: { author: { select: { firstName: true, lastName: true, email: true }} },
    });

    if (!announcement) {
      return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json(announcement, { status: 200 });
  } catch (error) {
    console.error(`Error fetching announcement ${id}:`, error);
    return NextResponse.json({ message: 'An error occurred while fetching the announcement' }, { status: 500 });
  }
}


// PUT: Update an existing announcement
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    return NextResponse.json({ message: 'Invalid announcement ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const validation = updateAnnouncementSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const dataToUpdate: { title?: string; content?: string; isActive?: boolean } = {}; // Removed publishedAt
    if (validation.data.title !== undefined) dataToUpdate.title = validation.data.title;
    if (validation.data.content !== undefined) dataToUpdate.content = validation.data.content;
    // if (validation.data.publishedAt !== undefined) { // REMOVED
    //   dataToUpdate.publishedAt = validation.data.publishedAt ? new Date(validation.data.publishedAt) : null; // REMOVED
    // } // REMOVED
    if (validation.data.isActive !== undefined) dataToUpdate.isActive = validation.data.isActive;

    if (Object.keys(dataToUpdate).length === 0) {
        return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
    }

    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedAnnouncement, { status: 200 });
  } catch (error) {
    console.error(`Error updating announcement ${id}:`, error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 400 });
    }
    // Check for Prisma's record not found error
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'An error occurred while updating the announcement' }, { status: 500 });
  }
}

// DELETE: Delete an announcement
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    console.error('DELETE /api/admin/announcements/[id] - Unauthorized attempt');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const id = parseInt(params.id, 10);
  console.log(`DELETE /api/admin/announcements/[id] - Attempting to delete announcement with ID: ${params.id}, Parsed ID: ${id}`);

  if (isNaN(id)) {
    console.error(`DELETE /api/admin/announcements/[id] - Invalid ID: ${params.id}`);
    return NextResponse.json({ message: 'Invalid announcement ID' }, { status: 400 });
  }

  try {
    console.log(`DELETE /api/admin/announcements/[id] - Prisma delete call for ID: ${id}`);
    await prisma.announcement.delete({
      where: { id },
    });
    console.log(`DELETE /api/admin/announcements/[id] - Successfully deleted announcement ID: ${id}`);
    return NextResponse.json({ message: 'Announcement deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error) {
    console.error(`Error deleting announcement ${id}:`, error);
    // Check for Prisma's record not found error
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ message: 'Announcement not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'An error occurred while deleting the announcement' }, { status: 500 });
  }
}