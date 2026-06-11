export type DataSourceKind = "api" | "simulated" | "derived" | "static";

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
  simulated: {
    kind: "simulated",
    label: "SIM",
    description: "Generated in the frontend until a backend endpoint exists.",
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

