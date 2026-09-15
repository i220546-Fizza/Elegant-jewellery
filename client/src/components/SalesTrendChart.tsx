interface Props {
  data: { date: string; total: number }[];
}

const SalesTrendChart = ({ data }: Props) => {
  if (data.length === 0) {
    return <p className="text-sm text-brown-light">No sales data yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((d) => (
        <div key={d.date} className="group flex flex-1 flex-col items-center gap-2">
          <div className="relative w-full">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-champagne-dark to-gold-light transition-all"
              style={{ height: `${Math.max(6, (d.total / max) * 140)}px` }}
            />
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-brown-dark px-2 py-1 text-[10px] text-ivory opacity-0 transition-opacity group-hover:opacity-100">
              Rs. {d.total.toLocaleString()}
            </div>
          </div>
          <span className="text-[10px] text-brown-light">{d.date.slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

export default SalesTrendChart;
