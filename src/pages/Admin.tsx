import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const generateSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function Admin() {
  const [password, setPassword] = useState(
    () => sessionStorage.getItem("admin_pw") ?? ""
  );
  const [authenticated, setAuthenticated] = useState(
    () => !!sessionStorage.getItem("admin_pw")
  );

  const [editingId, setEditingId] = useState<Id<"posts"> | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const posts = useQuery(api.posts.list, authenticated ? {} : "skip");
  const editingPost = useQuery(
    api.posts.get,
    editingId ? { id: editingId } : "skip"
  );
  const createPost = useMutation(api.posts.create);
  const updatePost = useMutation(api.posts.update);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      sessionStorage.setItem("admin_pw", password.trim());
      setAuthenticated(true);
    }
  };

  const startEditing = (id: Id<"posts">, postTitle: string, postBody: string) => {
    setEditingId(id);
    setTitle(postTitle);
    setBody(postBody);
    setStatus("idle");
    setErrorMsg("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setStatus("idle");
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setStatus("saving");
    setErrorMsg("");

    try {
      if (editingId) {
        await updatePost({
          id: editingId,
          title: title.trim(),
          slug: generateSlug(title),
          body: body.trim(),
          password,
        });
      } else {
        await createPost({
          title: title.trim(),
          slug: generateSlug(title),
          body: body.trim(),
          author: "Sandra",
          password,
        });
      }
      setTitle("");
      setBody("");
      setEditingId(null);
      setStatus("done");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to save");
    }
  };

  if (!authenticated) {
    return (
      <form className="admin-gate" onSubmit={handleAuth}>
        <h2>Enter passphrase</h2>
        <div className="admin-field">
          <label>Passphrase</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>
        <button type="submit" className="admin-btn">
          Enter
        </button>
      </form>
    );
  }

  return (
    <div>
      {posts && posts.length > 0 && !editingId && (
        <div className="admin-posts">
          <h2>Essays</h2>
          <ul className="admin-post-list">
            {posts.map((post) => (
              <li key={post._id} className="admin-post-item">
                <span>{post.title}</span>
                <EditButton
                  postId={post._id}
                  onReady={(t, b) => startEditing(post._id, t, b)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit}>
        <h2>{editingId ? "Edit essay" : "New essay"}</h2>

        {editingId && (
          <button
            type="button"
            className="admin-btn-small"
            onClick={cancelEditing}
            style={{ marginBottom: "1.5rem" }}
          >
            Cancel
          </button>
        )}

        <div className="admin-field">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
          {title && (
            <span className="slug-preview">/{generateSlug(title)}</span>
          )}
        </div>

        <div className="admin-field">
          <label>Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write here..."
          />
        </div>

        <button
          type="submit"
          className="admin-btn"
          disabled={status === "saving" || !title.trim() || !body.trim()}
        >
          {status === "saving" ? "Saving..." : editingId ? "Update" : "Publish"}
        </button>

        {status === "error" && <p className="admin-error">{errorMsg}</p>}
        {status === "done" && <p className="admin-success">Saved.</p>}
      </form>
    </div>
  );
}

function EditButton({
  postId,
  onReady,
}: {
  postId: Id<"posts">;
  onReady: (title: string, body: string) => void;
}) {
  const post = useQuery(api.posts.get, { id: postId });

  return (
    <button
      type="button"
      className="admin-btn-small"
      disabled={!post}
      onClick={() => post && onReady(post.title, post.body)}
    >
      Edit
    </button>
  );
}
