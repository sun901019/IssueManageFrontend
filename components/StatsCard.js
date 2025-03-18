export default function StatsCard({ title, value, color }) {
    return (
      <div className={`p-4 rounded-lg shadow bg-${color}-200`}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  }
  