import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const authToken = (await cookieStore).get('auth_token');

    if (!authToken) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
      
      response.cookies.set('auth_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      response.cookies.set('refresh_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/'
      });
      
      return response;
    }

    const apiUrl = process.env.NEXT_PUBLIC_STACK_API_URL;
    const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

    const headers: Record<string, string> = {
      "x-stack-access-type": "client",
      "x-stack-project-id": projectId!,
      "x-stack-access-token": authToken.value,
    }

    if (process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) {
      headers["x-stack-publishable-client-key"] = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
    }

    const response = await fetch(`${apiUrl}/api/v1/users/me`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      const errorResponse = NextResponse.json(
        { error: error?.message || "Failed to fetch user data" },
        { status: response.status }
      );
      
      if (response.status === 401) {
        errorResponse.cookies.set('auth_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 0,
          path: '/'
        });
        
        errorResponse.cookies.set('refresh_token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 0,
          path: '/'
        });
      }
      
      return errorResponse;
    }

    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    const errorResponse = NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
    
    errorResponse.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    errorResponse.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    });
    
    return errorResponse;
  }
}