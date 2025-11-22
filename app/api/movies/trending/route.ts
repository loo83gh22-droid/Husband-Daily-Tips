import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Get trending movies from TMDB that are available on Netflix
 * Filters for relationship-friendly genres (romance, comedy, drama)
 * GET /api/movies/trending
 */
export async function GET(request: Request) {
  try {
    const tmdbApiKey = process.env.TMDB_API_KEY;

    if (!tmdbApiKey) {
      console.warn('TMDB_API_KEY not set, returning empty results');
      return NextResponse.json({ movies: [] });
    }

    // Fetch trending movies from TMDB
    const trendingResponse = await fetch(
      `https://api.themoviedb.org/3/trending/movie/week?api_key=${tmdbApiKey}`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!trendingResponse.ok) {
      throw new Error('Failed to fetch trending movies from TMDB');
    }

    const trendingData = await trendingResponse.json();
    const trendingMovies = trendingData.results || [];

    // Filter for relationship-friendly genres
    // Genre IDs: 35 = Comedy, 18 = Drama, 10749 = Romance, 10402 = Music, 10751 = Family
    const relationshipFriendlyGenres = [35, 18, 10749, 10402, 10751];
    
    // Also exclude horror (27), thriller (53), action (28) if they're the primary genre
    const excludedGenres = [27, 53, 28];

    const filteredMovies = trendingMovies
      .filter((movie: any) => {
        // Must have at least one relationship-friendly genre
        const hasFriendlyGenre = movie.genre_ids?.some((id: number) =>
          relationshipFriendlyGenres.includes(id)
        );

        // Should not be primarily a horror/thriller/action
        const primaryGenre = movie.genre_ids?.[0];
        const isExcluded = excludedGenres.includes(primaryGenre);

        // Must have a reasonable rating (at least 5.0)
        const hasGoodRating = movie.vote_average >= 5.0;

        return hasFriendlyGenre && !isExcluded && hasGoodRating;
      })
      .slice(0, 6) // Limit to 6 movies
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        posterPath: movie.poster_path
          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : null,
        backdropPath: movie.backdrop_path
          ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
          : null,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        genreIds: movie.genre_ids,
      }));

    // For each movie, check if it's available on Netflix (using JustWatch API if available, or skip)
    // For now, we'll just return the filtered movies
    // In the future, we could integrate with JustWatch API to verify Netflix availability

    return NextResponse.json({ movies: filteredMovies });
  } catch (error: any) {
    console.error('Error fetching trending movies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending movies', movies: [] },
      { status: 500 }
    );
  }
}

