import { Link } from 'react-router-dom';
import { Boxes, Package, ArrowRight, TrendingUp, AlertTriangle, DollarSign, Layers, ReceiptIndianRupeeIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import { useInventory } from '../context/InventoryContext.jsx';

const fmt = (n) => '₹' + n.toLocaleString(undefined, { maximumFractionDigits: 2 });

export default function Dashboard() {
  const { stats } = useInventory();

  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard icon={Layers} label="Raw Materials" value={stats.totalMaterials} hint="active items" accent="indigo" />
        <StatCard icon={Package} label="Products" value={stats.totalProducts} hint="manufactured" accent="emerald" />
        <StatCard icon={ReceiptIndianRupeeIcon} label="Inventory Value" value={fmt(stats.totalInventoryValue)} hint="total cost basis" accent="slate" />
        <StatCard icon={AlertTriangle} label="Low / Out of Stock" value={stats.lowStockCount + stats.outOfStockCount} hint={`${stats.outOfStockCount} out of stock`} accent={stats.lowStockCount + stats.outOfStockCount > 0 ? 'amber' : 'emerald'} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <DashboardCard
          to="/raw-materials"
          icon={Boxes}
          title="Raw Materials"
          description="Track quantities, costs and units of your raw inventory."
          gradient="from-indigo-500 to-blue-600"
        />
        <DashboardCard
          to="/products"
          icon={Package}
          title="Products"
          description="Manufacture products and auto-deduct raw materials with cost breakdown."
          gradient="from-emerald-500 to-teal-600"
        />
      </div>

      <div className="card mt-8 p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold">Getting started</h3>
        </div>
        <p className="text-sm text-slate-500">Add raw materials first, then create products that consume them. Stockly will calculate manufacturing costs automatically.</p>
      </div>
    </div>
  );
}

function DashboardCard({ to, icon: Icon, title, description, gradient }) {
  return (
    <Link
      to={to}
      className="group card p-6 sm:p-8 relative overflow-hidden hover:shadow-soft transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} text-white grid place-items-center mb-5 shadow-soft`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5">{description}</p>
      <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 group-hover:gap-2.5 transition-all">
        Open <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}