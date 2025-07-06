import { z } from 'zod';
import NewsAPI from 'newsapi';

// Define the input schema shape for the Top Headlines tool
const topHeadlinesInputSchemaShape = {
  q: z.string().optional().describe('Keywords or phrases to search for in the article title and body.'),
  sources: z
    .string()
    .optional()
    .describe('A comma-separated string of identifiers for the news sources or blogs you want headlines from.'),
  category: z
    .enum(['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'])
    .optional()
    .describe(
      'The category you want to get headlines for. Possible options: business, entertainment, general, health, science, sports, technology.'
    ),
  language: z
    .string()
    .optional()
    .describe(
      'The 2-letter ISO 639-1 code of the language you want to get headlines for. Possible options: ar, de, en, es, fr, he, it, nl, no, pt, ru, sv, ud, zh. Default: all languages returned.'
    ),
  country: z
    .string()
    .optional()
    .describe(
      'The 2-letter ISO 3166-1 country code of the country you want to get headlines for. Possible options: ae, ar, at, au, be, bg, br, ca, ch, cn, co, cu, cz, de, eg, fr, gb, gr, hk, hu, id, ie, il, in, it, jp, kr, lt, lv, ma, mx, my, ng, nl, no, nz, ph, pl, pt, ro, rs, ru, sa, se, sg, si, sk, th, tr, tw, ua, us, ve, za. Default: all countries returned.'
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

type RawSchemaShape = typeof topHeadlinesInputSchemaShape;
type Input = z.infer<z.ZodObject<RawSchemaShape>>;
// Define the expected output structure based on News API documentation (same as Everything)
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

// Define the handler function for the Top Headlines tool
const topHeadlinesHandler = async (input: Input): Promise<Output> => {
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
      category: input.category,
      language: input.language,
      country: input.country,
      pageSize: input.pageSize,
      page: input.page,
    };

    // Call the News API SDK's topHeadlines endpoint
    const response = await newsapi.v2.topHeadlines(params);

    // The SDK returns the response directly, which matches our Output type
    return response as Output;
  } catch (error: unknown) {
    console.error('News API Top Headlines tool error:', error);
    let errorMessage = 'An unknown error occurred while fetching top headlines.';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Re-throwing the error to be handled by the MCP server framework
    throw new Error(`News API Top Headlines tool failed: ${errorMessage}`);
  }
};

// Define the tool definition object structure
type NewsApiToolDefinition = {
  name: string;
  description: string;
  inputSchemaShape: RawSchemaShape;
  handler: (input: Input) => Promise<Output>;
};

// Export the tool definition for Top Headlines
export const topHeadlinesTool: NewsApiToolDefinition = {
  name: 'get_top_headlines',
  description: 'Fetches top news headlines using the News API "Top Headlines" endpoint.',
  inputSchemaShape: topHeadlinesInputSchemaShape,
  handler: topHeadlinesHandler,
};
