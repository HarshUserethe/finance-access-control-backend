const { records } = require('../data/store');

exports.getSummary = () => {
  const active = records.filter((r) => r.deletedAt === null);

  const totalIncome = active
    .filter((r) => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpenses = active
    .filter((r) => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    totalIncome: round(totalIncome),
    totalExpenses: round(totalExpenses),
    netBalance: round(totalIncome - totalExpenses),
    totalRecords: active.length,
    incomeCount: active.filter((r) => r.type === 'income').length,
    expenseCount: active.filter((r) => r.type === 'expense').length,
  };
};

/**
 * Category-wise breakdown of income and expenses.
 */
exports.getCategorySummary = () => {
  const active = records.filter((r) => r.deletedAt === null);
  const map = {};

  for (const r of active) {
    if (!map[r.category]) {
      map[r.category] = { category: r.category, income: 0, expense: 0, count: 0 };
    }
    if (r.type === 'income') map[r.category].income += r.amount;
    else map[r.category].expense += r.amount;
    map[r.category].count++;
  }

  return Object.values(map)
    .map((c) => ({
      ...c,
      income: round(c.income),
      expense: round(c.expense),
      net: round(c.income - c.expense),
    }))
    .sort((a, b) => b.count - a.count);
};

exports.getMonthlyTrends = () => {
  const active = records.filter((r) => r.deletedAt === null);
  const map = {};

  for (const r of active) {
    const d = new Date(r.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    if (!map[key]) {
      map[key] = {
        month: key,
        income: 0,
        expense: 0,
        count: 0,
      };
    }

    if (r.type === 'income') map[key].income += r.amount;
    else map[key].expense += r.amount;
    map[key].count++;
  }

  return Object.values(map)
    .map((m) => ({
      ...m,
      income: round(m.income),
      expense: round(m.expense),
      net: round(m.income - m.expense),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
};

exports.getWeeklyTrends = () => {
  const active = records.filter((r) => r.deletedAt === null);
  const map = {};

  for (const r of active) {
    const d = new Date(r.date);
    const key = getISOWeekKey(d);

    if (!map[key]) {
      map[key] = { week: key, income: 0, expense: 0, count: 0 };
    }

    if (r.type === 'income') map[key].income += r.amount;
    else map[key].expense += r.amount;
    map[key].count++;
  }

  return Object.values(map)
    .map((w) => ({
      ...w,
      income: round(w.income),
      expense: round(w.expense),
      net: round(w.income - w.expense),
    }))
    .sort((a, b) => a.week.localeCompare(b.week));
};

exports.getRecentActivity = (limit = 10) => {
  return records
    .filter((r) => r.deletedAt === null)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
};

function round(n) {
  return Math.round(n * 100) / 100;
}

function getISOWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}
