type BaseCard = {
  id: string;
  title: string;
  value: string;
  subtitle?: string;
  description: string;
};

type SummaryCardsProps<T extends BaseCard> = {
  cards: T[];
  onCardClick: (card: T) => void;
};

export default function SummaryCards<T extends BaseCard>({
  cards,
  onCardClick,
}: SummaryCardsProps<T>) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onCardClick(card)}
          className="group rounded-[28px] border border-white/10 bg-white/5 p-6 text-left transition hover:border-accent/70 hover:bg-white/10 cursor-pointer"
        >
          <div className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">
            {card.title}
          </div>

          <div className="mt-4 text-3xl font-bold text-text">{card.value}</div>

          <div className="mt-2 text-sm text-text/70">{card.subtitle}</div>

          <div className="mt-4 text-sm text-text/60 opacity-70 transition group-hover:text-text/80">
            {card.description}
          </div>
        </button>
      ))}
    </div>
  );
}
