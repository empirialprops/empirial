import { Firm, Review } from '@/lib/types';

export interface FirmMetrics {
  firm: Firm;
  rating: number;
  reviewCount: number;
  tradingConditions: number;
  customerCare: number;
  payoutProcess: number;
  userFriendliness: number;
  overallRank: number;
  reviews: Review[];
}

/**
 * Calculates genuine rating, review count, criteria breakdown, and overall rank
 * for a firm based on all submitted reviews.
 */
export function calculateFirmMetrics(firm: Firm, allReviews: Review[]): FirmMetrics {
  if (!firm) {
    return {
      firm: { id: '', name: 'Firm', slug: 'firm', rating: 0, review_count: 0 } as Firm,
      rating: 0,
      reviewCount: 0,
      tradingConditions: 0,
      customerCare: 0,
      payoutProcess: 0,
      userFriendliness: 0,
      overallRank: 0,
      reviews: [],
    };
  }

  // Match reviews for this firm by firm_id, slug, or firm_name
  const matchingReviews = (allReviews || []).filter((r) => {
    if (!r) return false;
    const rId = (r.firm_id || '').toLowerCase();
    const fId = (firm.id || '').toLowerCase();
    const fSlug = (firm.slug || '').toLowerCase();
    const rName = (r.firm_name || '').toLowerCase();
    const fName = (firm.name || '').toLowerCase();

    // Dedicated SLF alias resolver
    const isFirmSlf =
      ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(fId) ||
      ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(fSlug) ||
      fName.includes('sure leverage') ||
      fName.includes('slf');

    if (isFirmSlf) {
      if (
        ['sure-leverage', 'sure-leverage-funding', 'slf'].includes(rId) ||
        rName.includes('sure leverage') ||
        rName.includes('slf')
      ) {
        return true;
      }
    }

    return (
      (rId && fId && rId === fId) ||
      (rId && fSlug && rId === fSlug) ||
      (rName && fName && rName === fName) ||
      (fId && fId.length > 2 && rId.includes(fId.replace('-capital', ''))) ||
      (fSlug && fSlug.length > 2 && rId.includes(fSlug.replace('-capital', '')))
    );
  });

  const userReviewCount = matchingReviews.length;

  if (userReviewCount > 0) {
    const userTradingSum = matchingReviews.reduce((sum, r) => sum + (r.trading_conditions || 5), 0);
    const userCareSum = matchingReviews.reduce((sum, r) => sum + (r.customer_care || 5), 0);
    const userPayoutSum = matchingReviews.reduce((sum, r) => sum + (r.payout_process || 5), 0);
    const userUsabilitySum = matchingReviews.reduce((sum, r) => sum + (r.user_friendliness || 5), 0);

    const tradingConditions = Number((userTradingSum / userReviewCount).toFixed(1));
    const customerCare = Number((userCareSum / userReviewCount).toFixed(1));
    const payoutProcess = Number((userPayoutSum / userReviewCount).toFixed(1));
    const userFriendliness = Number((userUsabilitySum / userReviewCount).toFixed(1));

    const userRatingsSum = matchingReviews.reduce((sum, r) => {
      const avg = r.overall_rating || ((r.trading_conditions + r.customer_care + r.payout_process + r.user_friendliness) / 4);
      return sum + avg;
    }, 0);

    const overallRank = Number((userRatingsSum / userReviewCount).toFixed(1));
    const finalRating = Math.min(5, Math.max(0, overallRank));

    return {
      firm: {
        ...firm,
        rating: finalRating,
        review_count: userReviewCount,
      },
      rating: finalRating,
      reviewCount: userReviewCount,
      tradingConditions: Math.min(5, Math.max(0, tradingConditions)),
      customerCare: Math.min(5, Math.max(0, customerCare)),
      payoutProcess: Math.min(5, Math.max(0, payoutProcess)),
      userFriendliness: Math.min(5, Math.max(0, userFriendliness)),
      overallRank: finalRating,
      reviews: matchingReviews,
    };
  }

  // Zero metrics when no user reviews have been submitted for this firm
  return {
    firm: {
      ...firm,
      rating: 0,
      review_count: 0,
    },
    rating: 0,
    reviewCount: 0,
    tradingConditions: 0,
    customerCare: 0,
    payoutProcess: 0,
    userFriendliness: 0,
    overallRank: 0,
    reviews: [],
  };
}

/**
 * Calculates genuine metrics for a list of firms given all user reviews.
 */
export function calculateAllFirmMetrics(
  firms: Firm[],
  allReviews: Review[]
): Record<string, FirmMetrics> {
  const map: Record<string, FirmMetrics> = {};
  firms.forEach((f) => {
    if (f) {
      const metrics = calculateFirmMetrics(f, allReviews);
      map[f.id] = metrics;
      map[f.slug] = metrics;
    }
  });
  return map;
}
