'use client';

import { useState } from 'react';

interface JournalEntryProps {
  reflection: {
    id: string;
    content: string;
    created_at: string;
    completed_at?: string; // Completion date from action completion
    favorited: boolean;
    shared_to_forum: boolean;
    user_tips?: {
      tips?: {
        title: string;
        category: string;
      };
    };
    action?: {
      name: string;
      icon: string;
    };
  };
}

export default function JournalEntry({ reflection }: JournalEntryProps) {
  const [isFavorited, setIsFavorited] = useState(reflection.favorited || false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(reflection.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isShared, setIsShared] = useState(reflection.shared_to_forum || false);
  const [isTogglingShare, setIsTogglingShare] = useState(false);
  const [currentContent, setCurrentContent] = useState(reflection.content);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const tip = reflection.user_tips?.tips;
  const action = reflection.action;

  const handleToggleFavorite = async () => {
    setIsTogglingFavorite(true);
    try {
      const response = await fetch('/api/reflections/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reflectionId: reflection.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      const data = await response.json();
      setIsFavorited(data.favorited);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorite. Please try again.');
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedContent.trim()) {
      alert('Content cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/reflections/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reflectionId: reflection.id,
          content: editedContent.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update reflection');
      }

      const data = await response.json();
      setCurrentContent(data.reflection.content);
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating reflection:', error);
      alert(error.message || 'Failed to update reflection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedContent(currentContent);
    setIsEditing(false);
  };

  const handleToggleShare = async () => {
    setIsTogglingShare(true);
    try {
      const response = await fetch('/api/reflections/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reflectionId: reflection.id,
          shared: !isShared,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 403) {
          alert(error.error || 'Upgrade to Paid to share your wins to Team Wins');
        } else {
          throw new Error(error.error || 'Failed to update share status');
        }
        return;
      }

      const data = await response.json();
      setIsShared(data.shared_to_forum);
    } catch (error: any) {
      console.error('Error toggling share:', error);
      if (!error.message.includes('Upgrade')) {
        alert(error.message || 'Failed to update share status. Please try again.');
      }
    } finally {
      setIsTogglingShare(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this journal entry? This will also remove any linked action completion.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/reflections/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reflectionId: reflection.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete entry');
      }

      setIsDeleted(true);
      // Reload the page to refresh the journal list
      window.location.reload();
    } catch (error: any) {
      console.error('Error deleting reflection:', error);
      alert(error.message || 'Failed to delete entry. Please try again.');
      setIsDeleting(false);
    }
  };

  const isFavorite = isFavorited;
  
  // Clean up content to remove any legacy "Action:", "Completed on", or "Completed:" prefixes
  const cleanContent = (content: string | null | undefined): string => {
    if (!content) return '';
    let cleaned = content.trim();
    // Remove "Action: [name]" patterns
    cleaned = cleaned.replace(/^Action:\s*[^\n]+\n\n?/i, '');
    // Remove "Completed on [date]" patterns
    cleaned = cleaned.replace(/^Completed\s+on\s+[^\n]+\n\n?/i, '');
    // Remove "Completed: [action name]" patterns
    cleaned = cleaned.replace(/^Completed:\s*[^\n]+$/i, '');
    return cleaned.trim();
  };
  
  const displayContent = cleanContent(currentContent);

  if (isDeleted) {
    return null;
  }

  return (
    <article
      className={`bg-slate-900/80 border border-slate-800 rounded-lg p-4 ${
        isFavorite ? 'border-l-4 border-yellow-500/50' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {action && (
            <div className="flex items-center gap-2 mb-1">
              {action.icon && <span className="text-base flex-shrink-0">{action.icon}</span>}
              <p className="text-sm font-semibold text-slate-200 truncate">{action.name}</p>
            </div>
          )}
          {tip && (
            <div className="mb-1">
              <p className="text-sm font-semibold text-slate-200">{tip.title}</p>
              {tip.category && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/10 text-primary-300 text-xs rounded-full">
                  {tip.category}
                </span>
              )}
            </div>
          )}
          <time className="text-xs text-slate-500">
            {new Date(reflection.completed_at || reflection.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </time>
        </div>
        <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded text-slate-400 hover:bg-slate-800 transition-colors"
              aria-label="Edit entry"
              title="Edit"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
            className={`p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-default ${
              isFavorite
                ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
            title={isFavorite ? 'Unfavorite' : 'Favorite'}
          >
            <span className="text-base">{isFavorite ? '⭐' : '☆'}</span>
          </button>
          <button
            onClick={handleToggleShare}
            disabled={isTogglingShare || isEditing}
            className={`p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-default ${
              isShared
                ? 'bg-primary-500/10 text-primary-300 hover:bg-primary-500/20'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            aria-label={isShared ? 'Remove from Team Wins' : 'Share to Team Wins'}
            title={isShared ? 'Shared' : 'Share'}
          >
            {isShared ? (
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            )}
          </button>
          {!isEditing && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-default"
              aria-label="Delete entry"
              title="Delete"
            >
              {isDeleting ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
      {isShared && !isEditing && (
        <div className="mb-2">
          <span className="text-xs px-2 py-0.5 bg-primary-500/20 text-primary-300 rounded-full border border-primary-500/30">
            Shared to Team Wins
          </span>
        </div>
      )}

      {/* Only show reflection content if notes were written */}
      {(displayContent || isEditing) && (
        <div className="prose prose-invert max-w-none mt-3">
          {isEditing ? (
            <div className="space-y-3">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[150px] p-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 resize-y text-sm"
                placeholder="Write your reflection..."
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving || !editedContent.trim()}
                  className="px-3 py-1.5 bg-primary-500 text-slate-950 rounded-lg hover:bg-primary-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {displayContent}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

