import { NextResponse } from "next/server";
import { getMovieDetails } from "@/lib/tmdb";

// GET /api/movies/[id] — full details for one movie (used by the modal).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const movieId = Number(id);

  if (!Number.isFinite(movieId) || movieId <= 0) {
    return NextResponse.json({ error: "Invalid movie id." }, { status: 400 });
  }

  try {
    const data = await getMovieDetails(movieId);
    return NextResponse.json(data);
  } catch (err) {
    console.error(`/api/movies/${id} error:`, err);
    return NextResponse.json(
      { error: "Failed to load movie details." },
      { status: 500 }
    );
  }
}
