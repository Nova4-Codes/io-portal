
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerUserSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required" }),
  lastName: z.string().trim().min(1, { message: "Last name is required" }),
  idNumber: z.string()
    .trim()
    .regex(/^[0-9]+$/, { message: "Password must contain only digits" })
    .min(6, { message: "Password must be at least 6 digits long" })
    .max(8, { message: "Password must be no more than 8 digits long" }),
  userRole: z.string().min(1, { message: "User role is required" }),
  currentAgreedPolicies: z.array(z.string()).min(1, { message: "At least one policy must be agreed to" }), // Keep or adjust as needed
  currentCompletedTools: z.array(z.string()).min(1, { message: "At least one tool must be completed" }), // Keep or adjust as needed
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body with Zod
    const validation = registerUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const {
      firstName,
      lastName,
      idNumber,
      userRole,
      currentAgreedPolicies,
      currentCompletedTools
    } = validation.data;
    
    // Check if an EMPLOYEE with this name already exists
    const existingEmployeeByName = await prisma.user.findFirst({
      where: {
        firstName: firstName,
        lastName: lastName,
        role: 'EMPLOYEE' // Ensure we only check against other employees
      },
    });

    if (existingEmployeeByName) {
      return NextResponse.json({ message: 'User with this first and last name already exists' }, { status: 409 }); // 409 Conflict
    }

    // Also check if an employee with this ID number already exists
    // We need to compare hashed values, so we'll need to get all employees and check manually
    const allEmployees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        idNumberHash: true
      }
    });

    // Check each employee's ID number against the provided one
    for (const employee of allEmployees) {
      // Skip if idNumberHash is null
      if (!employee.idNumberHash) continue;
      
      const idNumberMatch = await bcrypt.compare(idNumber, employee.idNumberHash);
      if (idNumberMatch) {
        return NextResponse.json({
          message: `Password already in use by ${employee.firstName} ${employee.lastName}`
        }, { status: 409 }); // 409 Conflict
      }
    }

    // Hash the ID number (password)
    const saltRounds = 10;
    const idNumberHash = await bcrypt.hash(idNumber, saltRounds);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        idNumberHash,
        role: 'EMPLOYEE', // Explicitly set role to EMPLOYEE for registration
        agreedPolicies: JSON.stringify(currentAgreedPolicies) as any,
        completedTools: JSON.stringify(currentCompletedTools) as any,
      },
    });

    // Don't send the hash back to the client
    const { idNumberHash: _, ...userWithoutPassword } = newUser;

    // Parse JSON strings back to arrays
    const userWithParsedArrays = {
      ...userWithoutPassword,
      agreedPolicies: JSON.parse(userWithoutPassword.agreedPolicies as unknown as string || '[]'),
      completedTools: JSON.parse(userWithoutPassword.completedTools as unknown as string || '[]')
    };

    return NextResponse.json({ message: 'User registered successfully', user: userWithParsedArrays }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) { // Catch Zod validation errors specifically if safeParse wasn't enough (shouldn't happen with safeParse)
      return NextResponse.json({ message: 'Validation error', errors: error.flatten().fieldErrors }, { status: 400 });
    }
    // Consider more specific Prisma error handling if needed
    // e.g., if (error.code === 'P2002') for unique constraint violations, though findUnique handles this.
    return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
  }
}