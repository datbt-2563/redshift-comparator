import {
  getQueryResult,
  invokeQuery,
  redshiftStatusPollerOnce,
} from "./client";

const main = async () => {
  const sqlQuery2 = `SELECT
      organizationid,
      couponmasterid
  FROM coupon_logs
  LIMIT 10`;

  const sqlQuery1 = `SELECT schema_name FROM information_schema.schemata;`;

  const { queryExecutionId } = await invokeQuery(sqlQuery2);

  console.log("queryExecutionId", queryExecutionId);

  for (let i = 0; i < 20; i++) {
    const { status, outputLocation } = await redshiftStatusPollerOnce({
      queryExecutionId,
    });

    console.log("status", status);
    console.log("outputLocation", outputLocation);

    if (status === "SUCCEEDED") {
      const res = await getQueryResult(queryExecutionId);
      console.log("res", res);
      break;
    }

    if (status === "FAILED") {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

main();
