import { query } from "./client";

import dotenv from "dotenv";
dotenv.config();

const main = async () => {
  const sqls = [
    `SELECT current_database();`,
    `SELECT schema_name FROM information_schema.schemata;`,
    `SELECT
      organizationid,
      couponmasterid
  FROM public.coupon_logs
  LIMIT 10`,
  ];

  for (const sql of sqls) {
    const result = await query(sql);
    console.log(result);
  }
};

main();
