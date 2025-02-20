import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_STACK_API_URL;
    const projectId = process.env.NEXT_PUBLIC_STACK_PROJECT_ID;
    const secretKey = process.env.STACK_SECRET_SERVER_KEY;

    if (!projectId || !secretKey) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const authPayload = {
      email,
      password
    };

    const response = await fetch(`${apiUrl}/api/v1/auth/password/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-stack-access-type": "client",
        "x-stack-project-id": projectId,
        "x-stack-publishable-client-key": process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      },
      body: JSON.stringify(authPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Login error response:', {
        status: response.status,
        data: data
      });
      return NextResponse.json(
        { error: data?.message || "Login failed" },
        { status: response.status }
      );
    }

    const response_data = {
      success: true,
      user: data
    };

    const response_with_cookie = NextResponse.json(response_data);

    response_with_cookie.cookies.set('auth_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 // 1 week
    });

    response_with_cookie.cookies.set('refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response_with_cookie;

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}