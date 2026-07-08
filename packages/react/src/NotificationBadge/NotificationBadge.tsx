import React, { type ReactNode } from 'react';
import { colors, semantic, text, font } from '@origon/tokens-react';

export interface NotificationBadgeProps {
  /** Wrapped element (button, avatar, icon). The badge overlays its top-right corner. */
  children: ReactNode;
  /** Numeric count (0 hides the badge). If string, shown as-is. */
  count?: number | string;
  /** Show a small dot instead of a count. */
  dot?: boolean;
  /** Cap the displayed number. Default: 99 (shows "99+"). */
  max?: number;
  /** Force showing the badge even when count is 0/empty. */
  showZero?: boolean;
  /** Semantic tone. */
  tone?: 'brand' | 'success' | 'warning' | 'danger';
}

const TONE_COLOR = {
  brand:   () => semantic.button?.primary ?? colors.blue[600],
  success: () => colors.green[600],
  warning: () => colors.amber[500],
  danger:  () => colors.red[600],
};

/**
 * NotificationBadge — dot or count badge overlaid on a child element.
 * Source: Figma `- Notification Badge` (12:55791).
 */
export function NotificationBadge({
  children, count, dot = false, max = 99, showZero = false, tone = 'danger',
}: NotificationBadgeProps) {
  const numeric = typeof count === 'number' ? count : undefined;
  const shouldShow = dot || showZero || (typeof count === 'string' && count.length > 0) || (numeric !== undefined && numeric > 0);
  const display = dot
    ? null
    : numeric !== undefined
      ? (numeric > max ? `${max}+` : String(numeric))
      : count;

  return (
    <span style={{ position: 'relative', display: 'inline-flex', flex: '0 0 auto' }}>
      {children}
      {shouldShow && (
        <span
          aria-label={typeof display === 'string' || typeof display === 'number' ? `${display} notification${typeof display === 'number' && display === 1 ? '' : 's'}` : 'notification'}
          role="status"
          style={{
            position: 'absolute',
            top: dot ? -2 : -6,
            right: dot ? -2 : -6,
            minWidth: dot ? 8 : 18,
            height: dot ? 8 : 18,
            padding: dot ? 0 : '0 5px',
            background: TONE_COLOR[tone](),
            color: colors.base.white,
            borderRadius: 999,
            fontFamily: font.family.primary,
            fontSize: dot ? 0 : text.xxs.fontSize,
            fontWeight: font.weight.medium,
            lineHeight: dot ? '8px' : '18px',
            textAlign: 'center',
            border: `2px solid ${colors.blueGray[100]}`,
            boxSizing: 'border-box',
            pointerEvents: 'none',
          }}
        >
          {display}
        </span>
      )}
    </span>
  );
}
