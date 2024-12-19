import { executeQuery } from "./client";

import dotenv from "dotenv";
dotenv.config();

interface TestCase {
  no: string;
  queryPattern: string;
  queryName: string;
  lambdaFunctionName: string;
  sourceCodeFunctionName: string;
  queryAlias: string;
  fullSQL: string;
  shortSQL: string;
  count: string;
}

const main = async () => {
  // const sqls = [
  //   `SELECT l.couponId AS "クーポンID", o.name AS "組織名", l.couponCode AS "クーポンコード", l.couponName AS "クーポン名", l.barcode AS "バーコード", l.operateFrom AS "操作元", to_char(TIMESTAMP 'epoch' + (l.createAtMillis / 1000) * INTERVAL '1 second', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "日時", (SELECT COUNT(*) FROM coupon_logs l2 WHERE l2.type = 'displayed' AND l2.couponId = l.couponId) AS "参照回数", l.couponMasterId AS "クーポンマスタID" FROM coupon_logs l JOIN ( SELECT couponId, MAX(createAtMillis) AS createAtMillis FROM coupon_logs WHERE type = 'displayed' GROUP BY couponId ) latest ON l.couponId = latest.couponId AND l.createAtMillis = latest.createAtMillis JOIN organization o ON l.organizationId = o.resourceId AND l.couponMasterId = '4bb8c2f8-5ef7-461d-97ea-312bd1761de5' AND l.couponMasterId = '4bb8c2f8-5ef7-461d-97ea-312bd1761de5' ORDER BY l.couponCode, l.couponName, l.createAtMillis LIMIT 100 OFFSET 0`,
  // ];

  // Get data from ./configuration/test-case.json
  const testCases = require("../configuration/test-case.json") as TestCase[];

  console.log(testCases);

  for (const testCase of testCases) {
    // Replace \" with "
    testCase.fullSQL = testCase.fullSQL.replace(/\\"/g, '"').trim();
    console.log("Executing SQL:", testCase.fullSQL);

    const result = await executeQuery(testCase.fullSQL);
    console.log(`Done`);
    console.log(result.duration);
    break;
  }
};

main();
