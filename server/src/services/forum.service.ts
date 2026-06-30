import { prisma } from '../config/database.js';
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
  SearchQuery,
} from '../types/index.js';

// ============================================================================
// Forum Service — Questions, Answers & Voting
// ============================================================================

// --------------------------------------------------------------------------
// Questions
// --------------------------------------------------------------------------

/**
 * Create a new forum question.
 * @returns The created question with author info.
 */
export async function createQuestion(
  userId: string,
  data: { title: string; content: string }
) {
  if (!data.title?.trim() || !data.content?.trim()) {
    throw new ValidationError('Title and content are required');
  }

  const question = await prisma.forumQuestion.create({
    data: {
      title: data.title.trim(),
      content: data.content.trim(),
      userId,
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });

  return question;
}

/**
 * Get a paginated list of questions, optionally filtered by search term.
 * Search matches against title or content. Results ordered newest-first.
 */
export async function getQuestions(query: SearchQuery) {
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(Math.max(query.limit ?? 10, 1), 100);
  const skip = (page - 1) * limit;

  const where = query.search
    ? {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' as const } },
          { content: { contains: query.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [questions, total] = await Promise.all([
    prisma.forumQuestion.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, avatarUrl: true },
        },
        _count: {
          select: { answers: true },
        },
      },
    }),
    prisma.forumQuestion.count({ where }),
  ]);

  return {
    data: questions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get a single question by ID with author info, all answers
 * (including each answer's author and aggregated vote score),
 * and total answer count.
 * @throws NotFoundError if question does not exist.
 */
export async function getQuestionById(questionId: string) {
  const question = await prisma.forumQuestion.findUnique({
    where: { id: questionId },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
      answers: {
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { id: true, username: true, avatarUrl: true },
          },
          votes: true,
        },
      },
      _count: {
        select: { answers: true },
      },
    },
  });

  if (!question) {
    throw new NotFoundError('Question');
  }

  // Calculate vote score for each answer
  const answersWithScores = question.answers.map((answer) => {
    const voteScore = answer.votes.reduce((sum, vote) => sum + vote.value, 0);
    const { votes, ...answerWithoutVotes } = answer;
    return { ...answerWithoutVotes, voteScore };
  });

  return {
    ...question,
    answers: answersWithScores,
  };
}

/**
 * Delete a forum question. Only the author may delete their own question.
 * @throws NotFoundError if question does not exist.
 * @throws ForbiddenError if userId does not match the question author.
 */
export async function deleteQuestion(questionId: string, userId: string) {
  const question = await prisma.forumQuestion.findUnique({
    where: { id: questionId },
    select: { userId: true },
  });

  if (!question) {
    throw new NotFoundError('Question');
  }

  if (question.userId !== userId) {
    throw new ForbiddenError('You can only delete your own questions');
  }

  await prisma.forumQuestion.delete({ where: { id: questionId } });
}

// --------------------------------------------------------------------------
// Answers
// --------------------------------------------------------------------------

/**
 * Create an answer on a given question.
 * @throws NotFoundError if the question does not exist.
 * @returns The created answer with author info.
 */
export async function createAnswer(
  questionId: string,
  userId: string,
  data: { content: string; isAiGenerated?: boolean }
) {
  if (!data.content?.trim()) {
    throw new ValidationError('Answer content is required');
  }

  // Verify the question exists
  const question = await prisma.forumQuestion.findUnique({
    where: { id: questionId },
    select: { id: true },
  });

  if (!question) {
    throw new NotFoundError('Question');
  }

  const answer = await prisma.forumAnswer.create({
    data: {
      content: data.content.trim(),
      questionId,
      userId,
      isAiGenerated: data.isAiGenerated || false,
    },
    include: {
      user: {
        select: { id: true, username: true, avatarUrl: true },
      },
    },
  });

  return answer;
}

/**
 * Delete a forum answer. Only the author may delete their own answer.
 * @throws NotFoundError if the answer does not exist.
 * @throws ForbiddenError if userId does not match the answer author.
 */
export async function deleteAnswer(answerId: string, userId: string) {
  const answer = await prisma.forumAnswer.findUnique({
    where: { id: answerId },
    select: { userId: true },
  });

  if (!answer) {
    throw new NotFoundError('Answer');
  }

  if (answer.userId !== userId) {
    throw new ForbiddenError('You can only delete your own answers');
  }

  await prisma.forumAnswer.delete({ where: { id: answerId } });
}

// --------------------------------------------------------------------------
// Voting
// --------------------------------------------------------------------------

/**
 * Upsert a vote on an answer.
 * - If the user has not voted yet, create a new vote.
 * - If the user already voted with a different value, update it.
 * - If the user already voted with the same value, remove the vote (toggle off).
 * @returns The updated total vote score for the answer.
 * @throws NotFoundError if the answer does not exist.
 * @throws ValidationError if value is not 1 or -1.
 */
export async function voteOnAnswer(
  answerId: string,
  userId: string,
  value: 1 | -1
) {
  if (value !== 1 && value !== -1) {
    throw new ValidationError('Vote value must be 1 or -1');
  }

  // Verify the answer exists
  const answer = await prisma.forumAnswer.findUnique({
    where: { id: answerId },
    select: { id: true },
  });

  if (!answer) {
    throw new NotFoundError('Answer');
  }

  // Check for an existing vote by this user on this answer
  const existingVote = await prisma.vote.findUnique({
    where: {
      userId_answerId: { userId, answerId },
    },
  });

  if (existingVote) {
    if (existingVote.value === value) {
      // Same value → toggle off (remove the vote)
      await prisma.vote.delete({ where: { id: existingVote.id } });
    } else {
      // Different value → update
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { value },
      });
    }
  } else {
    // No existing vote → create
    await prisma.vote.create({
      data: { value, userId, answerId },
    });
  }

  // Return the updated vote score
  return getAnswerVotes(answerId);
}

/**
 * Get the total vote score (sum of all vote values) for a given answer.
 */
export async function getAnswerVotes(answerId: string): Promise<number> {
  const result = await prisma.vote.aggregate({
    where: { answerId },
    _sum: { value: true },
  });

  return result._sum.value ?? 0;
}
