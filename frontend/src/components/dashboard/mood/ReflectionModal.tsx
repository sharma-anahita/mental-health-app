import React, { useState, useEffect } from 'react';
import Button from '../../ui/Button';
import { CardTitle, BodyText, SubtleText } from '../../ui/Typography';
import * as reflectionService from '../../../services/reflectionService';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: (reflection: any, stats: any) => void;
  initialText?: string;
  isEditing?: boolean;
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({ isOpen, onClose, onSubmitted, initialText = '', isEditing = false }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
      setError(null);
    }
  }, [isOpen, initialText]);

  if (!isOpen) return null;

  const handleCancel = () => {
    setText('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Please write a reflection');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await reflectionService.createReflection(text);
      setText('');
      if (onSubmitted) {
        onSubmitted(result, result.stats);
      }
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save reflection';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-w-2xl w-11/12 bg-white rounded-lg shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <CardTitle>{isEditing ? 'Edit Your Reflection' : 'Your Reflection Today'}</CardTitle>
          <button
            onClick={handleCancel}
            className="text-2xl text-slate-400 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <SubtleText className="mb-4">
          {isEditing ? 'Update your reflection from earlier today.' : 'Take a moment to reflect on your day. What stood out? What are you grateful for?'}
        </SubtleText>

        {error && (
          <div className="mb-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your reflection here... (100-500 characters)"
          className="w-full min-h-[200px] p-4 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
          disabled={isSubmitting}
        />

        <SubtleText className="mt-2 text-xs">
          {text.length} / 500 characters
        </SubtleText>

        <div className="mt-6 flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim()}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Reflection' : 'Save Reflection'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionModal;
