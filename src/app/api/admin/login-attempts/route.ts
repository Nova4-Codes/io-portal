import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Mock function to get current user - replace with actual auth
async function getCurrentUser(req: NextRequest) {
  const tempAdminId = 4; // Using the known admin ID
  const user = await prisma.user.findUnique({ where: { id: tempAdminId } });
  if (user && user.role === Role.ADMIN) {
    return { id: user.id, role: user.role };
  }
  return null;
}

export async function GET(req: NextRequest) {
  const currentUser = await getCurrentUser(req);

  if (!currentUser || currentUser.role !== Role.ADMIN) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const loginAttempts = await prisma.loginAttempt.findMany({
      orderBy: {
        timestamp: 'desc', // Show most recent attempts first
      },
      take: 100, // Limit to the latest 100 attempts for performance
      include: {
        user: { // If userId is present, include some user details
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
    return NextResponse.json(loginAttempts, { status: 200 });
  } catch (error) {
    console.error('Error fetching login attempts:', error);
    return NextResponse.json({ message: 'An error occurred while fetching login attempts' }, { status: 500 });
  }
}