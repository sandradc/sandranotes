import { useQuery } from "convex/react";
import { Link } from "react-router";
import { api } from "../../convex/_generated/api";

const formatDate = (ts: number) =>
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ts));

export default function Home() {
  const posts = useQuery(api.posts.list);

  if (posts === undefined) return null;

  if (posts.length === 0) {
    return <p className="empty">Nothing here yet.</p>;
  }

  return (
    <ul className="post-list">
      {posts.map((post) => (
        <li key={post._id} className="post-item">
          <Link to={`/${post.slug}`}>
            <span className="post-item-title">{post.title}</span>
            <span className="post-item-date">{formatDate(post.publishedAt)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
