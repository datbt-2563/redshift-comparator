export enum ParamType {
  STRING = "STRING",
  NUMBER = "NUMBER",
}

export type ParamName = string;

export interface SQLTemplate {
  name: string;
  template: string;
  templateParams: Record<ParamName, ParamType>;
}

export const sqlTemplates: SQLTemplate[] = [
  {
    name: "Get organization details",
    template:
      "SELECT * FROM organization WHERE organization_id = {{organization_id}};",
    templateParams: {
      organization_id: ParamType.STRING,
    },
  },
];
