// services/insightsService.js
import ProfileVisit from '../models/ProfileVisit.js'
import Link from '../models/Link.js'
import { normalizeState } from '../utils/stateMap.js'

function getWeekRange(offset = 0) {
  const end = new Date()
  end.setDate(end.getDate() - offset * 7)
  end.setHours(23, 59, 59, 999)

  const start = new Date(end)
  start.setDate(end.getDate() - 6)
  start.setHours(0, 0, 0, 0)

  return { start, end }
}

/* 🔁 Helper: visitas por estado em um período */
async function getVisitsByRegion(userId, start, end) {
  return ProfileVisit.aggregate([
    {
      $match: {
        userId,
        country: 'BR',
        region: { $ne: null },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$region',
        visits: { $sum: 1 }
      }
    }
  ])
}

/* 🧮 Helpers de score */
function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value))
}

function getScoreLabel(score) {
  if (score >= 85) return 'Excelente'
  if (score >= 70) return 'Muito bom'
  if (score >= 55) return 'Bom'
  if (score >= 40) return 'Regular'
  return 'Precisa melhorar'
}

function calculateWeeklyScore({
  visitsCurrent,
  visitsPrevious,
  clicks,
  regionsCurrentAgg,
  activeDays
}) {
  /* 1️⃣ Crescimento */
  let growthScore = 0
  if (visitsPrevious > 0) {
    const growth =
      ((visitsCurrent - visitsPrevious) / visitsPrevious) * 100
    growthScore = clamp((growth + 50) * 0.8)
  } else if (visitsCurrent > 0) {
    growthScore = 80
  }

  /* 2️⃣ Conversão */
  const conversion = visitsCurrent
    ? (clicks / visitsCurrent) * 100
    : 0
  const conversionScore = clamp(conversion * 5)

  /* 3️⃣ Consistência */
  const consistencyScore = clamp((activeDays / 7) * 100)

  /* 4️⃣ Distribuição regional */
  const distributionScore =
    regionsCurrentAgg.length <= 1 ? 40 : 100

  const finalScore =
    growthScore * 0.4 +
    conversionScore * 0.3 +
    consistencyScore * 0.2 +
    distributionScore * 0.1

  return clamp(Math.round(finalScore))
}

export async function generateInsights(userId) {
  const current = getWeekRange(0)
  const previous = getWeekRange(1)

  /* 📊 VISITAS */
  const visitsCurrent = await ProfileVisit.countDocuments({
    userId,
    createdAt: { $gte: current.start, $lte: current.end }
  })

  const visitsPrevious = await ProfileVisit.countDocuments({
    userId,
    createdAt: { $gte: previous.start, $lte: previous.end }
  })

  /* 🖱️ CLIQUES */
  const clicksAgg = await Link.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, clicks: { $sum: '$clicks' } } }
  ])
  const clicks = clicksAgg[0]?.clicks || 0

  /* 📅 DIAS ATIVOS */
  const dailyAgg = await ProfileVisit.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: current.start, $lte: current.end }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        }
      }
    }
  ])
  const activeDays = dailyAgg.length

  /* 🌍 REGIÕES */
  const regionsCurrentAgg = await getVisitsByRegion(
    userId,
    current.start,
    current.end
  )

  const regionsPreviousAgg = await getVisitsByRegion(
    userId,
    previous.start,
    previous.end
  )

  const regions = regionsCurrentAgg
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 3)
    .map(r => ({
      state: normalizeState(r._id),
      visits: r.visits
    }))

  const regionPreviousMap = Object.fromEntries(
    regionsPreviousAgg.map(r => [r._id, r.visits])
  )

  /* 🏙️ CIDADE TOP */
  const topCity = await ProfileVisit.aggregate([
    {
      $match: {
        userId,
        city: { $ne: null },
        createdAt: { $gte: current.start, $lte: current.end }
      }
    },
    {
      $group: {
        _id: '$city',
        visits: { $sum: 1 }
      }
    },
    { $sort: { visits: -1 } },
    { $limit: 1 }
  ])

  /* 📱 DEVICE */
  const deviceAgg = await ProfileVisit.aggregate([
    {
      $match: {
        userId,
        createdAt: { $gte: current.start, $lte: current.end }
      }
    },
    {
      $group: {
        _id: '$device',
        visits: { $sum: 1 }
      }
    }
  ])
  const mobileVisits =
    deviceAgg.find(d => d._id === 'mobile')?.visits || 0

  /* 🏆 SCORE */
  const weeklyScore = calculateWeeklyScore({
    visitsCurrent,
    visitsPrevious,
    clicks,
    regionsCurrentAgg,
    activeDays
  })

  /* 🧠 INSIGHTS */
  const insights = []

  insights.push({
    type: weeklyScore >= 70 ? 'positive' : 'warning',
    icon: '🏆',
    text: `Seu Score da Semana foi ${weeklyScore}/100 — ${getScoreLabel(
      weeklyScore
    )}`
  })

  const growth =
    visitsPrevious === 0
      ? visitsCurrent > 0 ? 100 : 0
      : ((visitsCurrent - visitsPrevious) / visitsPrevious) * 100

  insights.push({
    type: growth >= 0 ? 'positive' : 'negative',
    icon: growth >= 0 ? '📈' : '📉',
    text:
      growth >= 0
        ? `Suas visitas cresceram ${growth.toFixed(
            1
          )}% em relação à semana passada`
        : `Suas visitas caíram ${Math.abs(growth).toFixed(
            1
          )}% em relação à semana passada`
  })

  if (regionsCurrentAgg.length) {
    const topRegion = regionsCurrentAgg.sort(
      (a, b) => b.visits - a.visits
    )[0]

    const previousVisits = regionPreviousMap[topRegion._id] || 0

    insights.push({
      type: 'info',
      icon: '🌍',
      text: `Seu público está concentrado em ${normalizeState(
        topRegion._id
      )}`
    })

    if (previousVisits > 0) {
      const regionGrowth =
        ((topRegion.visits - previousVisits) / previousVisits) * 100

      insights.push({
        type: regionGrowth >= 0 ? 'positive' : 'negative',
        icon: regionGrowth >= 0 ? '📈' : '📉',
        text: `As visitas em ${normalizeState(topRegion._id)} ${
          regionGrowth >= 0 ? 'cresceram' : 'caíram'
        } ${Math.abs(regionGrowth).toFixed(
          1
        )}% em relação à semana passada`
      })
    }
  }

  if (topCity[0]?._id) {
    insights.push({
      type: 'info',
      icon: '🏙️',
      text: `A cidade com mais acessos foi ${topCity[0]._id}`
    })
  }

  if (mobileVisits > visitsCurrent * 0.6) {
    insights.push({
      type: 'info',
      icon: '📱',
      text: 'A maioria dos acessos veio de dispositivos móveis'
    })
  }

  return {
    summary: {
      visits: visitsCurrent,
      clicks,
      conversion: visitsCurrent
        ? ((clicks / visitsCurrent) * 100).toFixed(1)
        : '0.0'
    },
    score: {
      value: weeklyScore,
      label: getScoreLabel(weeklyScore),
      trend: visitsCurrent >= visitsPrevious ? 'up' : 'down'
    },
    regions,
    insights
  }
}
