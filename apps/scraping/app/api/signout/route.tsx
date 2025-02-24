import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_STACK_API_URL;
    const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;

    const refreshToken = (await cookies()).get('refresh_token')?.value;

    const response = NextResponse.json({ success: true });

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

    if (apiUrl && refreshToken) {
      try {
        const headers: Record<string, string> = {
          "x-stack-access-type": "client",
          //"x-stack-project-id": projectId,
          //"x-stack-publishable-client-key": process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
          "x-stack-refresh-token": refreshToken,
        };

        if (projectId) {
          headers["x-stack-project-id"] = projectId;
        }

        if (process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY) {
          headers["x-stack-publishable-client-key"] = process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;
        }

        const signOutResponse = await fetch(`${apiUrl}/api/v1/auth/sessions/current`, {
          method: 'DELETE',
          headers: headers,
        });

        if (!signOutResponse.ok) {
          const data = await signOutResponse.json();
          console.error('Failed to sign out from Stack Auth:', data);
        }
      } catch (stackAuthError) {
        console.error('Stack Auth signout error:', stackAuthError);
      }
    }

    return response;

  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { error: "An error occurred during sign out" },
      { status: 500 }
    );
  }
}
