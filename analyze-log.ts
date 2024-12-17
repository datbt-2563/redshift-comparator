import { QueryConfig } from "get-logs/config";

export interface AnalyzingLogResult {
  timestamp: number;
  shortSQL: string;
  fullSQL: string;
  isMatch: boolean;
}

export interface FullAnalyzingResult extends AnalyzingLogResult {
  queryConfig: QueryConfig;
}

const cleanSQLQuery = (sqlQuery: string): string => {
  return sqlQuery.replace(/\n/g, " ").replace(/\t/g, " ").replace(/ +/g, " ");
};

const extractSQL = (message): string => {
  const sqlIndex = message.indexOf("sql ");
  if (sqlIndex !== -1) {
    return cleanSQLQuery(message.substring(sqlIndex + 4));
  }
  return "";
};

const createShortSQL = (sqlQuery: string, match: string): string => {
  const cleanSQl = cleanSQLQuery(
    sqlQuery.replace(cleanSQLQuery(match), "_SAME_")
  );

  function replaceS3Path(input: string): string {
    const pattern = /s3:\/\/[\w\.\-]+\/[\w\.\-\/]+/g; // Regex linh hoạt cho S3 URLs
    return input.replace(pattern, "_S3_PATH_");
  }

  return cleanSQLQuery(replaceS3Path(cleanSQl));
};

export const analyzeLog = (
  log: {
    timestamp: number;
    message: string;
  },
  match: string
): AnalyzingLogResult => {
  let sqlQuery = extractSQL(log.message);
  if (!sqlQuery) {
    return;
  }
  sqlQuery = cleanSQLQuery(sqlQuery);

  let matchStr = cleanSQLQuery(match);

  if (sqlQuery.includes(matchStr)) {
    return {
      timestamp: log.timestamp,
      shortSQL: createShortSQL(sqlQuery, matchStr),
      fullSQL: sqlQuery,
      isMatch: true,
    };
  } else {
    return {
      timestamp: log.timestamp,
      shortSQL: "",
      fullSQL: sqlQuery,
      isMatch: false,
    };
  }
};
