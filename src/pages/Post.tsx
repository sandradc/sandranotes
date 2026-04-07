import { useQuery } from "convex/react";
import { useParams, Link } from "react-router";
import { api } from "../../convex/_generated/api";

const formatDate = (ts: number) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ts));

export default function Post() {
  const { slug } = useParams<{ slug: string }>();
  const post = useQuery(api.posts.getBySlug, slug ? { slug } : "skip");

  if (post === undefined) return null;

  if (post === null) {
    return (
      <div>
        <Link to="/" className="back-link">← Back</Link>
        <p className="empty">Essay not found.</p>
      </div>
    );
  }

  return (
    <article>
      <Link to="/" className="back-link">← Back</Link>
      <h1 className="post-title">{post.title}</h1>
      <p className="post-meta">
        {formatDate(post.publishedAt)} · {post.author}
      </p>
      <div className="post-body">
        {post.body.split("\n\n").map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
