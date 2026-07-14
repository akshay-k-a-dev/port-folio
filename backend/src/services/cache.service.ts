import { prisma } from '../lib/prisma.js';

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const entry = await prisma.cache.findUnique({ where: { key } });
    if (!entry) return null;
    if (new Date() > entry.expiresAt) {
      await prisma.cache.delete({ where: { key } }).catch(() => null);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await prisma.cache.upsert({
      where: { key },
      create: { key, value: value as object, ttlSeconds, expiresAt },
      update: { value: value as object, ttlSeconds, expiresAt },
    });
  }

  async invalidate(key: string): Promise<void> {
    await prisma.cache.delete({ where: { key } }).catch(() => null);
  }

  async invalidatePattern(prefix: string): Promise<void> {
    await prisma.cache.deleteMany({
      where: { key: { startsWith: prefix } },
    });
  }

  async purgeExpired(): Promise<number> {
    const result = await prisma.cache.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
  }
}
