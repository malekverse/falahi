'use client'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  return (
    <div className={`flex gap-1 ${sizes[size]}`} role="radiogroup" aria-label="Note">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`transition-colors ${
            readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
          } ${star <= value ? 'text-amber-400' : 'text-gray-200'}`}
          onClick={() => onChange?.(star)}
          aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
          role="radio"
          aria-checked={star === value}
        >
          ★
        </button>
      ))}
    </div>
  )
}
