import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("auth");

  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const informations = await prisma.information.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(informations);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("auth");

  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const information = await prisma.information.create({
      data: {
        text: body.text,
        category: body.category,
      },
    });
    return NextResponse.json(information);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const cookieStore = cookies();
  const authCookie = cookieStore.get("auth");

  if (!authCookie || authCookie.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const information = await prisma.information.update({
      where: { id: body.id },
      data: {
        text: body.text,
        category: body.category,
      },
    });
    return NextResponse.json(information);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
