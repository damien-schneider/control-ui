import { EnvironmentVariables } from "@/components/control-ui/environment-variables";

type EnvironmentValues = Record<string, string>;

export function Example({
  initialValues,
  save,
}: {
  initialValues: EnvironmentValues;
  save: (values: EnvironmentValues) => void | Promise<void>;
}) {
  const initialRows = Object.entries(initialValues).map(([key, value]) => ({ key, value }));

  return <EnvironmentVariables initialRows={initialRows} onSubmit={({ variables }) => save(variables)} />;
}
