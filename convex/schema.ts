import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    body: v.string(),
    author: v.string(),
    publishedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published", ["publishedAt"]),
});
