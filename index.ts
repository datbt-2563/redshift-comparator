import prompts from "prompts";
import { getClusterNames } from "src/configuration/redshift-cluster";
import {
  runAllQueries,
  runQueriesByPatterns,
  runQueriesByQueryAliases,
} from "src/test-runner";
import {
  askForClusterName,
  askForNote,
  askForQueriesInPattern,
  askForQueryPatterns,
} from "src/test-runner/prompt";

// Get params from command line
const args = process.argv.slice(2);
console.log(args);

const showMenu = async () => {
  const choices = [
    {
      title: "Run All Queries",
      value: "run-all-queries",
    },
    {
      title: "Run All Queries 3 times",
      value: "run-all-queries-3-times",
    },
    {
      title: "Run Queries by Patterns",
      value: "run-queries-by-patterns",
    },
    {
      title: "Run Selected Queries in Pattern",
      value: "run-selected-queries-in-pattern",
    },
    {
      title: "Test connection to all cluster",
      value: "test-connection-to-all-cluster",
    },
    {
      title: "Test query plan for all query patterns",
      value: "test-query-plan-for-all-query-patterns",
    },
    {
      title: "Exit",
      value: "exit",
    },
  ];
  // const response = await prompts({
  //   type: "select",
  //   name: "value",
  //   message: "Choose an action",
  //   choices,
  // });

  // const { value } = response;

  let value = "run-all-queries-3-times";

  switch (value) {
    case "run-all-queries":
      console.log("Running all queries...");
      const clusterName = await askForClusterName();
      const note = await askForNote();
      await runAllQueries(clusterName, note);
      break;
    case "run-all-queries-3-times":
      console.log("Running all queries 3 times...");
      const clusterName0 = args[0] || "";
      if (!clusterName0) {
        console.error(
          "Please provide a cluster name: yarn start <cluster-name>"
        );
        return;
      }
      for (let i = 0; i < 3; i++) {
        const campaignId = `phase5_official_${clusterName0}_run_${i + 1}`;
        await runAllQueries(clusterName0, `Run ${i + 1}/3 times`, campaignId);
      }
      break;
    case "run-queries-by-patterns":
      console.log("Running queries by patterns...");
      const queryPatterns = await askForQueryPatterns();
      console.log(queryPatterns);
      const clusterName2 = await askForClusterName();
      const note2 = await askForNote();
      await runQueriesByPatterns(clusterName2, queryPatterns, note2);
      break;
    case "run-selected-queries-in-pattern":
      console.log("Running selected queries in pattern...");
      const queryPatterns2 = await askForQueryPatterns();
      const queryAliases: string[] = [];
      for (const pattern of queryPatterns2) {
        const aliases = await askForQueriesInPattern(pattern);
        queryAliases.push(...aliases);
      }
      const clusterName3 = await askForClusterName();
      const note3 = await askForNote();
      await runQueriesByQueryAliases(clusterName3, queryAliases, note3);
      break;
    case "test-connection-to-all-cluster":
      console.log("Testing connection to all cluster...");
      const alias = ["Q1_1"];
      const clusterNames = getClusterNames();
      for (const clusterName of clusterNames) {
        await runQueriesByQueryAliases(clusterName, alias, "Test connection");
      }
      break;
    case "test-query-plan-for-all-query-patterns":
      const samples = [
        "Q1_",
        "Q2_",
        "Q3_",
        "Q4_",
        "Q5_",
        "Q6_",
        "Q7_",
        "Q8_",
        "Q9_",
        "Q10_",
      ];

      const NUMBER_TEST = 3;
      const aliases = [];
      for (const sample of samples) {
        for (let i = 1; i <= NUMBER_TEST; i++) {
          aliases.push(`${sample}${i}`);
        }
      }

      const clusterName4 = await askForClusterName();
      await runQueriesByQueryAliases(clusterName4, aliases, "Test query plan");
      break;
  }
};

const main = async () => {
  await showMenu();
};

main();
