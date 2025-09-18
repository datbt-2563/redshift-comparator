<!-- From -->
FROM coupon_logs l JOIN ( SELECT couponMasterId, MAX(createAtMillis) AS createAtMillis FROM coupon_logs GROUP BY couponMasterId ) latest ON l.couponMasterId = latest.couponMasterId AND l.createAtMillis = latest.createAtMillis

<!-- Hotfix -->
FROM (SELECT * FROM (SELECT cl.*, ROW_NUMBER() OVER (PARTITION BY cl.couponMasterId ORDER BY cl.createAtMillis DESC, cl.couponId DESC) AS rn FROM coupon_logs cl) t WHERE rn = 1) l

<!-- Patch -->
FROM coupon_logs l JOIN ( SELECT couponMasterId, MAX(createAtMillis) AS createAtMillis, MAX(logUUID) AS logUUID FROM coupon_logs GROUP BY couponMasterId ) latest ON l.couponMasterId = latest.couponMasterId AND l.createAtMillis = latest.createAtMillis AND l.logUUID = latest.logUUID
