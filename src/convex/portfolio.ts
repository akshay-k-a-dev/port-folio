import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    // Since there's only one portfolio document, we can just get the first one.
    const portfolioData = await ctx.db.query("portfolio").first();
    return portfolioData;
  },
});
