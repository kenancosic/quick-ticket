'use server';

import { prisma } from "@/db/prisma";
import bcrypt from "bcryptjs";
import { logEvent } from "@/utils/sentry";
import { signAuthToken, setAuthCookie, removeAuthCookie } from "@/lib/auth";

type ResponseResult = {
  success: boolean;
  message: string;
}

//Register a new user
export async function registerUser(prevState: ResponseResult, formData: FormData): Promise<ResponseResult> {
  
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      logEvent(
        "Validation Error: missing register fields",
        "auth",
        { name, email },
        "warning"
      );
      return { success: false, message: "All fields are required" };
    }

    //Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if(existingUser){
      logEvent(
        `Registration failed: User already exists: ${email}`,
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "User already exists" };
    }
    //Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Sign and set auth token

    const token  = await signAuthToken({userId: user.id});
    await setAuthCookie(token);

    logEvent(
      `User registered successfully: ${email}`,
      "auth",
      { userId: user.id, email },
      "info"
    );
    return { success: true, message: "User registered successfully" };
  } catch (error) {
    logEvent(
      "Unexpected error occured while registering user",
      "auth",
      {},
      "error",
      error
    );
    return {success: false, message: "Failed to register user"};
  }
}

// Log user out and remove auth cookie
export async function logoutUser(): Promise<ResponseResult> {
  try {
    await removeAuthCookie();
    logEvent('User logged out successfully', 'auth', {}, 'info');
    return {success: true, message: 'User logged out successfully'};

  } catch (error) {
    logEvent('Unexpected error during logout', 'auth', {}, 'error', error);
    return {success: false, message: 'Logout failed. Please try again.'};
  }
}

//Log user in and set auth cookie
export async function loginUser(prevState: ResponseResult, formData: FormData): Promise<ResponseResult> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      logEvent(
        "Validation Error: missing login fields",
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "Email and password fields are required" };
    }

    //Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if(!user || !user.password){
      logEvent(
        `Login failed: User not found or invalid password: ${email}`,
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "Invalid email or password" };
    }

    //Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if(!isPasswordValid){
      logEvent(
        `Login failed: Invalid password for user: ${email}`,
        "auth",
        { email },
        "warning"
      );
      return { success: false, message: "Invalid email or password" };
    }

    //Log user in
    const token = await signAuthToken({userId: user.id});
    
    await setAuthCookie(token);
    logEvent(
      `User logged in successfully: ${email}`,
      "auth",
      { userId: user.id, email },
      "info"
    );
    return { success: true, message: "User logged in successfully" };
  } catch (error) {
    logEvent(
      "Unexpected error occured while logging in user",
      "auth",
      {},
      "error",
      error
    );
    return {success: false, message: "Failed to log in user"};
  }
}