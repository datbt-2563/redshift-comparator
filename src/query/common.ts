// import { CouponUsageLogQuery } from "../../domain/coupon-usage-log-query";
// import { CouponUsageQuery } from "../../domain/coupon-usage-query";

/**
 * LIKE 検索のためのエスケープ処理
 */
export const escapeLike = (str: string): string => {
  return str.replace(/([%_])/g, "\\\\$1");
};

/**
 * クーポンマスタIDごとの最新データのマスタのJOIN SQL
 */
export const latestCouponLogMasterSql = `
FROM 
    coupon_logs l
JOIN (
  SELECT 
    couponMasterId,
    MAX(createAtMillis) AS createAtMillis
  FROM coupon_logs
  GROUP BY couponMasterId 
) latest
ON l.couponMasterId = latest.couponMasterId
AND l.createAtMillis = latest.createAtMillis
`;

/**
 * 引数の組織配下のデータのみとするJOIN SQL
 */
export const organizationJoinSql = (organizationId: string): string => {
  return `
JOIN 
    organization_closure oc
    ON oc.childId = l.organizationId
JOIN 
    organization o
    ON o.resourceId = l.organizationId
WHERE 
    oc.parentId = '${organizationId}'
`;
};

/**
 * 利用状況集計の共通検索SQL
 */
export const usageCommonWhereSql = (query: any): string => {
  return `
${
  query.organizationName
    ? "AND o.name LIKE " +
      "'%" +
      escapeLike(query.organizationName.value) +
      "%'"
    : ""
}
${
  query.couponCode
    ? "AND l.couponCode LIKE " +
      "'%" +
      escapeLike(query.couponCode.value) +
      "%'"
    : ""
}
${
  query.couponName
    ? "AND l.couponName LIKE " +
      "'%" +
      escapeLike(query.couponName.value) +
      "%'"
    : ""
}
`;
};

/**
 * 利用状況一覧の共通検索SQL
 */
export const usageLogCommonWhereSql = (query: any): string => {
  return `
${
  query.couponMasterId
    ? `AND l.couponMasterId = '${query.couponMasterId!.value}'`
    : query.organizationId
    ? `AND l.organizationId = '${query.organizationId!.value}'`
    : ""
}
${
  query.searchPolicy === "latest"
    ? `
AND NOT EXISTS (
    SELECT 1
    FROM coupon_logs AS l2
    WHERE l.couponId = l2.couponId
    AND l2.type <> 'displayed'    
    AND l.createAtMillis < l2.createAtMillis
)`
    : ""
}
${
  query.couponMasterId
    ? `AND l.couponMasterId = '${query.couponMasterId!.value}'`
    : ""
}    
${query.couponId ? "AND l.couponId = " + "'" + query.couponId.value + "'" : ""}
${
  query.organizationName
    ? "AND o.name LIKE " +
      "'%" +
      escapeLike(query.organizationName.value) +
      "%'"
    : ""
}
${
  query.couponCode
    ? "AND l.couponCode LIKE " +
      "'%" +
      escapeLike(query.couponCode.value) +
      "%'"
    : ""
}
${
  query.couponName
    ? "AND l.couponName LIKE " +
      "'%" +
      escapeLike(query.couponName.value) +
      "%'"
    : ""
}
${
  query.barcode
    ? "AND l.barcode LIKE " + "'%" + escapeLike(query.barcode.value) + "%'"
    : ""
}
${
  query.url ? "AND l.url LIKE " + "'%" + escapeLike(query.url.value) + "%'" : ""
}
${
  (query.isIssued && query.isUsed && query.isCanceled) ||
  (!query.isIssued && !query.isUsed && !query.isCanceled)
    ? ""
    : `AND l.type IN (''${query.isIssued ? `,'issued'` : `,''`}${
        query.isUsed ? `,'used'` : `,''`
      }${query.isCanceled ? `,'canceled'` : `,''`})`
}    
    `;
};

/**
 * 利用状況集計の共通取得数制限SQL
 */
export const usageCommonLimitSql = (query: any): string => {
  return `
LIMIT ${query.limit.value}
OFFSET ${query.offset.value}
    `;
};

/**
 * 利用状況一覧の共通取得数制限SQL
 */
export const usageLogCommonLimitSql = (query: any): string => {
  return `
LIMIT ${query.limit.value}
OFFSET ${query.offset.value}
    `;
};
