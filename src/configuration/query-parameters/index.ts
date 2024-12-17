export interface QueryParameter {
  name: string;
  values: Record<string, string | number>;
}

export const queryParameters: QueryParameter[] = [
  {
    name: "Org 1",
    values: {
      organization_id: "org-1",
    },
  },
];
