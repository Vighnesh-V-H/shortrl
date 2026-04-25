import { db } from "@shortrl/db/client";
import { clickEvent } from "@shortrl/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { logger } from "@shared/logger";
import type {
  TrackClickRequest,
  ClickEventResponse,
  ClickSummaryResponse,
  ClickTimeseriesPoint,
} from "../interface/analytics";

export class AnalyticsService {
  async trackClick(data: TrackClickRequest): Promise<ClickEventResponse> {
    logger.info({ urlId: data.urlId }, "Tracking click event");

    const [record] = await db
      .insert(clickEvent)
      .values({
        urlId: data.urlId,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        referer: data.referer ?? null,
        country: data.country ?? null,
        city: data.city ?? null,
        device: data.device ?? null,
        browser: data.browser ?? null,
        os: data.os ?? null,
      })
      .returning();

    if (!record) {
      throw new Error("Failed to track click event");
    }

    logger.info({ id: record.id, urlId: record.urlId }, "Click event tracked successfully");

    return {
      id: record.id,
      urlId: record.urlId,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      referer: record.referer,
      country: record.country,
      city: record.city,
      device: record.device,
      browser: record.browser,
      os: record.os,
      createdAt: record.createdAt,
    };
  }

  async getClicksByUrlId(
    urlId: number,
    from?: Date,
    to?: Date
  ): Promise<ClickEventResponse[]> {
    logger.info({ urlId, from, to }, "Retrieving clicks for URL");

    const conditions = [eq(clickEvent.urlId, urlId)];

    if (from) {
      conditions.push(gte(clickEvent.createdAt, from));
    }
    if (to) {
      conditions.push(lte(clickEvent.createdAt, to));
    }

    const records = await db
      .select()
      .from(clickEvent)
      .where(and(...conditions))
      .orderBy(desc(clickEvent.createdAt));

    return records.map((record) => ({
      id: record.id,
      urlId: record.urlId,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent,
      referer: record.referer,
      country: record.country,
      city: record.city,
      device: record.device,
      browser: record.browser,
      os: record.os,
      createdAt: record.createdAt,
    }));
  }

  async getClickSummary(
    urlId: number,
    limit: number = 10
  ): Promise<ClickSummaryResponse> {
    logger.info({ urlId }, "Generating click summary for URL");

    const [totalResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(clickEvent)
      .where(eq(clickEvent.urlId, urlId));

    const [uniqueResult] = await db
      .select({
        count: sql<number>`count(distinct ${clickEvent.ipAddress})::int`,
      })
      .from(clickEvent)
      .where(eq(clickEvent.urlId, urlId));

    const topCountries = await db
      .select({
        country: clickEvent.country,
        count: sql<number>`count(*)::int`,
      })
      .from(clickEvent)
      .where(and(eq(clickEvent.urlId, urlId), sql`${clickEvent.country} is not null`))
      .groupBy(clickEvent.country)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const topBrowsers = await db
      .select({
        browser: clickEvent.browser,
        count: sql<number>`count(*)::int`,
      })
      .from(clickEvent)
      .where(and(eq(clickEvent.urlId, urlId), sql`${clickEvent.browser} is not null`))
      .groupBy(clickEvent.browser)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const topDevices = await db
      .select({
        device: clickEvent.device,
        count: sql<number>`count(*)::int`,
      })
      .from(clickEvent)
      .where(and(eq(clickEvent.urlId, urlId), sql`${clickEvent.device} is not null`))
      .groupBy(clickEvent.device)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    const topReferers = await db
      .select({
        referer: clickEvent.referer,
        count: sql<number>`count(*)::int`,
      })
      .from(clickEvent)
      .where(and(eq(clickEvent.urlId, urlId), sql`${clickEvent.referer} is not null`))
      .groupBy(clickEvent.referer)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return {
      urlId,
      totalClicks: totalResult?.count ?? 0,
      uniqueIps: uniqueResult?.count ?? 0,
      topCountries: topCountries.map((r) => ({
        country: r.country!,
        count: r.count,
      })),
      topBrowsers: topBrowsers.map((r) => ({
        browser: r.browser!,
        count: r.count,
      })),
      topDevices: topDevices.map((r) => ({
        device: r.device!,
        count: r.count,
      })),
      topReferers: topReferers.map((r) => ({
        referer: r.referer!,
        count: r.count,
      })),
    };
  }

  async getClickTimeseries(
    urlId: number,
    from?: Date,
    to?: Date
  ): Promise<ClickTimeseriesPoint[]> {
    logger.info({ urlId, from, to }, "Generating click timeseries for URL");

    const conditions = [eq(clickEvent.urlId, urlId)];

    if (from) {
      conditions.push(gte(clickEvent.createdAt, from));
    }
    if (to) {
      conditions.push(lte(clickEvent.createdAt, to));
    }

    const records = await db
      .select({
        date: sql<string>`date_trunc('day', ${clickEvent.createdAt})::date::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(clickEvent)
      .where(and(...conditions))
      .groupBy(sql`date_trunc('day', ${clickEvent.createdAt})`)
      .orderBy(sql`date_trunc('day', ${clickEvent.createdAt})`);

    return records.map((r) => ({
      date: r.date,
      count: r.count,
    }));
  }
}
