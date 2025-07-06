import { z } from 'zod';
import NewsAPI from 'newsapi';

// Define the input schema shape for the Everything tool
const everythingInputSchemaShape = {
  q: z.string().min(1).describe('Keywords or phrases to search for in the article title and body.'),
  sources: z
    .string()
    .optional()
    .describe('A comma-separated string of identifiers for the news sources or blogs you want headlines from.'),
  domains: z
    .string()
    .optional()
    .describe('A comma-separated string of domains (e.g. bbc.co.uk, techcrunch.com) to search within.'),
  excludeDomains: z
    .string()
    .optional()
    .describe('A comma-separated string of domains (e.g. bbc.co.uk, techcrunch.com) to exclude from the search.'),
  from: z
    .string()
    .optional()
    .describe(
      'A date and optional time for the oldest article allowed. Format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS (e.g. 2024-01-01 or 2024-01-01T10:00:00).'
    ),
  to: z
    .string()
    .optional()
    .describe('A date and optional time for the newest article allowed. Format: YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.'),
  language: z
    .string()
    .optional()
    .describe(
      'The 2-letter ISO 639-1 code of the language you want to get headlines for. Possible options: ar, de, en, es, fr, he, it, nl, no, pt, ru, sv, ud, zh. Default: all languages returned.'
    ),
  sortBy: z
    .enum(['relevancy', 'popularity', 'publishedAt'])
    .optional()
    .describe(
      'The order to sort the articles in. Possible options: relevancy, popularity, publishedAt. Default: relevancy.'
    ),
  pageSize: z
    .number()
    .int()
    .positive()
    .max(100)
    .optional()
    .default(100)
    .describe('The number of results to return per page (request). 20 is the default, 100 is the maximum.'),
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .default(1)
    .describe('Use this to page through the results if the total results found is greater than the pageSize.'),
};

type RawSchemaShape = typeof everythingInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
// Define the expected output structure based on News API documentation
type Output = {
  status: string;
  totalResults: number;
  articles: Array<{
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
  }>;
};

// Define the handler function for the Everything tool
const everythingHandler = async (input: Input): Promise<Output> => {
  try {
    const apiKey = process.env.NEWSAPI_KEY;
    if (!apiKey) {
      throw new Error('NEWSAPI_KEY environment variable is not set.');
    }

    const newsapi = new NewsAPI(apiKey);

    // Prepare parameters for the News API SDK call
    const params = {
      q: input.q,
      sources: input.sources,
      domains: input.domains,
      excludeDomains: input.excludeDomains,
      from: input.from,
      to: input.to,
      language: input.language,
      sortBy: input.sortBy,
      pageSize: input.pageSize,
      page: input.page,
    };

    // Call the News API SDK's everything endpoint
    const response = await newsapi.v2.everything(params);

    // The SDK returns the response directly, which matches our Output type
    return response as Output;
  } catch (error: unknown) {
    console.error('News API Everything tool error:', error);
    let errorMessage = 'An unknown error occurred while fetching news.';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Re-throwing the error to be handled by the MCP server framework
    throw new Error(`News API Everything tool failed: ${errorMessage}`);
  }
};

// Define the tool definition object structure
type NewsApiToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input) => Promise<Output>;
};

// Export the tool definition for Everything
export const everythingTool: NewsApiToolDefinition = {
  name: 'search_articles',
  description: 'Searches for news articles using the News API "Everything" endpoint.',
  inputSchemaShape: everythingInputSchemaShape,
  handler: everythingHandler,
};
