/**
 * Card — design-system primitive
 *
 * A clean content container with consistent border, radius, and shadow.
 * Compose sections inside using <Card.Section> for bordered dividers.
 */

function Card({ className = "", children, ...props }) {
  return (
    <div
      className={[
        "rounded-xl border border-border bg-surface-raised shadow-card overflow-hidden",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

function CardSection({ className = "", children }) {
  return (
    <div
      className={["border-b border-border last:border-b-0", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

Card.Section = CardSection;
export { Card };
export default Card;
