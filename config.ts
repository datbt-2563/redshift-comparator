export interface QueryConfig {
  alias: string;
  name: string;
  jsonPath: string;
  match: string;
  functionName: string;
}

export const queryConfig: QueryConfig[] = [
  {
    alias: "Q1",
    name: "Display Log Json",
    jsonPath:
      "logs/display-log/prd-coupon-InvokeCouponDisplayLog-function.json",
    functionName: "displayedLogSql",
    match: `SELECT l.couponId                                                                                     AS "クーポンID",
               o.name                                                                                         AS "組織名",
               l.couponCode                                                                                   AS "クーポンコード",
               l.couponName                                                                                   AS "クーポン名",
               l.barcode                                                                                      AS "バーコード",
               l.operateFrom                                                                                  AS "操作元",
               to_char(TIMESTAMP 'epoch' + (l.createAtMillis / 1000) * INTERVAL '1 second', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "日時",
               (SELECT COUNT(*) FROM coupon_logs l2 WHERE l2.type = 'displayed' AND l2.couponId = l.couponId) AS "参照回数",
               l.couponMasterId                                                                               AS "クーポンマスタID"
        FROM coupon_logs l
                 JOIN (
            SELECT couponId,
                   MAX(createAtMillis) AS createAtMillis
            FROM coupon_logs
            WHERE type = 'displayed'
            GROUP BY couponId
        ) latest
                      ON l.couponId = latest.couponId AND l.createAtMillis = latest.createAtMillis
                 JOIN organization o ON l.organizationId = o.resourceId`,
  },
  {
    alias: "Q2",
    name: "Display Log Csv",
    jsonPath:
      "logs/display-log/prd-coupon-InvokeCouponDisplayLogCsvUrl-function.json",
    functionName: "displayedLogCsvSql",
    match: `unload ($$
            SELECT ROW_NUMBER()                        OVER(ORDER BY l.couponCode, l.couponName) AS "No", l.couponCode AS "クーポンコード",
                l.couponName                     AS "クーポン名",
                l.barcode                        AS "バーコード",
                to_char(DATEADD(hour, 9, TIMESTAMP 'epoch' + (l.createAtMillis / 1000) * INTERVAL '1 second'), 'YYYY/MM/DD" "HH24:MI:SS') AS "参照日時",
                l.userAgent                      AS "エージェント"
            FROM coupon_logs l
                JOIN organization o ON l.organizationId = o.resourceId
            WHERE l.type = 'displayed'`,
  },
  {
    alias: "Q3",
    name: "Usage Log Json",
    jsonPath: "logs/usage-log/prd-coupon-InvokeCouponUsageLog-function.json",
    functionName: "usageLogSql",
    match: `SELECT l.couponId                                                                     AS "クーポン交換ID",
               o.name                                                                         AS "組織名",
               l.couponCode                                                                   AS "クーポンコード",
               l.couponName                                                                   AS "クーポン名",
               l.url                                                                          AS "消し込みURL",
               l.barcode                                                                      AS "バーコード番号",
               CASE l.type WHEN 'issued' THEN '発行済み' WHEN 'used' THEN '使用済み' ELSE 'キャンセル' END AS "ステータス",
               to_char(TIMESTAMP 'epoch' + (l.createAtMillis / 1000) * INTERVAL '1 second', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "日時",
               o2.name                                                                        AS "利用店舗",
               l.customerShopCode                                                             AS "店舗コード",
               l.memberShopCode                                                               AS "加盟店コード",
               l.terminalNumber                                                               AS "端末コード",
               l.operateFrom                                                                  AS "操作元",
               l.couponMasterId                                                               AS "クーポンマスタID",
               l.userId                                                                       AS "ユーザーID",
               l.userName                                                                     AS "ユーザー名"
        FROM coupon_logs l
                 JOIN
             organization o
             ON o.resourceId = l.organizationId
                 LEFT JOIN
             organization o2
             ON o2.resourceId = l.usedShopId
        WHERE l.type <> 'displayed'`,
  },
  {
    alias: "Q4",
    name: "Usage Log Csv",
    jsonPath:
      "logs/usage-log/prd-coupon-InvokeCouponUsageLogCsvUrl-function.json",
    functionName: "usageLogCsvSql",
    match: `unload ($$
            SELECT l.couponId                                                                                      AS "クーポン交換ID",
                o.name                                                                                          AS "組織名",
                l.couponCode                                                                                    AS "クーポンコード",
                l.couponName                                                                                    AS "クーポン名",
                l.url                                                                                           AS "消し込みURL",
                l.barcode                                                                                       AS "バーコード番号",
                l.barcodeType                                                                                   AS "バーコードタイプ",
                CASE l.type
                    WHEN 'issued' THEN '発行済み'
                    WHEN 'used' THEN '使用済み'
                    ELSE 'キャンセル' END                                                                          AS "ステータス",
                to_char(DATEADD(hour, 9, TIMESTAMP 'epoch' + (l.createAtMillis / 1000) * INTERVAL '1 second'), 'YYYY/MM/DD" "HH24:MI') AS "日時",
                o2.name                                                                                          AS "利用店舗",
                l.terminalNumber                                                                                 AS "端末コード",
                o2.customershopcode                                                                              AS "顧客店舗コード"
            FROM coupon_logs l
                    JOIN
                organization o
                ON o.resourceId = l.organizationId
                    LEFT JOIN
                organization o2 ON o2.resourceId = l.usedShopId
            WHERE l.type <> 'displayed'`,
  },
  {
    alias: "Q5",
    name: "Display Aggregate Json",
    jsonPath:
      "logs/display-aggregate/prd-coupon-invokeCouponDisplayAggregateJson-function.json",

    functionName: "byCouponMasterSql",
    match: `SELECT l.couponMasterId,
               o.resourceId,
               o.name,
               l.couponCode,
               l.couponName,
               (
                   SELECT COUNT(*)
                      FROM coupon_logs l2
                      WHERE l2.type = 'issued'
                        AND l2.couponMasterId = l.couponMasterId
                        AND NOT EXISTS(
                          SELECT
                            1
                          FROM
                            coupon_logs AS l3
                          WHERE
                            l2.couponId = l3.couponId
                            AND l3.type = 'issued'
                            AND l2.createAtMillis < l3.createAtMillis
                        )
               ) AS "発行数",
               (
                   SELECT COUNT(*)
                   FROM coupon_logs l2
                   WHERE l2.type = 'used'
                     AND l2.couponMasterId = l.couponMasterId
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l3
                           WHERE l2.couponId = l3.couponId
                             AND l3.type <> 'displayed'
                             AND l2.createAtMillis < l3.createAtMillis
                       )
               ) AS "使用済数",
               (
                   SELECT COUNT(*)
                   FROM coupon_logs l2
                   WHERE l2.type = 'canceled'
                     AND l2.couponMasterId = l.couponMasterId
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l3
                           WHERE l2.couponId = l3.couponId
                             AND l3.type <> 'displayed'
                             AND l2.createAtMillis < l3.createAtMillis
                       )
               ) AS "キャンセル",
               (SELECT COUNT(*)
                FROM coupon_logs l2
                WHERE l2.type = 'displayed'
                  AND l2.couponMasterId = l.couponMasterId)`,
  },
  {
    alias: "Q6",
    name: "Display Aggregate Csv",
    jsonPath:
      "logs/display-aggregate/prd-coupon-invokeCouponDisplayAggregateCsvUrl-function.json",
    functionName: "displayedCsvSql",
    match: `unload ($$
            SELECT ROW_NUMBER()                                    OVER(ORDER BY couponCode, couponName) AS "No", o.name AS "組織名",
                couponCode                                   AS "クーポンコード",
                couponName                                   AS "クーポン名",
                (
                    SELECT COUNT(*)
                    FROM coupon_logs l2
                    WHERE l2.type = 'issued'
                        AND l2.couponMasterId = l.couponMasterId
                        AND NOT EXISTS(
                            SELECT
                            1
                            FROM
                            coupon_logs AS l3
                            WHERE
                            l2.couponId = l3.couponId
                            AND l3.type = 'issued'
                            AND l2.createAtMillis < l3.createAtMillis
                        )
                )                                            AS "発行数",
                (SELECT COUNT(*)
                    FROM coupon_logs l2
                    WHERE l2.type = 'displayed'
                    AND l2.couponMasterId = l.couponMasterId) AS "参照数"`,
  },
  {
    alias: "Q7",
    name: "Usage Aggregate Json byCouponMasterSql",
    jsonPath:
      "logs/usage-aggregate/prd-coupon-invokeCouponUsageAggregateJson-function.json",
    functionName: "byCouponMasterSql",
    match: `SELECT l.couponMasterId,
               o.resourceId,
               o.name,
               l.couponCode,
               l.couponName,
               (
                   SELECT COUNT(*)
                      FROM coupon_logs l2
                      WHERE l2.type = 'issued'
                        AND l2.couponMasterId = l.couponMasterId
                        AND NOT EXISTS(
                          SELECT
                            1
                          FROM
                            coupon_logs AS l3
                          WHERE
                            l2.couponId = l3.couponId
                            AND l3.type = 'issued'
                            AND l2.createAtMillis < l3.createAtMillis
                        )
               ) AS "発行数",
               (
                   SELECT COUNT(*)
                   FROM coupon_logs l2
                   WHERE l2.type = 'used'
                     AND l2.couponMasterId = l.couponMasterId
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l3
                           WHERE l2.couponId = l3.couponId
                             AND l3.type <> 'displayed'
                             AND l2.createAtMillis < l3.createAtMillis
                       )
               ) AS "使用済数",
               (
                   SELECT COUNT(*)
                   FROM coupon_logs l2
                   WHERE l2.type = 'canceled'
                     AND l2.couponMasterId = l.couponMasterId
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l3
                           WHERE l2.couponId = l3.couponId
                             AND l3.type <> 'displayed'
                             AND l2.createAtMillis < l3.createAtMillis
                       )
               ) AS "キャンセル",
               (SELECT COUNT(*)
                FROM coupon_logs l2
                WHERE l2.type = 'displayed'
                  AND l2.couponMasterId = l.couponMasterId)`,
  },
  {
    alias: "Q8",
    name: "Usage Aggregate Json byOrganizationSql",
    jsonPath:
      "logs/usage-aggregate/prd-coupon-invokeCouponUsageAggregateJson-function.json",
    functionName: "byOrganizationSql",
    match: `SELECT o.resourceId AS "組織ID",
               o.name       AS "組織名",
                (
                  SELECT
                    COUNT(*)
                  FROM
                    coupon_logs l
                  WHERE
                    l.organizationId = o.resourceId
                    AND type = 'issued'
                    AND NOT EXISTS(
                      SELECT
                        1
                      FROM
                        coupon_logs AS l2
                      WHERE
                        l.couponId = l2.couponId
                        AND l2.type = 'issued'
                        AND l.createAtMillis < l2.createAtMillis
                    )
                ) AS "自拠点発行数",

                (
                  SELECT
                    COUNT(*)
                  FROM
                    coupon_logs l
                  JOIN organization_closure oc
                    ON oc.parentId = o.resourceId
                      AND l.organizationId = oc.childId
                  WHERE type = 'issued'
                    AND NOT EXISTS(
                      SELECT
                        1
                      FROM
                        coupon_logs AS l2
                      WHERE
                        l.couponId = l2.couponId
                        AND l2.type = 'issued'
                        AND l.createAtMillis < l2.createAtMillis
                    )
                ) AS "発行数",

               (
                   SELECT COUNT(*)
                   FROM coupon_logs l
                   WHERE l.organizationId = o.resourceId
                     AND type = 'used'
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l2
                           WHERE l.couponId = l2.couponId
                             AND l2.type <> 'displayed'
                             AND l.createAtMillis < l2.createAtMillis
                       )
               )                   AS "自店舗消込数",

               (
                   SELECT COUNT(*)
                   FROM coupon_logs l,
                        organization_closure oc
                   WHERE oc.parentId = o.resourceId
                     AND oc.childId = l.usedShopId
                     AND type = 'used'
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l2
                           WHERE l.couponId = l2.couponId
                             AND l2.type <> 'displayed'
                             AND l.createAtMillis < l2.createAtMillis
                       )
               )                   AS "消込数",

               (
                   SELECT COUNT(*)
                   FROM coupon_logs l,
                        organization_closure oc
                   WHERE oc.parentId = o.resourceId
                     AND oc.childId = l.usedShopId
                     AND type = 'canceled'
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l2
                           WHERE l.couponId = l2.couponId
                             AND l2.type <> 'displayed'
                             AND l.createAtMillis < l2.createAtMillis
                       )
               )                   AS "キャンセル"
        FROM organization o
                 JOIN
             organization_closure oc
             ON oc.childId = o.resourceId`,
  },
  {
    alias: "Q9",
    name: "Usage Aggregate Csv byCouponMasterSql",
    jsonPath:
      "logs/usage-aggregate/prd-coupon-invokeCouponUsageAggregateCsvUrl-function.json",
    functionName: "byCouponMasterCsvSql",
    match: `unload ($$
        SELECT ROW_NUMBER()  OVER(ORDER BY couponCode, couponName) AS "No", o.name AS "組織名",
               couponCode AS "クーポンコード",
               couponName AS "クーポン名",
               (
                  SELECT COUNT(*)
                    FROM coupon_logs l2
                    WHERE l2.type = 'issued'
                      AND l2.couponMasterId = l.couponMasterId
                      AND NOT EXISTS(
                        SELECT
                          1
                        FROM
                          coupon_logs AS l3
                        WHERE
                          l2.couponId = l3.couponId
                          AND l3.type = 'issued'
                          AND l2.createAtMillis < l3.createAtMillis
                    )
               )          AS "発行数",
               (
                   SELECT COUNT(*)
                   FROM coupon_logs l2
                   WHERE l2.type = 'used'
                     AND l2.couponMasterId = l.couponMasterId
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l3
                           WHERE l2.couponId = l3.couponId
                             AND l3.type <> 'displayed'
                             AND l2.createAtMillis < l3.createAtMillis
                       )
               )          AS "使用済数",
               (
                   SELECT COUNT(*)
                   FROM coupon_logs l2
                   WHERE l2.type = 'canceled'
                     AND l2.couponMasterId = l.couponMasterId
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l3
                           WHERE l2.couponId = l3.couponId
                             AND l3.type <> 'displayed'
                             AND l2.createAtMillis < l3.createAtMillis
                       )
               )          AS "キャンセル"`,
  },
  {
    alias: "Q10",
    name: "Usage Aggregate Csv byOrganizationCsvSql",
    jsonPath:
      "logs/usage-aggregate/prd-coupon-invokeCouponUsageAggregateCsvUrl-function.json",
    functionName: "byOrganizationCsvSql",
    match: `unload ($$
        SELECT ROW_NUMBER() OVER(ORDER BY o.name) AS "No", o.name AS "組織名",
               (
                  SELECT COUNT(*)
                  FROM coupon_logs l
                  WHERE o.resourceId = l.organizationId
                    AND type = 'issued'
                    AND NOT EXISTS(
                      SELECT
                        1
                      FROM
                        coupon_logs AS l2
                      WHERE
                        l.couponId = l2.couponId
                        AND l2.type = 'issued'
                        AND l.createAtMillis < l2.createAtMillis
                    )
               ) AS         "発行数",

               (
                   SELECT COUNT(*)
                   FROM coupon_logs l,
                        organization_closure oc
                   WHERE oc.parentId = o.resourceId
                     AND oc.childId = l.usedShopId
                     AND type = 'used'
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l2
                           WHERE l.couponId = l2.couponId
                             AND l2.type <> 'displayed'
                             AND l.createAtMillis < l2.createAtMillis
                       )
               ) AS         "消込数",

               (
                   SELECT COUNT(*)
                   FROM coupon_logs l,
                        organization_closure oc
                   WHERE oc.parentId = o.resourceId
                     AND oc.childId = l.usedShopId
                     AND type = 'canceled'
                     AND NOT EXISTS(
                           SELECT 1
                           FROM coupon_logs AS l2
                           WHERE l.couponId = l2.couponId
                             AND l2.type <> 'displayed'
                             AND l.createAtMillis < l2.createAtMillis
                       )
               ) AS         "キャンセル"
        FROM organization o
                 JOIN
             organization_closure oc
             ON oc.childId = o.resourceId`,
  },
];
