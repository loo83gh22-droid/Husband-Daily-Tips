'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeepThoughtsCommentForm from './DeepThoughtsCommentForm';

interface DeepThoughtsPostProps {
  thought: any;
}

// Helper function to get display name and info
function getDisplayInfo(user: any) {
  if (!user) {
    return { displayName: 'Anonymous', yearsMarried: null };
  }

  // If user posts anonymously, show Anonymous
  if (user.post_anonymously) {
    return { displayName: 'Anonymous', yearsMarried: null };
  }

  // Prefer username if set
  if (user.username) {
    return { displayName: user.username, yearsMarried: user.years_married };
  }

  // Otherwise, extract first name from full name
  if (user.name) {
    const firstName = user.name.split(' ')[0];
    return { displayName: firstName, yearsMarried: user.years_married };
  }

  // Fallback to Anonymous
  return { displayName: 'Anonymous', yearsMarried: null };
}

export default function DeepThoughtsPost({ thought }: DeepThoughtsPostProps) {
  const router = useRouter();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const user = thought.users;
  const { displayName, yearsMarried } = getDisplayInfo(user);
  const comments = thought.deep_thoughts_comments || [];

  const handleCommentAdded = () => {
    // Refresh the page to show new comment
    router.refresh();
    setShowCommentForm(false);
  };

  return (
    <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-slate-500">From</span>
            <span className="text-sm font-medium text-slate-200">{displayName}</span>
            {yearsMarried !== null && yearsMarried !== undefined && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">
                  {yearsMarried} year{yearsMarried !== 1 ? 's' : ''} married
                </span>
              </>
            )}
            {thought.tip_category && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400 capitalize">
                  {thought.tip_category}
                </span>
              </>
            )}
          </div>
          <time className="text-xs text-slate-500">
            {new Date(thought.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </time>
        </div>
      </div>

      <div className="prose prose-invert max-w-none">
        <p className="text-slate-200 leading-relaxed whitespace-pre-line">{thought.content}</p>
      </div>

      {/* Comments Section */}
      <div className="mt-6 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-400">
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="text-xs text-primary-300 hover:text-primary-200 font-medium transition-colors"
          >
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </button>
        </div>

        {/* Comment Form */}
        {showCommentForm && (
          <DeepThoughtsCommentForm postId={thought.id} onCommentAdded={handleCommentAdded} />
        )}

        {/* Existing Comments */}
        {comments.length > 0 && (
          <div className="space-y-4 mt-4">
            {comments.map((comment: any) => {
              const commentUser = comment.users;
              const { displayName: commentName } = getDisplayInfo(commentUser);

              return (
                <div
                  key={comment.id}
                  className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-slate-300">{commentName}</span>
                    <time className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{comment.content}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

