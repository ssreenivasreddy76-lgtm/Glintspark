import type { User } from '../types';


export class StreakService {
    static calculateStreak(activityLog: string[]): {
        currentStreak: number;
        longestStreak: number;
        lastActiveDate: string | null;
        isStreakAliveToday: boolean;
        isActiveToday: boolean;
    } {
        if (!activityLog || activityLog.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                isStreakAliveToday: false,
                isActiveToday: false
            };
        }

        const sortedUniqueDays = [...new Set(activityLog.map(date => {
            if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
            const d = new Date(date);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }))].sort((a, b) => b.localeCompare(a));

        if (sortedUniqueDays.length === 0) {
            return {
                currentStreak: 0,
                longestStreak: 0,
                lastActiveDate: null,
                isStreakAliveToday: false,
                isActiveToday: false
            };
        }

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        const latestActivityStr = sortedUniqueDays[0];
        const lastActiveDate = latestActivityStr;
        const isActiveToday = latestActivityStr === todayStr;

        let currentStreak = 0;
        if (latestActivityStr < yesterdayStr) {
            currentStreak = 0;
        } else {
            const expectedDate = new Date(latestActivityStr);
            let streakCount = 0;
            for (const dateStr of sortedUniqueDays) {
                const current = new Date(dateStr);
                current.setHours(0, 0, 0, 0);
                const expected = new Date(expectedDate);
                expected.setHours(0, 0, 0, 0);
                if (current.getTime() === expected.getTime()) {
                    streakCount++;
                    expectedDate.setDate(expectedDate.getDate() - 1);
                } else {
                    break;
                }
            }
            currentStreak = streakCount;
        }

        let longestStreak = 0;
        let tempStreak = 0;
        let prevDate: number | null = null;
        for (const dateStr of sortedUniqueDays) {
            const currentDate = new Date(dateStr).getTime();
            if (prevDate === null) {
                tempStreak = 1;
            } else {
                const diffTime = Math.abs(prevDate - currentDate);
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            prevDate = currentDate;
        }
        longestStreak = Math.max(longestStreak, tempStreak);

        const isStreakAliveToday = latestActivityStr === todayStr || latestActivityStr === yesterdayStr;

        return {
            currentStreak,
            longestStreak,
            lastActiveDate,
            isStreakAliveToday,
            isActiveToday
        };
    }

    static getStreakMismatch(user: User, isStreakEnabled: boolean = true): Partial<User> | null {
        if (!user || !isStreakEnabled) return null;
        const activityLog = [...(user.activity_log || [])];
        const stats = this.calculateStreak(activityLog);
        if (user.streak !== stats.currentStreak) {
            return { streak: stats.currentStreak };
        }
        return null;
    }

    private static getHistoryKey(userId: string): string {
        return `activity_history_${userId}`;
    }

    static loadHistory(userId: string): any[] {
        if (typeof localStorage === 'undefined') return [];
        try {
            const raw = localStorage.getItem(this.getHistoryKey(userId));
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    private static saveHistory(userId: string, history: any[]) {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(this.getHistoryKey(userId), JSON.stringify(history));
        } catch (e) {}
    }

    static calculateLoginBonus(user: User): { bonus: number; dateStr: string } | null {
        if (!user) return null;
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (user.lastLoginBonusAt) {
            const lastBonusDate = new Date(user.lastLoginBonusAt);
            const lastBonusStr = `${lastBonusDate.getFullYear()}-${String(lastBonusDate.getMonth() + 1).padStart(2, '0')}-${String(lastBonusDate.getDate()).padStart(2, '0')}`;
            if (lastBonusStr === todayStr) return null;
        }
        const currentStreak = user.streak || 0;
        const bonus = Math.min(Math.max(currentStreak, 1), 10);
        return { bonus, dateStr: todayStr };
    }

    static getActivityUpdates(user: User, specificActivity?: {
        type: 'lesson' | 'practice' | 'project' | 'challenge' | 'login_bonus',
        title: string,
        xp?: number,
        executionTime?: string,
        language?: string,
        itemId?: string,
        score?: number,
        timeSpent?: number
    }): Partial<User> | null {
        if (!user) return null;
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const activityLog = [...(user.activity_log || [])];
        let hasLogUpdates = false;

        if (!activityLog.includes(dateStr)) {
            activityLog.push(dateStr);
            if (activityLog.length > 60) activityLog.shift();
            hasLogUpdates = true;
        }

        let activityHistory = this.loadHistory(user._id);
        if (activityHistory.length === 0 && user.activity_history && user.activity_history.length > 0) {
            activityHistory = [...user.activity_history];
        }

        let hasHistoryUpdates = false;
        if (specificActivity) {
            const newItem = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                date: now.toISOString(),
                ...specificActivity
            };
            activityHistory.unshift(newItem);
            hasHistoryUpdates = true;
        }

        const uniqueHistory: any[] = [];
        const seen = new Set();
        for (const item of activityHistory) {
            const itemDateStr = item.date ? new Date(item.date).toDateString() : 'Unknown Date';
            const key = `${itemDateStr}|${item.type}|${item.title}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueHistory.push(item);
            }
        }

        if (uniqueHistory.length !== activityHistory.length || hasHistoryUpdates) {
            activityHistory = uniqueHistory;
            if (activityHistory.length > 100) activityHistory = activityHistory.slice(0, 100);
            this.saveHistory(user._id, activityHistory);
            hasHistoryUpdates = true;
        }

        const stats = this.calculateStreak(activityLog);
        if (hasLogUpdates || hasHistoryUpdates || user.streak !== stats.currentStreak) {
            const updates: Partial<User> = {
                lastActiveAt: now.toISOString(),
                streak: stats.currentStreak
            };
            if (hasLogUpdates) updates.activity_log = activityLog;
            if (hasHistoryUpdates) updates.activity_history = activityHistory;
            return updates;
        }
        return null;
    }
}
