# Redshift comparator

Tool to compare result and time execution of two queries in Redshift or 1 query in multiple Redshift clusters

## Description

### Modules

1. **Configuration** → Prepares input data such as queries, parameters and RedShift clusters.

2. **Test Runner** → Executes test cases.

3. **Storage** → Stores results and execution history.

4. **Result Analysis** → Analyzes and compares the results.

### Test case

A test case in the Redshift Comparator system evaluates the performance and accuracy of SQL execution on a target Redshift cluster. Each test case consists of input and output as below


| **Test Case Component**          | **Description**                                   |
|-------------------------|---------------------------------------------------|
| **Input**              |                                                   |
| - SQL Template         | Predefined query structure.                       |
| - Query Parameters     | Dynamic values inserted into the template.        |
| - Target Cluster       | The Redshift instance for execution.              |
| **Output**             |                                                   |
| - Result Set           | Data returned from the executed query.            |
| - Execution Time       | Time taken to execute the query.                  |


