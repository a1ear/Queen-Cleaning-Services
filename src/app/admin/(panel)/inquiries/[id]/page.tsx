import { InquiryDetail } from "../../../_components/InquiryDetail";

export default async function InquiryPage({ params }: PageProps<"/admin/inquiries/[id]">) {
  const { id } = await params;
  return <InquiryDetail id={id} />;
}
