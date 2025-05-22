import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Removed Role import again

// IMPORTANT: Add proper authentication/authorization checks here for production!
// This endpoint should only be accessible by authenticated users with the ADMIN role.
// This might involve checking a session token, JWT, or similar mechanism.

export async function GET(req: NextRequest) {
  // --- Placeholder for Auth Check ---
  // const session = await getServerSession(authOptions); // Example using NextAuth.js
  // if (!session || session.user.role !== Role.ADMIN) {
  //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  // }
  // --- End Placeholder ---

  try {
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE', // Using string literal directly
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        agreedPolicies: true,
        completedTools: true,
        createdAt: true,
        // Add other fields relevant to onboarding status if needed
      },
      orderBy: {
        createdAt: 'desc', // Optional: order by creation date
      }
    });

    return NextResponse.json({ users: employees }, { status: 200 });

  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ message: 'An error occurred while fetching employees' }, { status: 500 });
  }
}