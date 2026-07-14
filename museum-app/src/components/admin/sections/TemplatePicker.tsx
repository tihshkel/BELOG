"use client";

import type { SectionTemplate } from "@/lib/types";
import { getTemplateDescription, TEMPLATE_LABELS } from "@/lib/section-content";

const templates: SectionTemplate[] = [
  "article",
  "photo_story",
  "gallery",
  "timeline",
  "highlights",
];

interface TemplatePickerProps {
  selected?: SectionTemplate;
  onSelect: (template: SectionTemplate) => void;
}

function TemplateWireframe({ template }: { template: SectionTemplate }) {
  if (template === "article") {
    return (
      <div className="admin-template-wire admin-template-wire--article" aria-hidden>
        <span className="admin-template-wire__img" />
        <span className="admin-template-wire__lines">
          <span />
          <span />
          <span />
        </span>
      </div>
    );
  }
  if (template === "photo_story") {
    return (
      <div className="admin-template-wire admin-template-wire--story" aria-hidden>
        <span className="admin-template-wire__story-img" />
        <span className="admin-template-wire__story-text" />
        <span className="admin-template-wire__story-text admin-template-wire__story-text--right" />
        <span className="admin-template-wire__story-img admin-template-wire__story-img--right" />
      </div>
    );
  }
  if (template === "gallery") {
    return (
      <div className="admin-template-wire admin-template-wire--gallery" aria-hidden>
        <span className="admin-template-wire__gal admin-template-wire__gal--full" />
        <span />
        <span />
        <span />
      </div>
    );
  }
  if (template === "highlights") {
    return (
      <div className="admin-template-wire admin-template-wire--highlights" aria-hidden>
        <span />
        <span />
        <span />
        <span />
      </div>
    );
  }
  return (
    <div className="admin-template-wire admin-template-wire--timeline" aria-hidden>
      <span className="admin-template-wire__tl-year" />
      <span className="admin-template-wire__tl-line" />
      <span className="admin-template-wire__tl-card" />
      <span className="admin-template-wire__tl-year" />
      <span className="admin-template-wire__tl-card" />
    </div>
  );
}

export function TemplatePicker({ selected, onSelect }: TemplatePickerProps) {
  return (
    <div className="admin-template-picker">
      {templates.map((tpl) => (
        <button
          key={tpl}
          type="button"
          className={[
            "touch-tile",
            "admin-template-card",
            selected === tpl ? "admin-template-card--selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onSelect(tpl)}
          aria-pressed={selected === tpl}
        >
          <TemplateWireframe template={tpl} />
          <h3 className="admin-template-card__title">{TEMPLATE_LABELS[tpl]}</h3>
          <p className="admin-template-card__desc">{getTemplateDescription(tpl)}</p>
        </button>
      ))}
    </div>
  );
}
