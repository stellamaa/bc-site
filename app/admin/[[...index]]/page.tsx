import Studio from "./Studio";

export function generateStaticParams() {
  return [{ index: [] as string[] }];
}

export default function AdminPage() {
  return <Studio />;
}
