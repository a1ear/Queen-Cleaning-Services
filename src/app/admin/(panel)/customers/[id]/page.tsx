import { CustomerDetail } from "../../../_components/CustomersView";

export default async function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  return <CustomerDetail id={id} />;
}
