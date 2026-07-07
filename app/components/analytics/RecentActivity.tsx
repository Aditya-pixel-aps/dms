import React from "react";
import Card from "@/app/components/ui/Card";

export interface ActivityItem {
  id: string;
  type:
    | "order_created"
    | "order_approved"
    | "invoice_generated"
    | "vehicle_assigned"
    | "order_delivered"
    | "purchase_added";
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

const formatActivityTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) {
      if (now.getDate() === d.getDate()) {
        return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
      }
      return "Yesterday";
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

const ICONS = {
  order_created: (
    <svg className="h-4.5 w-4.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
  order_approved: (
    <svg className="h-4.5 w-4.5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  invoice_generated: (
    <svg className="h-4.5 w-4.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  vehicle_assigned: (
    <svg className="h-4.5 w-4.5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  order_delivered: (
    <svg className="h-4.5 w-4.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  purchase_added: (
    <svg className="h-4.5 w-4.5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
};

const BGS = {
  order_created: "bg-blue-500/10 border-blue-500/20",
  order_approved: "bg-purple-500/10 border-purple-500/20",
  invoice_generated: "bg-emerald-500/10 border-emerald-500/20",
  vehicle_assigned: "bg-sky-500/10 border-sky-500/20",
  order_delivered: "bg-emerald-600/10 border-emerald-600/20",
  purchase_added: "bg-pink-500/10 border-pink-500/20",
};

export default function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card className="flex flex-col h-full min-h-[400px]">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wider">Recent Activity</h3>
        <p className="text-xs text-muted mt-1">Latest actions and state changes in the system</p>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[450px] pr-1">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">No activity recorded for this period</div>
        ) : (
          <div className="relative border-l border-border pl-6 ml-3 space-y-6 py-2">
            {activities.map((activity) => (
              <div key={activity.id} className="relative">
                {/* Timeline node */}
                <div
                  className={`absolute -left-[37px] top-0.5 rounded-full p-1.5 border ${
                    BGS[activity.type] || "bg-secondary border-border"
                  } flex items-center justify-center bg-card`}
                >
                  {ICONS[activity.type] || (
                    <div className="h-4.5 w-4.5 rounded-full bg-muted-foreground/20" />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1">
                  <div>
                    <h4 className="text-sm font-semibold text-card-foreground">{activity.title}</h4>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{activity.description}</p>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted shrink-0 sm:mt-0.5">
                    {formatActivityTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
