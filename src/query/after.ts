import {
  escapeLike,
  latestCouponLogMasterSql,
  organizationJoinSql,
  usageCommonLimitSql,
  usageCommonWhereSql,
} from "./common";

export const displayedCsvSql = (query: CouponUsageQuery): string => {
  return `
        unload ($$
            WITH issued_count AS (
                SELECT 
                    couponMasterId,
                    COUNT(*) AS issued_count
                FROM coupon_logs
                WHERE type = 'issued'
                GROUP BY couponMasterId
            ),
            displayed_count AS (
                SELECT 
                    couponMasterId,
                    COUNT(*) AS displayed_count
                FROM coupon_logs
                WHERE type = 'displayed'
                GROUP BY couponMasterId
            )
            SELECT 
                ROW_NUMBER() OVER(ORDER BY l.couponCode, l.couponName) AS "No",
                o.name AS "組織名",
                l.couponCode AS "クーポンコード",
                l.couponName AS "クーポン名",
                COALESCE(ic.issued_count, 0) AS "発行数",
                COALESCE(dc.displayed_count, 0) AS "参照数"
            FROM 
                coupon_logs l
            JOIN (
                SELECT 
                    couponMasterId, 
                    MAX(createAtMillis) AS createAtMillis 
                FROM 
                    coupon_logs 
                GROUP BY 
                    couponMasterId
            ) latest 
                ON l.couponMasterId = latest.couponMasterId 
                AND l.createAtMillis = latest.createAtMillis
            JOIN organization_closure oc 
                ON oc.childId = l.organizationId
            JOIN organization o 
                ON o.resourceId = l.organizationId
            LEFT JOIN issued_count ic 
                ON ic.couponMasterId = l.couponMasterId
            LEFT JOIN displayed_count dc 
                ON dc.couponMasterId = l.couponMasterId
            WHERE 
                WHERE l2.type = 'displayed'
                AND l2.couponMasterId = l.couponMasterId) AS "参照数"
                    ${latestCouponLogMasterSql}
                    ${organizationJoinSql(query.organizationId.value)}
                    ${usageCommonWhereSql(query)}
            ORDER BY 
                l.couponCode, 
                l.couponName
        $$)
        to '${query.outputLocation}'
        iam_role '${query.iamRoleArn}'
        HEADER
        DELIMITER ','
        ADDQUOTES
        PARALLEL OFF
    `;
};

export const byCouponMasterSql = (query: CouponUsageQuery): string => {
  return `
        WITH issued_count AS (
            SELECT 
                couponMasterId,
                COUNT(*) AS issued_count
            FROM coupon_logs
            WHERE type = 'issued'
            GROUP BY couponMasterId
        ),
        used_count AS (
            SELECT 
                couponMasterId,
                COUNT(*) AS used_count
            FROM coupon_logs
            WHERE type = 'used'
            GROUP BY couponMasterId
        ),
        canceled_count AS (
            SELECT 
                couponMasterId,
                COUNT(*) AS canceled_count
            FROM coupon_logs
            WHERE type = 'canceled'
            GROUP BY couponMasterId
        ),
        displayed_count AS (
            SELECT 
                couponMasterId,
                COUNT(*) AS displayed_count
            FROM coupon_logs
            WHERE type = 'displayed'
            GROUP BY couponMasterId
        )
        SELECT 
            l.couponMasterId,
            o.resourceId,
            o.name,
            l.couponCode,
            l.couponName,
            COALESCE(ic.issued_count, 0) AS "発行数",
            COALESCE(uc.used_count, 0) AS "使用済数",
            COALESCE(cc.canceled_count, 0) AS "キャンセル",
            COALESCE(dc.displayed_count, 0) AS "参照数"
        FROM 
            coupon_logs l
        JOIN (
            SELECT 
                couponMasterId, 
                MAX(createAtMillis) AS createAtMillis 
            FROM 
                coupon_logs 
            GROUP BY 
                couponMasterId
        ) latest 
            ON l.couponMasterId = latest.couponMasterId 
            AND l.createAtMillis = latest.createAtMillis
        JOIN organization_closure oc 
            ON oc.childId = l.organizationId
        JOIN organization o 
            ON o.resourceId = l.organizationId
        LEFT JOIN issued_count ic 
            ON ic.couponMasterId = l.couponMasterId
        LEFT JOIN used_count uc 
            ON uc.couponMasterId = l.couponMasterId
        LEFT JOIN canceled_count cc 
            ON cc.couponMasterId = l.couponMasterId
        LEFT JOIN displayed_count dc 
            ON dc.couponMasterId = l.couponMasterId
        WHERE 
            l2.type = 'displayed'
            AND l2.couponMasterId = l.couponMasterId)
                ${latestCouponLogMasterSql} ${organizationJoinSql(
    query.organizationId.value
  )}
        ORDER BY 
            l.couponCode, 
            l.couponName, 
            l.createAtMillis, 
            o.resourceId
            ${usageCommonLimitSql(query)}
    `;
};

export const byCouponMasterCsvSql = (query: CouponUsageQuery): string => {
  return `
      unload ($$
        WITH issued_count AS (
            SELECT 
                couponMasterId,
                COUNT(*) AS issued_count
            FROM coupon_logs
            WHERE type = 'issued'
            GROUP BY couponMasterId
        ),
        used_count AS (
            SELECT 
                couponMasterId,
                COUNT(*) AS used_count
            FROM coupon_logs
            WHERE type = 'used'
            GROUP BY couponMasterId
        ),
        canceled_count AS (
            SELECT 
                couponMasterId,
                COUNT(*) AS canceled_count
            FROM coupon_logs
            WHERE type = 'canceled'
            GROUP BY couponMasterId
        )
        SELECT 
            ROW_NUMBER() OVER(ORDER BY couponCode, couponName) AS "No",
            o.name AS "組織名",
            l.couponCode AS "クーポンコード",
            l.couponName AS "クーポン名",
            COALESCE(ic.issued_count, 0) AS "発行数",
            COALESCE(uc.used_count, 0) AS "使用済数",
            COALESCE(cc.canceled_count, 0) AS "キャンセル"
            ${latestCouponLogMasterSql}
            ${organizationJoinSql(query.organizationId.value)}
            ${usageCommonWhereSql(query)}
        FROM 
            coupon_logs l
        JOIN (
            SELECT 
                couponMasterId, 
                MAX(createAtMillis) AS createAtMillis 
            FROM 
                coupon_logs 
            GROUP BY 
                couponMasterId
        ) latest 
        ON l.couponMasterId = latest.couponMasterId 
        AND l.createAtMillis = latest.createAtMillis
        JOIN organization_closure oc ON oc.childId = l.organizationId
        JOIN organization o ON o.resourceId = l.organizationId
        LEFT JOIN issued_count ic ON ic.couponMasterId = l.couponMasterId
        LEFT JOIN used_count uc ON uc.couponMasterId = l.couponMasterId
        LEFT JOIN canceled_count cc ON cc.couponMasterId = l.couponMasterId
        ORDER BY 
            couponCode, 
            couponName;
      $$)
      to '${query.outputLocation}'
      iam_role '${query.iamRoleArn}'
      DELIMITER ','
      ADDQUOTES
      HEADER
      PARALLEL OFF
      `;
};

export const byOrganizationSql = (query: CouponUsageQuery): string => {
  return `
        WITH local_issued_count AS (
            SELECT 
                organizationId,
                COUNT(*) AS local_issued_count
            FROM coupon_logs
            WHERE type = 'issued'
            GROUP BY organizationId
        ),
        issued_count AS (
            SELECT 
                oc.parentId AS organizationId,
                COUNT(*) AS issued_count
            FROM coupon_logs l
            JOIN organization_closure oc 
                ON oc.childId = l.organizationId
            WHERE type = 'issued'
            GROUP BY oc.parentId
        ),
        local_used_count AS (
            SELECT 
                organizationId,
                COUNT(*) AS local_used_count
            FROM coupon_logs
            WHERE type = 'used'
            GROUP BY organizationId
        ),
        used_count AS (
            SELECT 
                oc.parentId AS organizationId,
                COUNT(*) AS used_count
            FROM coupon_logs l
            JOIN organization_closure oc 
                ON oc.childId = l.usedShopId
            WHERE type = 'used'
            GROUP BY oc.parentId
        ),
        canceled_count AS (
            SELECT 
                oc.parentId AS organizationId,
                COUNT(*) AS canceled_count
            FROM coupon_logs l
            JOIN organization_closure oc 
                ON oc.childId = l.usedShopId
            WHERE type = 'canceled'
            GROUP BY oc.parentId
        )
        SELECT 
            o.resourceId AS "組織ID",
            o.name AS "組織名",
            COALESCE(li.local_issued_count, 0) AS "自拠点発行数",
            COALESCE(ic.issued_count, 0) AS "発行数",
            COALESCE(lu.local_used_count, 0) AS "自店舗消込数",
            COALESCE(uc.used_count, 0) AS "消込数",
            COALESCE(cc.canceled_count, 0) AS "キャンセル"
        FROM 
            organization o
        JOIN organization_closure oc 
            ON oc.childId = o.resourceId
        LEFT JOIN local_issued_count li 
            ON li.organizationId = o.resourceId
        LEFT JOIN issued_count ic 
            ON ic.organizationId = o.resourceId
        LEFT JOIN local_used_count lu 
            ON lu.organizationId = o.resourceId
        LEFT JOIN used_count uc 
            ON uc.organizationId = o.resourceId
        LEFT JOIN canceled_count cc 
            ON cc.organizationId = o.resourceId
        WHERE 
            oc.parentId = '${query.organizationId.value}'
            AND o.type = '${query.groupBy.value}'
                ${
                  query.organizationName
                    ? "AND o.name LIKE " +
                      "'%" +
                      escapeLike(query.organizationName.value) +
                      "%'"
                    : ""
                }
        ORDER BY 
            o.name, 
            o.resourceId
        ${usageCommonLimitSql(query)}
    `;
};

export const byOrganizationCsvSql = (query: CouponUsageQuery): string => {
  return `
      unload ($$
        WITH issued_count AS (
            SELECT 
                organizationId,
                COUNT(*) AS issued_count
            FROM coupon_logs
            WHERE type = 'issued'
            GROUP BY organizationId
        ),
        used_count AS (
            SELECT 
                oc.parentId AS organizationId,
                COUNT(*) AS used_count
            FROM coupon_logs l
            JOIN organization_closure oc 
                ON oc.childId = l.usedShopId
            WHERE type = 'used'
            GROUP BY oc.parentId
        ),
        canceled_count AS (
            SELECT 
                oc.parentId AS organizationId,
                COUNT(*) AS canceled_count
            FROM coupon_logs l
            JOIN organization_closure oc 
                ON oc.childId = l.usedShopId
            WHERE type = 'canceled'
            GROUP BY oc.parentId
        )
        SELECT 
            ROW_NUMBER() OVER(ORDER BY o.name) AS "No",
            o.name AS "組織名",
            COALESCE(ic.issued_count, 0) AS "発行数",
            COALESCE(uc.used_count, 0) AS "消込数",
            COALESCE(cc.canceled_count, 0) AS "キャンセル"
        FROM 
            organization o
        JOIN organization_closure oc 
            ON oc.childId = o.resourceId
        LEFT JOIN issued_count ic 
            ON ic.organizationId = o.resourceId
        LEFT JOIN used_count uc 
            ON uc.organizationId = o.resourceId
        LEFT JOIN canceled_count cc 
            ON cc.organizationId = o.resourceId
        WHERE 
            o.type = '${query.groupBy.value}'
            AND oc.parentId = '${query.organizationId.value}'
                ${
                  query.organizationName
                    ? "AND o.name LIKE " +
                      "'%" +
                      escapeLike(query.organizationName.value) +
                      "%'"
                    : ""
                }
        ORDER BY 
            o.name;

      $$)
      to '${query.outputLocation}'
      iam_role '${query.iamRoleArn}'
      DELIMITER ','
      ADDQUOTES
      HEADER
      PARALLEL OFF
    `;
};
