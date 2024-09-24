import { ConvexError, v } from 'convex/values'
import { mutation } from './_generated/server'
import { getAuthUserId } from '@convex-dev/auth/server'
import { getMember } from './messages'

export const toggle = mutation({
  args: {
    messageId: v.id('messages'),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx)
    if (!userId) {
      throw new ConvexError('Unauthorized')
    }

    const message = await ctx.db.get(args.messageId)
    if (!message) {
      throw new ConvexError('Message not found')
    }

    const member = await getMember(ctx, message.workspaceId, userId)
    if (!member) {
      throw new ConvexError('Unauthorized')
    }

    const existingMessageReactionFromUser = await ctx.db
      .query('reactions')
      .filter((q) =>
        q.and(
          q.eq(q.field('messageId'), args.messageId),
          q.eq(q.field('memberId'), member._id),
          q.eq(q.field('value'), args.value),
        ),
      )
      .first()

    if (existingMessageReactionFromUser) {
      await ctx.db.delete(existingMessageReactionFromUser._id)
      return existingMessageReactionFromUser._id
    } else {
      const reactionId = await ctx.db.insert('reactions', {
        messageId: message._id,
        memberId: member._id,
        value: args.value,
        workspaceId: message.workspaceId,
      })
      return reactionId
    }
  },
})
