export type DataSourceKind = "api" | "derived" | "static";

export interface DataSourceDescriptor {
  kind: DataSourceKind;
  label: string;
  description: string;
}

export const dataSources = {
  api: {
    kind: "api",
    label: "API",
    description: "Served by the Go backend API.",
  },
  derived: {
    kind: "derived",
    label: "DERIVED",
    description: "Calculated from API data in the frontend.",
  },
  static: {
    kind: "static",
    label: "STATIC",
    description: "Static product or configuration content.",
  },
} satisfies Record<DataSourceKind, DataSourceDescriptor>;
