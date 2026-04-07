import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published")
      .order("desc")
      .collect();
    return posts.map(({ _id, title, slug, author, publishedAt }) => ({
      _id,
      title,
      slug,
      author,
      publishedAt,
    }));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const get = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

async function checkPassword(ctx: { db: any }, password: string) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret || password !== secret) {
    throw new Error("Unauthorized");
  }
}

export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    body: v.string(),
    author: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    await checkPassword(ctx, args.password);
    const { password: _, ...post } = args;
    return await ctx.db.insert("posts", {
      ...post,
      publishedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    body: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    await checkPassword(ctx, args.password);
    const { id, password: _, ...fields } = args;
    const patch = Object.fromEntries(
      Object.entries(fields).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, patch);
  },
});

export const remove = mutation({
  args: {
    id: v.id("posts"),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    await checkPassword(ctx, args.password);
    await ctx.db.delete(args.id);
  },
});
