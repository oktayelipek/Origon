import React, { forwardRef, type ReactNode, type CSSProperties } from 'react';
import { colors, semantic, spacing, text, font } from '@origon/tokens-react';

export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading element (icon, avatar, logo). */
  leading?: ReactNode;
  /** Main label. */
  title: ReactNode;
  /** Secondary text under the title. */
  subtitle?: ReactNode;
  /** Trailing element (chevron, badge, action). */
  trailing?: ReactNode;
  /** Right-aligned meta above trailing (e.g., price). */
  meta?: ReactNode;
  /** Meta secondary line below meta (e.g., change %). */
  metaSubtitle?: ReactNode;
  /** Tone for meta subtitle color (e.g., trend up/down). */
  metaTone?: 'default' | 'success' | 'danger';
  /** Interactive row — renders as button with hover state. */
  onClick?: () => void;
  /** Reduced padding for dense lists. */
  dense?: boolean;
}

/**
 * Row — data list row composition. Source: Figma `- Row` (12:51134) and
 * `- Price Row` (12:54723). Leading + title/subtitle + meta/metaSubtitle +
 * trailing. All slots optional except title.
 */
export const Row = forwardRef<HTMLDivElement, RowProps>(function Row(
  { leading, title, subtitle, trailing, meta, metaSubtitle, metaTone = 'default', onClick, dense = false, style, ...rest },
  ref,
) {
  const interactive = onClick !== undefined;
  const metaColor = metaTone === 'success' ? colors.green[600] : metaTone === 'danger' ? colors.red[500] : semantic.text.secondary;

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${dense ? spacing.xs : spacing.sm}px ${spacing.md}px`,
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    width: '100%',
    cursor: interactive ? 'pointer' : undefined,
    textAlign: 'left',
    fontFamily: font.family.primary,
    color: semantic.text.focus,
    transition: 'background 120ms ease',
    ...style,
  };

  const content = (
    <>
      {leading && (
        <span style={{ display: 'inline-flex', flex: '0 0 auto', alignItems: 'center', justifyContent: 'center' }}>
          {leading}
        </span>
      )}
      <span style={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: text.md.fontSize, lineHeight: `${text.md.lineHeight}px`, fontWeight: font.weight.medium, color: semantic.text.focus, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </span>
        {subtitle && (
          <span style={{ fontSize: text.sm.fontSize, lineHeight: `${text.sm.lineHeight}px`, color: semantic.text.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subtitle}
          </span>
        )}
      </span>
      {(meta || metaSubtitle) && (
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flex: '0 0 auto', minWidth: 0 }}>
          {meta && (
            <span style={{ fontSize: text.md.fontSize, lineHeight: `${text.md.lineHeight}px`, fontWeight: font.weight.medium, color: semantic.text.focus }}>{meta}</span>
          )}
          {metaSubtitle && (
            <span style={{ fontSize: text.sm.fontSize, lineHeight: `${text.sm.lineHeight}px`, color: metaColor, fontWeight: font.weight.medium }}>{metaSubtitle}</span>
          )}
        </span>
      )}
      {trailing && (
        <span style={{ display: 'inline-flex', flex: '0 0 auto', alignItems: 'center', color: semantic.text.secondary }}>
          {trailing}
        </span>
      )}
    </>
  );

  if (interactive) {
    return (
      <button
        ref={ref as any}
        type="button"
        onClick={onClick}
        style={containerStyle}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = colors.blueGray[200]; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        {...rest}
      >
        {content}
      </button>
    );
  }
  return (
    <div ref={ref} style={containerStyle} {...rest}>
      {content}
    </div>
  );
});
