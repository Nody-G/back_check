import { t, Locale } from '../i18n';

interface SummaryItem {
  value: number;
  label: string;
  color?: string;
}

interface Props {
  items: SummaryItem[];
}

export default function SummaryGrid({ items }: Props) {
  return (
    <div className="summary-grid">
      {items.map((item, i) => (
        <div className="summary-card" key={i}>
          <div className="value" style={{ color: item.color }}>{item.value}</div>
          <div className="label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
