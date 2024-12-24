import prompts from "prompts";
import {
  runAllQueries,
  runQueriesByPatterns,
  runQueriesByQueryAliases,
} from "src/test-runner";
import {
  askForNote,
  askForQueriesInPattern,
  askForQueryPatterns,
} from "src/test-runner/prompt";

const showMenu = async () => {
  const choices = [
    {
      title: "Run All Queries",
      value: "run-all-queries",
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
      title: "Exit",
      value: "exit",
    },
  ];
  const response = await prompts({
    type: "select",
    name: "value",
    message: "Choose an action",
    choices,
  });

  const { value } = response;

  switch (value) {
    case "run-all-queries":
      console.log("Running all queries...");
      const note = await askForNote();
      await runAllQueries(note);
      break;
    case "run-queries-by-patterns":
      console.log("Running queries by patterns...");
      const queryPatterns = await askForQueryPatterns();
      console.log(queryPatterns);
      const note2 = await askForNote();
      await runQueriesByPatterns(queryPatterns, note2);
      break;
    case "run-selected-queries-in-pattern":
      console.log("Running selected queries in pattern...");
      const queryPatterns2 = await askForQueryPatterns();
      const queryAliases: string[] = [];
      for (const pattern of queryPatterns2) {
        const aliases = await askForQueriesInPattern(pattern);
        queryAliases.push(...aliases);
      }
      const note3 = await askForNote();
      await runQueriesByQueryAliases(queryAliases, note3);
      break;
  }
};

const main = async () => {
  await showMenu();
};

main();
