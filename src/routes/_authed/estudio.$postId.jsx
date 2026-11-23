import { createFileRoute } from "@tanstack/react-router";
import PostEditor from "@/components/studio/PostEditor";

export const Route = createFileRoute("/_authed/estudio/$postId")({
  head: () => ({ meta: [{ title: "Editor de publicação · AffiliateFlow" }] }),
  component: EstudioEditorRoute,
});

function EstudioEditorRoute() {
  const { postId } = Route.useParams();
  return <PostEditor postId={postId} />;
}