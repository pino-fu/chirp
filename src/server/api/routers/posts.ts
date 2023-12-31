import { clerkClient } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/dist/types/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc";


const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profilePicture: user.imageUrl
  };
};

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }]
    });

    const users = (
      await clerkClient.users.getUserList({
        userId: posts.map((post) => post.authorId), 
        limit: 100
      })
    ).map(filterUserForClient);

    return posts.map((post) => {
      const author = users.find((user) => user.id === post.authorId);
// use optional  chaining to avoid errors when checking for author and author.username, then threw a TRPCError if the author or author.username was not found
      if (!author?.username) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Author not found"
        });
      }

      return {
        post,
        author: {
          ...author, 
          username: author.username,
        },
      };
    });
  }),
  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji().min(1).max(280)}))
      .mutation(async ({ ctx, input }) => {

      const authorId = ctx.userId;

      const post = await ctx.db.post.create({
        data: {
          authorId,
          content: input.content,
      },
    });
    return post;
  }),
});