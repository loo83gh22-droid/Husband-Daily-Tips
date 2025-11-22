'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
}

export default function MovieSuggestions() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch('/api/movies/trending', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setMovies(data.movies || []);
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-800 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-slate-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null; // Don't show if no movies
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-50">Date Night Ideas</h3>
          <p className="text-xs text-slate-400 mt-1">
            Trending movies perfect for couples
          </p>
        </div>
        <span className="text-2xl">🎬</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="group relative bg-slate-800/50 rounded-lg overflow-hidden border border-slate-700/50 hover:border-primary-500/50 transition-all cursor-pointer"
          >
            {movie.posterPath ? (
              <div className="relative aspect-[2/3] w-full">
                <Image
                  src={movie.posterPath}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="aspect-[2/3] w-full bg-slate-700 flex items-center justify-center">
                <span className="text-slate-500 text-2xl">🎬</span>
              </div>
            )}

            <div className="p-3">
              <h4 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-2">
                {movie.title}
              </h4>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-slate-400">
                  {movie.releaseDate?.split('-')[0] || 'N/A'}
                </span>
                {movie.voteAverage > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-primary-400">
                      ⭐ {movie.voteAverage.toFixed(1)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{movie.overview}</p>
            </div>

            {/* Hover overlay with more info */}
            <div className="absolute inset-0 bg-slate-900/95 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
              <h4 className="text-base font-semibold text-slate-100 mb-2">{movie.title}</h4>
              <p className="text-xs text-slate-300 mb-3 line-clamp-3">{movie.overview}</p>
              <a
                href={`https://www.themoviedb.org/movie/${movie.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary-400 hover:text-primary-300 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                View on TMDB →
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        <p>
          Movies filtered for date night vibes. Check Netflix for availability.
        </p>
      </div>
    </div>
  );
}

