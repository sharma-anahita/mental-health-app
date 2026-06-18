import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import Button from '../ui/Button';

interface AddToGoalsButtonProps {
  onAdd: () => Promise<void> | void;
  disabled?: boolean;
}

export const AddToGoalsButton: React.FC<AddToGoalsButtonProps> = ({
  onAdd,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    if (disabled || loading || added) return;
    setLoading(true);
    try {
      await onAdd();
      setAdded(true);
    } catch (err) {
      // Handled by calling component or store, swallow locally
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={added ? 'secondary' : 'primary'}
      type="button"
      onClick={handleAdd}
      disabled={disabled || loading || added}
      className={`px-3 py-1.5 flex items-center gap-1.5 text-xs rounded-xl transition-all shadow-none ${
        added
          ? 'bg-emerald-100/60 text-emerald-800 border border-emerald-200 cursor-not-allowed hover:scale-100 hover:shadow-none'
          : ''
      }`}
    >
      {added ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Added to Goals</span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          <span>Add to Goals</span>
        </>
      )}
    </Button>
  );
};

export default AddToGoalsButton;
