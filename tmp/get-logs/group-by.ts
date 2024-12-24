import fs from "fs";
import csvParser from "csv-parser";
import { escapeCSVField, getLambdaNameFromJsonPath } from "get-logs/helper";
import { queryConfig } from "get-logs/config";

interface Record {
  no: string;
  timestamp: string;
  shortSQL: string;
  fullSQL: string;
}

type GroupedData = {
  queryPattern: string;
  shortSQL: string;
  count: number;
  records: Record[];
};

async function readCSV(filePath: string): Promise<Record[]> {
  const records: Record[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (data) => records.push(data))
      .on("end", () => resolve(records))
      .on("error", (error) => reject(error));
  });
}

function sortAndGroupByShortSQL(
  records: Record[],
  queryPattern: string
): GroupedData[] {
  // Sắp xếp theo shortSQL
  records.sort((a, b) => a.shortSQL.localeCompare(b.shortSQL));

  // Nhóm và đếm số lượng
  const groupedMap: { [key: string]: GroupedData } = {};

  records.forEach((record) => {
    if (!groupedMap[record.shortSQL]) {
      groupedMap[record.shortSQL] = {
        queryPattern,
        shortSQL: record.shortSQL,
        count: 0,
        records: [],
      };
    }
    groupedMap[record.shortSQL].count++;
    groupedMap[record.shortSQL].records.push(record);
  });

  // Chuyển sang mảng và sắp xếp theo count giảm dần
  const groupedData: GroupedData[] = Object.values(groupedMap);
  groupedData.sort((a, b) => b.count - a.count);

  return groupedData;
}

const getConfig = (queryPattern: string) => {
  return queryConfig.find((config) => config.alias === queryPattern);
};

// Sử dụng hàm
async function main() {
  let no = 1;
  let csv = `no,queryPattern,queryName,lambdaFunctionName,sourceCodeFunctionName,queryAlias,fullSQL,shortSQL,count\n`;

  for (let i = 0; i < 10; i++) {
    try {
      const queryPattern = `Q${i + 1}`;
      const cnf = getConfig(queryPattern);

      const filePath = `logs/data/${queryPattern}.csv`;
      const records = await readCSV(filePath);
      const groupedData = sortAndGroupByShortSQL(records, queryPattern);

      const top10 = groupedData.slice(0, 10);

      top10.forEach((grouped, index) => {
        const queryAlias = `${queryPattern}_${index + 1}`;
        csv += `${no},${grouped.queryPattern},${
          cnf?.name
        },${getLambdaNameFromJsonPath(cnf?.jsonPath)},${
          cnf?.functionName
        },${queryAlias},${escapeCSVField(
          grouped.records[0].fullSQL
        )},${escapeCSVField(grouped.shortSQL)},${grouped.count}\n`;
        no++;
      });
    } catch (error) {
      console.error("Lỗi khi đọc file CSV:", error);
    }
  }

  fs.writeFileSync("grouped-data.csv", csv);
}

main();
