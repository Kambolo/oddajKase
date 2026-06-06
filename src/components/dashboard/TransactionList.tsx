type Tx = { id: string; title: string; amount: string; date: string };

const items: Tx[] = [
  { id: "1", title: "Coffee", amount: "-€3.50", date: "May 17" },
  { id: "2", title: "Groceries", amount: "-€42.30", date: "May 16" },
  { id: "3", title: "Donation received", amount: "+€150.00", date: "May 15" },
];

export default function TransactionList() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium text-text mb-2">Recent activity</h2>
      <div className="bg-white/5 rounded-lg divide-y divide-white/5">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium text-text">{it.title}</div>
              <div className="text-sm text-text/60">{it.date}</div>
            </div>
            <div className={`font-medium ${it.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
              {it.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
