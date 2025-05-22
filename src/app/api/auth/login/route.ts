import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Role } from '@prisma/client'; // Import Role enum

// Schema for Employee Login
const employeeLoginSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  idNumber: z.string().min(1, { message: "ID Number (password) is required" }),
});

// Schema for Admin Login
const adminLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(1, { message: "Password is required" }),
});

// Combined schema using union
const loginSchema = z.union([employeeLoginSchema, adminLoginSchema]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Correct way to get IP in Next.js Edge/Node.js runtime, x-forwarded-for is common
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                      req.headers.get('x-real-ip') ||
                      // req.connection?.remoteAddress; // This is more for Node.js http server, NextRequest might not have it directly
                      null; // Fallback to null if not found
    const userAgent = req.headers.get('user-agent'); // Get User Agent

    // Validate request body with combined Zod schema
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      // Provide more generic validation error for security
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
      // Or more detailed: return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = validation.data;
    let user = null;
    let isPasswordValid = false;
    let attemptedIdentifier = "";

    // Check if it's an admin login attempt (email is present)
    if ('email' in data) {
      attemptedIdentifier = data.email;
      user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (user && user.passwordHash && user.role === Role.ADMIN) {
        isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
      }
    }
    // Otherwise, assume employee login attempt
    else if ('firstName' in data) {
      attemptedIdentifier = `${data.firstName} ${data.lastName}`;
      console.log(`Login attempt for employee: ${data.firstName} ${data.lastName}`);
      
      const allUsers = await prisma.user.findMany({
        where: { role: Role.EMPLOYEE }
      });
      
      const foundUser = allUsers.find(u => {
        const dbFirstName = (u.firstName || '').toLowerCase().trim();
        const dbLastName = (u.lastName || '').toLowerCase().trim();
        const inputFirstName = data.firstName.toLowerCase().trim();
        const inputLastName = data.lastName.toLowerCase().trim();
        return dbFirstName === inputFirstName && dbLastName === inputLastName;
      });
      
      if (foundUser && foundUser.idNumberHash) {
         user = foundUser;
         isPasswordValid = await bcrypt.compare(data.idNumber, foundUser.idNumberHash);
      }
    }

    // Log the attempt
    await prisma.loginAttempt.create({
      data: {
        attemptedIdentifier,
        success: isPasswordValid && user !== null,
        ipAddress: ipAddress || 'N/A',
        userAgent: userAgent || 'N/A',
        userId: user ? user.id : null,
      }
    });

    // Check if user was found and password is valid
    if (!user || !isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Don't send hashes back to the client
    const { idNumberHash, passwordHash, ...userWithoutPassword } = user;

    // Parse JSON strings back to arrays
    const userWithParsedArrays = {
      ...userWithoutPassword,
      agreedPolicies: JSON.parse(userWithoutPassword.agreedPolicies as unknown as string || '[]'),
      completedTools: JSON.parse(userWithoutPassword.completedTools as unknown as string || '[]')
    };

    // Login successful - return user data including the role
    return NextResponse.json({ message: 'Login successful', user: userWithParsedArrays }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    // Avoid returning Zod errors directly in production for security
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  }
}