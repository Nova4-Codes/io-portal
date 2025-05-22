import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Placeholder for getting current user's ID and role - MOCK
async function getCurrentUser(req: NextRequest) {
  // MOCK: Replace with actual authentication
  // For now, let's assume admin ID 4 for testing, or adjust as needed.
  // IMPORTANT: This needs to be replaced with a real auth check.
  const tempAdminId = 4; 
  const user = await prisma.user.findUnique({ where: { id: tempAdminId }});
  if (user && user.role === Role.ADMIN) {
    return { id: user.id, role: user.role };
  }
  return null;
}

// DELETE: Delete a user
export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  const currentUser = await getCurrentUser(req);
  if (!currentUser || currentUser.role !== Role.ADMIN) {
    console.error('DELETE /api/admin/users/[userId] - Unauthorized attempt');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(params.userId, 10);
  console.log(`DELETE /api/admin/users/[userId] - Attempting to delete user with ID: ${params.userId}, Parsed ID: ${userId}`);

  if (isNaN(userId)) {
    console.error(`DELETE /api/admin/users/[userId] - Invalid ID: ${params.userId}`);
    return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
  }

  // Prevent admin from deleting themselves (optional, but good practice)
  if (userId === currentUser.id) {
    console.warn(`DELETE /api/admin/users/[userId] - Admin user ${currentUser.id} attempted to delete themselves.`);
    return NextResponse.json({ message: 'Admins cannot delete their own account through this endpoint.' }, { status: 403 });
  }

  try {
    console.log(`DELETE /api/admin/users/[userId] - Prisma delete call for user ID: ${userId}`);
    
    // Before deleting a user, you might need to handle related records
    // (e.g., if LoginAttempt has a foreign key to User, those might need to be cascaded or handled)
    // For now, assuming direct delete is okay or cascading deletes are set up in Prisma schema.

    await prisma.user.delete({
      where: { id: userId },
    });
    console.log(`DELETE /api/admin/users/[userId] - Successfully deleted user ID: ${userId}`);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting user ${userId}:`, error);
    // Check for Prisma's record not found error
    if (error.code === 'P2025') { // Prisma error code for "Record to delete does not exist."
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    // Handle other potential errors, e.g., foreign key constraints if not handled by cascading deletes
    if (error.code === 'P2003') { // Foreign key constraint failed
        console.error(`Foreign key constraint failed for user ${userId}:`, error.meta?.field_name);
        return NextResponse.json({ message: `Cannot delete user. Related records exist (e.g., login attempts). Please handle these first or ensure cascading deletes are configured. Field: ${error.meta?.field_name}` }, { status: 409 }); // 409 Conflict
    }
    return NextResponse.json({ message: 'An error occurred while deleting the user' }, { status: 500 });
  }
}