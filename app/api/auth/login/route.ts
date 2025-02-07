import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password !== 'bilalhoca2025') {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400 // 1 day
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 