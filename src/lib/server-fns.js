import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";

const DAY_MS = 86400000;

const startOfUtcDay = (date) => {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
};

export const getDashboardOverview = createServerFn({ method: "GET" })
  .middleware([requireUser])
  .validator(z.object({}))
  .handler(async ({ context }) => {
    const db = context.getBase44();
    const todayStart = startOfUtcDay(new Date());
    const todayEnd = new Date(todayStart.getTime() + DAY_MS);
    const since = new Date(todayStart.getTime() - 13 * DAY_MS);

    const [
      activeProducts,
      activeCampaigns,
      pendingApproval,
      approved,
      scheduled,
      published,
      failed,
      clicks,
      statusGroups,
      clickBuckets,
      todayPending,
      todayPublished,
      activityPage,
      queuePage,
    ] = await Promise.all([
      db.entities.Product.count({ status: "active" }),
      db.entities.Campaign.count({ status: "active" }),
      db.entities.Post.count({ status: "pending_approval" }),
      db.entities.Post.count({ status: "approved" }),
      db.entities.ScheduledPost.count({ status: "pending" }),
      db.entities.Post.count({ status: "published" }),
      db.entities.Post.count({ status: "failed" }),
      db.entities.ClickEvent.count({}),
      db.entities.Post.aggregate({ groupBy: "status" }),
      db.entities.ClickEvent.aggregate({
        query: { created_date: { $gte: since.toISOString() } },
        dateBucket: { field: "created_date", unit: "day" },
      }),
      db.entities.ScheduledPost.count({
        scheduled_for: { $gte: todayStart.toISOString(), $lt: todayEnd.toISOString() },
        status: "pending",
      }),
      db.entities.ScheduledPost.count({
        scheduled_for: { $gte: todayStart.toISOString(), $lt: todayEnd.toISOString() },
        status: "published",
      }),
      db.entities.ActivityLog.list({ sort: "-created_date", limit: 6 }),
      db.entities.Post.filter(
        { status: "pending_approval" },
        { sort: "-created_date", limit: 4 },
      ),
    ]);

    const bucketMap = new Map(
      (clickBuckets?.rows ?? []).map((row) => [String(row.created_date).slice(0, 10), row.count]),
    );
    const clicksLast14 = Array.from({ length: 14 }, (_, index) => {
      const date = new Date(since.getTime() + index * DAY_MS).toISOString().slice(0, 10);
      return { date, count: bucketMap.get(date) ?? 0 };
    });

    return {
      counts: {
        activeProducts,
        activeCampaigns,
        pendingApproval,
        approved,
        scheduled: scheduled + approved,
        published,
        failed,
        clicks,
      },
      postsByStatus: (statusGroups?.rows ?? []).map((row) => ({
        status: row.status,
        count: row.count,
      })),
      clicksLast14,
      todayCount: todayPending + todayPublished,
      todaySlots: [],
      approvalQueue: (queuePage?.items ?? []).map((post) => ({
        id: post.id,
        title: post.title,
        platform: post.platform,
        created_date: post.created_date,
      })),
      activity: (activityPage?.items ?? []).map((entry) => ({
        id: entry.id,
        description: entry.description,
        created_date: entry.created_date,
      })),
    };
  });