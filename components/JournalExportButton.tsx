'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Reflection {
  id: string;
  content: string;
  created_at: string;
  favorited?: boolean;
  action?: {
    name: string;
    icon?: string;
  };
  user_tips?: {
    tips?: {
      title: string;
      category?: string;
    };
  };
}

interface JournalExportButtonProps {
  reflections: Reflection[];
}

export default function JournalExportButton({ reflections }: JournalExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    try {
      // Format journal entries
      let exportContent = `Best Husband Ever - Personal Journal Export\n`;
      exportContent += `Generated: ${format(new Date(), 'MMMM d, yyyy')}\n`;
      exportContent += `Total Entries: ${reflections.length}\n`;
      exportContent += `\n${'='.repeat(60)}\n\n`;

      // Separate favorites and regular entries
      const favorites = reflections.filter((r) => r.favorited);
      const regular = reflections.filter((r) => !r.favorited);

      if (favorites.length > 0) {
        exportContent += `⭐ FAVORITES\n`;
        exportContent += `${'='.repeat(60)}\n\n`;

        favorites.forEach((reflection, index) => {
          const date = format(new Date(reflection.created_at), 'MMMM d, yyyy');
          const actionName = reflection.action?.name || reflection.user_tips?.tips?.title || 'Action';
          const icon = reflection.action?.icon || '';

          exportContent += `[${index + 1}] ${date}\n`;
          exportContent += `Action: ${icon ? `${icon} ` : ''}${actionName}\n`;
          exportContent += `\n${reflection.content}\n`;
          exportContent += `\n${'-'.repeat(60)}\n\n`;
        });
      }

      if (regular.length > 0) {
        exportContent += `\nALL ENTRIES\n`;
        exportContent += `${'='.repeat(60)}\n\n`;

        regular.forEach((reflection, index) => {
          const date = format(new Date(reflection.created_at), 'MMMM d, yyyy');
          const actionName = reflection.action?.name || reflection.user_tips?.tips?.title || 'Action';
          const icon = reflection.action?.icon || '';

          exportContent += `[${index + 1}] ${date}\n`;
          exportContent += `Action: ${icon ? `${icon} ` : ''}${actionName}\n`;
          exportContent += `\n${reflection.content}\n`;
          exportContent += `\n${'-'.repeat(60)}\n\n`;
        });
      }

      // Create and download file
      const blob = new Blob([exportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `best-husband-journal-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting journal:', error);
      alert('Failed to export journal. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (reflections.length === 0) {
    return null;
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isExporting ? (
        <>
          <span className="animate-spin">⏳</span>
          <span>Exporting...</span>
        </>
      ) : (
        <>
          <span>📥</span>
          <span>Export Journal</span>
        </>
      )}
    </button>
  );
}

