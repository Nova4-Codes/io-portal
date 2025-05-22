import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { Role } from '@prisma/client';

// Zod schema for creating/updating an announcement
const announcementSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }).max(255),
  content: z.string().min(1, { message: "Content is required" }),
  // publishedAt: z.string().datetime({ offset: true }).optional().nullable(), // REMOVED
  isActive: z.boolean().optional(),
  authorId: z.number().int().positive().optional(), // Assuming authorId will be passed if known
});

// Placeholder for getting current user's ID and role (replace with actual auth logic)
// In a real app, you'd get this from the session/token
async function getCurrentUser(req: NextRequest) {
  // This is a MOCK. Replace with your actual authentication check.
  // For now, let's assume an admin with ID 1 is making the request.
  // You need to implement proper session/token validation here.
  const tempAdminId = 4; // Updated to actual admin ID
  const user = await prisma.user.findUnique({ where: { id: tempAdminId }});
  if (user && user.role === Role.ADMIN) {
    return { id: user.id, role: user.role };
  }
  return null;
}

// POST: Create a new announcement
export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = announcementSchema.safeParse(body);

    if (!validation.success) {
      console.error("POST /api/admin/announcements - Validation failed:", validation.error.flatten().fieldErrors);
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { title, content, isActive } = validation.data; // Removed publishedAt
    console.log("POST /api/admin/announcements - Validated data:", validation.data);

    const dataToCreate = {
      title,
      content,
      // publishedAt: publishedAt ? new Date(publishedAt) : null, // REMOVED
      isActive: isActive === undefined ? true : isActive,
      authorId: currentUser.id,
    };
    console.log("POST /api/admin/announcements - Data to create in Prisma:", dataToCreate);

    const newAnnouncement = await prisma.announcement.create({
      data: dataToCreate,
    });
    console.log("POST /api/admin/announcements - Created announcement:", newAnnouncement);

    return NextResponse.json(newAnnouncement, { status: 201 });
  } catch (error) {
    console.error('Error creating announcement:', error);
    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Validation failed', errors: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ message: 'An error occurred while creating the announcement' }, { status: 500 });
  }
}

// GET: Fetch all announcements (for admin dashboard)
export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser(req);
   // For admin, allow fetching all. For public, might be different.
  if (!currentUser || currentUser.role !== Role.ADMIN) {
     // If not admin, try to handle as a public request for active announcements
     try {
        // const now = new Date(); // No longer needed for publishedAt check
        const announcements = await prisma.announcement.findMany({
          where: {
            isActive: true,
            // OR: [ // REMOVED publishedAt logic
            //   { publishedAt: null },
            //   { publishedAt: { lte: now } }
            // ]
          },
          orderBy: { createdAt: 'desc' },
          include: { author: { select: { firstName: true, lastName: true, email: true }} },
        });
        console.log("GET /api/admin/announcements - Public announcements fetched:", announcements.length, "items. First item:", announcements[0]);
        return NextResponse.json(announcements, { status: 200 });
      } catch (error) {
        console.error('Error fetching public announcements:', error);
        return NextResponse.json({ message: 'An error occurred while fetching announcements' }, { status: 500 });
      }
  }

  // Admin fetching all announcements
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true, email: true }} }, // Include author details
    });
    console.log("GET /api/admin/announcements - Admin announcements fetched:", announcements.length, "items. First item:", announcements[0]);
    return NextResponse.json(announcements, { status: 200 });
  } catch (error) {
    console.error('Error fetching announcements for admin:', error);
    return NextResponse.json({ message: 'An error occurred while fetching announcements' }, { status: 500 });
  }
}