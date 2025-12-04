'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DeepThoughtsCommentForm from './DeepThoughtsCommentForm';

interface DeepThoughtsPostProps {
  thought: any;
  currentUserId?: string | null;
}

// Helper function to calculate years married from wedding date
function calculateYearsMarried(weddingDate: string | null): number | null {
  if (!weddingDate) return null;
  
  const wedding = new Date(weddingDate);
  const today = new Date();
  
  if (isNaN(wedding.getTime())) return null;
  
  let years = today.getFullYear() - wedding.getFullYear();
  const monthDiff = today.getMonth() - wedding.getMonth();
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < wedding.getDate())) {
    years--;
  }
  
  return Math.max(0, years);
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

  // Calculate years married from wedding date
  const yearsMarried = calculateYearsMarried(user.wedding_date);

  // Prefer username if set
  if (user.username) {
    return { displayName: user.username, yearsMarried };
  }

  // Otherwise, extract first name from full name
  if (user.name) {
    const firstName = user.name.split(' ')[0];
    return { displayName: firstName, yearsMarried };
  }

  // Fallback to Anonymous
  return { displayName: 'Anonymous', yearsMarried: null };
}

export default function DeepThoughtsPost({ thought, currentUserId }: DeepThoughtsPostProps) {
  const router = useRouter();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const user = thought.users;
  const { displayName, yearsMarried } = getDisplayInfo(user);
  const comments = thought.deep_thoughts_comments || [];
  const isAuthor = currentUserId && thought.user_id === currentUserId;

  const handleCommentAdded = () => {
    // Refresh the page to show new comment
    router.refresh();
    setShowCommentForm(false);
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('Please select a reason for reporting this post.');
      return;
    }

    setIsReporting(true);
    try {
      const response = await fetch('/api/posts/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: thought.id,
          reason: reportReason,
          additionalDetails: reportDetails || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to report post');
      }

      alert('Thank you for reporting this post. We will review it promptly.');
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
    } catch (error: any) {
      console.error('Error reporting post:', error);
      alert(error.message || 'Failed to report post. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this post? This action cannot be undone.')) {
      return;
    }

    setIsRemoving(true);
    try {
      const response = await fetch('/api/posts/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: thought.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove post');
      }

      // Refresh the page to remove the post from view
      router.refresh();
    } catch (error: any) {
      console.error('Error removing post:', error);
      alert(error.message || 'Failed to remove post. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <article className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 md:p-8">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Profile picture - only show if not anonymous */}
            {!user?.post_anonymously && user?.profile_picture && (
              <img
                src={user.profile_picture}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0"
              />
            )}
            {!user?.post_anonymously && !user?.profile_picture && (
              <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-primary-300">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
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
        <div className="flex items-center gap-2">
          {isAuthor && (
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove your post"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          )}
          {!isAuthor && (
            <button
              onClick={() => setShowReportModal(true)}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              title="Report inappropriate content"
            >
              Report
            </button>
          )}
        </div>
      </div>

      {/* Action name if available */}
      {thought.action && (
        <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
          <div className="flex items-center gap-2">
            {thought.action.icon && (
              <span className="text-lg flex-shrink-0">{thought.action.icon}</span>
            )}
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Action completed:</p>
              <p className="text-sm font-semibold text-slate-200">{thought.action.name}</p>
            </div>
          </div>
        </div>
      )}

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
                    {/* Profile picture for comment - only show if not anonymous */}
                    {!commentUser?.post_anonymously && commentUser?.profile_picture && (
                      <img
                        src={commentUser.profile_picture}
                        alt={commentName}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700 flex-shrink-0"
                      />
                    )}
                    {!commentUser?.post_anonymously && !commentUser?.profile_picture && (
                      <div className="w-6 h-6 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-semibold text-primary-300">
                          {commentName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
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

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-slate-50 mb-4">Report Post</h3>
            <p className="text-sm text-slate-300 mb-4">
              Help us keep the community safe. Please select a reason for reporting this post.
            </p>
            
            <div className="space-y-2 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="Inappropriate content"
                  checked={reportReason === 'Inappropriate content'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-slate-300">Inappropriate content</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="Harassment or bullying"
                  checked={reportReason === 'Harassment or bullying'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-slate-300">Harassment or bullying</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="Spam or misleading"
                  checked={reportReason === 'Spam or misleading'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-slate-300">Spam or misleading</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value="Other"
                  checked={reportReason === 'Other'}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-4 h-4 text-primary-500"
                />
                <span className="text-sm text-slate-300">Other</span>
              </label>
            </div>

            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Additional details (optional)"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows={3}
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportDetails('');
                }}
                disabled={isReporting}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-slate-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={isReporting || !reportReason.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isReporting ? 'Reporting...' : 'Report Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

