import prompts from "prompts";

const showMenu = async () => {
  const choices = [
    {
      title: "Execute test case",
      value: "execute-test-case",
    },
    {
      title: "Analyze test results",
      value: "analyze-test-results",
    },
    {
      title: "Build SQL query",
      value: "build-query",
    },
    {
      title: "Build test case",
      value: "build-test-case",
    },
    {
      title: "Exit",
      value: "exit",
    },
  ];
  const response = await prompts({
    type: "select",
    name: "value",
    message: "What do you want to do?",
    choices,
  });

  const { value } = response;

  switch (value) {
    case "build-query":
      console.log("Building SQL query...");
      break;
    case "build-test-case":
      console.log("Building test case...");
      break;
    case "execute-test-case":
      console.log("Executing test case...");
      break;
    case "analyze-test-results":
      console.log("Analyzing test results...");
      break;
  }
};

const main = async () => {
  await showMenu();
};

main();
