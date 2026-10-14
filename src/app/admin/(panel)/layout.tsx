import { AdminShell } from "../_components/AdminShell";

export default function PanelLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminShell>{children}</AdminShell>;
}
