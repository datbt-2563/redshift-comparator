export interface SQLQuery {
  name: string;
  query: string;
  templateName?: string;
  parameterName?: string;
}

export const sqlQueries: SQLQuery[] = [
  {
    name: "Get all users",
    query: "SELECT * FROM users",
    templateName: "user",
    parameterName: "userId",
  },
  {
    name: "Get all products",
    query: "SELECT * FROM products",
    templateName: "product",
    parameterName: "productId",
  },
  {
    name: "Get 10 first org",
    query: "SELECT * FROM org LIMIT 10",
  },
  {
    name: "Get 20 first org",
    query: "SELECT * FROM org LIMIT 20",
  },
  {
    name: "Get 30 first org",
    query: "SELECT * FROM org LIMIT 20",
  },
  {
    name: "Get 50 first org",
    query: "SELECT * FROM org LIMIT 20",
  },
  {
    name: "Get 100 first org",
    query: "SELECT * FROM org LIMIT 100",
  },
];

export const getSQLQuery = (queryName: string): SQLQuery => {
  return sqlQueries.find((query) => query.name === queryName);
};
