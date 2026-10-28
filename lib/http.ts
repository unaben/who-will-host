import { NextResponse } from 'next/server';
import type { EventFormErrors } from '@/features/events/events.types';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: EventFormErrors,
  ) {
    super(message);
  }
}

export async function readJson<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError(400, 'The request body must be valid JSON.');
  }
}

/** Wraps a route handler so thrown ApiErrors become tidy JSON responses. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.errors },
        { status: error.status },
      );
    }
    console.error(error);
    return NextResponse.json({ message: 'Something went wrong on our side.' }, { status: 500 });
  }
}
