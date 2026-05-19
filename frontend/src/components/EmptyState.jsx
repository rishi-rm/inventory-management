export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-10 text-center animate-fade-in">
      {Icon && (
        <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-500 grid place-items-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}