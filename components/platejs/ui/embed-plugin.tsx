import { type PlateElementProps, PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export const BUTTON_RADIUS_VARIANTS = {
  round: { label: 'Round', radius: 999 },
  smooth: { label: 'Smooth', radius: 16 },
  sharp: { label: 'Sharp', radius: 0 },
} as const;

const BUTTON_RADIUS_ENTRIES = Object.entries(
  BUTTON_RADIUS_VARIANTS
) as Array<
  [
    ButtonRadiusVariant,
    (typeof BUTTON_RADIUS_VARIANTS)[ButtonRadiusVariant],
  ]
>;

export const BUTTON_VARIANTS = {
  filled: {
    label: 'Filled',
    className:
      'bg-blue-500 text-white shadow-xs hover:bg-blue-500/90 focus-v isible:ring-blue-200',
  },
  outline: {
    label: 'Outline',
    className:
      'border border-blue-500 bg-transparent text-blue-600 hover:bg-blue-500/10 focus-visible:ring-blue-100',
  },
} as const;

export const BUTTON_SIZES = {
  small: { label: 'Small', className: 'px-3 py-1.5 text-sm' },
  medium: { label: 'Medium', className: 'px-4 py-2 text-sm' },
  large: { label: 'Large', className: 'px-6 py-3 text-base' },
} as const;

export type ButtonRadiusVariant = keyof typeof BUTTON_RADIUS_VARIANTS;
export type ButtonVariant = keyof typeof BUTTON_VARIANTS;
export type ButtonSizeVariant = keyof typeof BUTTON_SIZES;

export const DEFAULT_BUTTON_RADIUS_VARIANT: ButtonRadiusVariant = 'smooth';
export const DEFAULT_BUTTON_VARIANT: ButtonVariant = 'filled';
export const DEFAULT_BUTTON_SIZE: ButtonSizeVariant = 'medium';

export function CustomButtonElement({
  element,
  className,
  style,
  ...rest
}: PlateElementProps) {
  const node = element as Record<string, unknown>;

  const radiusVariant = resolveRadiusVariant(node);
  const radiusValue = resolveRadiusValue(node, radiusVariant);
  const buttonVariant = resolveButtonVariant(node);
  const buttonSize = resolveButtonSize(node);

  return (
    <PlateElement
      as="button"
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        BUTTON_VARIANTS[buttonVariant].className,
        BUTTON_SIZES[buttonSize].className,
        className
      )}
      style={{
        borderRadius: `${radiusValue}px`,
        ...(style ?? {}),
      }}
      element={element}
      {...rest}
    />
  );
}

function resolveRadiusVariant(
  node: Record<string, unknown>
): ButtonRadiusVariant {
  const value = node?.borderRadiusStyle;

  if (isRadiusVariant(value)) {
    return value;
  }

  const numericRadius = normalizeBorderRadius(node?.borderRadius);
  const matchedVariant = BUTTON_RADIUS_ENTRIES.find(
    ([, meta]) => meta.radius === numericRadius
  );

  return matchedVariant?.[0] ?? DEFAULT_BUTTON_RADIUS_VARIANT;
}

function resolveRadiusValue(
  node: Record<string, unknown>,
  variant: ButtonRadiusVariant
) {
  const variantRadius = BUTTON_RADIUS_VARIANTS[variant].radius;

  if (isRadiusVariant(node?.borderRadiusStyle)) {
    return variantRadius;
  }

  return normalizeBorderRadius(node?.borderRadius) ?? variantRadius;
}

function resolveButtonVariant(node: Record<string, unknown>): ButtonVariant {
  const value = node?.buttonVariant;

  if (isButtonVariant(value)) {
    return value;
  }

  return DEFAULT_BUTTON_VARIANT;
}

function resolveButtonSize(node: Record<string, unknown>): ButtonSizeVariant {
  const value = node?.buttonSize;

  if (isButtonSize(value)) {
    return value;
  }

  return DEFAULT_BUTTON_SIZE;
}

function normalizeBorderRadius(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return clampRadius(value);
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return clampRadius(parsed);
    }
  }

  return BUTTON_RADIUS_VARIANTS[DEFAULT_BUTTON_RADIUS_VARIANT].radius;
}

function clampRadius(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 999);
}

function isRadiusVariant(value: unknown): value is ButtonRadiusVariant {
  return (
    typeof value === 'string' &&
    value in BUTTON_RADIUS_VARIANTS &&
    (BUTTON_RADIUS_VARIANTS as Record<string, unknown>)[value] !== undefined
  );
}

function isButtonVariant(value: unknown): value is ButtonVariant {
  return (
    typeof value === 'string' &&
    value in BUTTON_VARIANTS &&
    (BUTTON_VARIANTS as Record<string, unknown>)[value] !== undefined
  );
}

function isButtonSize(value: unknown): value is ButtonSizeVariant {
  return (
    typeof value === 'string' &&
    value in BUTTON_SIZES &&
    (BUTTON_SIZES as Record<string, unknown>)[value] !== undefined
  );
}
