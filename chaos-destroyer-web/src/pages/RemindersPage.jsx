import { useAppStore } from '../store/appStore';

export default function RemindersPage() {
  const { reminders } = useAppStore();

  const pending = reminders.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold chaos-text">🔔 REMINDERS</h1>
        <button className="chaos-button">➕ Add Reminder</button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pending.length === 0 ? (
          <div className="chaos-card text-center py-8 text-gray-400">
            No pending reminders. You're all caught up!
          </div>
        ) : (
          pending.map((reminder) => (
            <div key={reminder.id} className="chaos-card">
              <h3 className="text-lg font-bold text-white">{reminder.title}</h3>
              <div className="text-sm text-gray-400 mt-1">Due: {reminder.dueDate}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
