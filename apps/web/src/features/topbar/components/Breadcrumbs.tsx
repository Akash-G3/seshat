import type { BreadcrumbSegment } from "../types";

interface Props {
  segments: BreadcrumbSegment[];
  onNavigate: (segment: BreadcrumbSegment) => void;
}

export function Breadcrumbs({ segments, onNavigate }: Props) {
  return (
    <div className="flex items-center gap-1 text-sm min-w-0 overflow-hidden">
      {segments.map((seg, i) => (
        <span key={seg.id} className="flex items-center gap-1 min-w-0">
          {i > 0 && <span className="text-text-muted">/</span>}
          <button
            onClick={() => onNavigate(seg)}
            className={`truncate hover:text-accent ${
              i === segments.length - 1 ? "text-text-primary font-medium" : "text-text-secondary"
            }`}
            title={seg.label}
          >
            {seg.label}
          </button>
        </span>
      ))}
    </div>
  );
}