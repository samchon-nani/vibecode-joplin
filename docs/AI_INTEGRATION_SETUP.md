# AI Integration Setup Guide

## Overview

This guide explains how to replace the current rule-based query parser with a real AI-powered natural language processing system. Currently, the `parseAIQuery` function in `app/api/ai-search/route.ts` uses keyword matching and regex patterns. This document outlines how to integrate an actual AI service (OpenAI, Anthropic, or Google Gemini) for more accurate and flexible query understanding.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Choosing an AI Service](#choosing-an-ai-service)
3. [Installation Steps](#installation-steps)
4. [Environment Configuration](#environment-configuration)
5. [Implementation Steps](#implementation-steps)
6. [Testing](#testing)
7. [Cost Optimization](#cost-optimization)
8. [Fallback Strategy](#fallback-strategy)

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- API key for chosen AI service
- Understanding of Next.js API routes

## Choosing an AI Service

### Option 1: OpenAI (Recommended)
- **Model**: GPT-3.5-turbo or GPT-4
- **Pros**: Most mature, excellent documentation, reliable
- **Cons**: Requires API key, usage costs
- **Cost**: ~$0.001-0.002 per query (GPT-3.5-turbo)
- **SDK**: `openai` package

### Option 2: Anthropic Claude
- **Model**: Claude 3 Haiku or Claude 3 Sonnet
- **Pros**: Excellent at structured output, competitive pricing
- **Cons**: Newer API, less documentation
- **Cost**: ~$0.00025-0.003 per query
- **SDK**: `@anthropic-ai/sdk` package

### Option 3: Google Gemini
- **Model**: Gemini Pro
- **Pros**: Free tier available, good performance
- **Cons**: Less mature, API changes more frequently
- **Cost**: Free tier available, then pay-as-you-go
- **SDK**: `@google/generative-ai` package

**Recommendation**: Start with OpenAI GPT-3.5-turbo for reliability and cost-effectiveness.

## Installation Steps

### Step 1: Install AI SDK

For OpenAI:
```bash
npm install openai
```

For Anthropic:
```bash
npm install @anthropic-ai/sdk
```

For Google Gemini:
```bash
npm install @google/generative-ai
```

### Step 2: Install Type Definitions (if needed)

```bash
npm install --save-dev @types/node
```

## Environment Configuration

### Step 1: Create `.env.local` file

Create a `.env.local` file in the root directory (if it doesn't exist):

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo

# OR for Anthropic
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# ANTHROPIC_MODEL=claude-3-haiku-20240307

# OR for Google Gemini
# GOOGLE_AI_API_KEY=your_google_api_key_here
# GOOGLE_MODEL=gemini-pro

# Feature Flag (optional - to toggle between AI and rule-based)
USE_AI_PARSER=true
```

### Step 2: Update `.env.example`

Add the environment variables to `.env.example` for documentation:

```env
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
USE_AI_PARSER=true
```

### Step 3: Get API Key

1. **OpenAI**: Sign up at https://platform.openai.com/api-keys
2. **Anthropic**: Sign up at https://console.anthropic.com/
3. **Google**: Get API key from https://makersuite.google.com/app/apikey

## Implementation Steps

### Step 1: Create AI Parser Function

Create a new function `parseAIQueryWithLLM()` in `app/api/ai-search/route.ts`:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface ParsedQuery {
  procedures: string[];
  insurance: string;
  insurancePlan?: string;
  location: string;
  maxDistance: number;
  explicitlyNoInsurance: boolean;
}

async function parseAIQueryWithLLM(query: string): Promise<ParsedQuery> {
  const systemPrompt = `You are a medical billing assistant that extracts structured information from natural language queries about healthcare procedures.

Extract the following information from user queries:
1. Medical procedures (names, CPT codes, or synonyms)
2. Insurance provider and plan (if mentioned)
3. Location (zip code or city, state)
4. Distance/radius preference (in miles)
5. Whether user explicitly said "no insurance" or "cash only"

Return a JSON object with this structure:
{
  "procedures": ["MRI", "CT Scan"],
  "insurance": "bluecross" or "",
  "insurancePlan": "premium" or undefined,
  "location": "90210" or "Beverly Hills, CA",
  "maxDistance": 50,
  "explicitlyNoInsurance": false
}

Common procedure names and synonyms:
- MRI: magnetic resonance imaging, MRI scan
- CT Scan: CAT scan, computed tomography, CT scan
- X-Ray: xray, x-ray, radiograph
- Ultrasound: sonogram, ultrasound scan
- Blood Test: lab test, CBC, complete blood count

Common insurance providers:
- BlueCross, Blue Cross, BCBS
- Aetna
- Cigna
- UnitedHealthcare, United Healthcare
- Humana
- Kaiser, Kaiser Permanente
- Medicare
- Medicaid

If information is missing or unclear, use empty strings or defaults:
- procedures: [] (empty if none found)
- insurance: "" (empty if not mentioned)
- location: "" (empty if not found)
- maxDistance: 100 (default)
- explicitlyNoInsurance: false (unless explicitly stated)`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for consistent, structured output
      max_tokens: 500,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(responseContent) as ParsedQuery;
    
    // Validate and sanitize the response
    return {
      procedures: Array.isArray(parsed.procedures) ? parsed.procedures : [],
      insurance: typeof parsed.insurance === 'string' ? parsed.insurance : '',
      insurancePlan: parsed.insurancePlan || undefined,
      location: typeof parsed.location === 'string' ? parsed.location : '',
      maxDistance: typeof parsed.maxDistance === 'number' 
        ? Math.min(500, Math.max(1, parsed.maxDistance)) 
        : 100,
      explicitlyNoInsurance: typeof parsed.explicitlyNoInsurance === 'boolean' 
        ? parsed.explicitlyNoInsurance 
        : false,
    };
  } catch (error) {
    console.error('AI parsing error:', error);
    throw error;
  }
}
```

### Step 2: Update the POST Handler

Modify the `POST` function in `app/api/ai-search/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aiQuery, userProfile } = body;

    if (!aiQuery || typeof aiQuery !== 'string' || !aiQuery.trim()) {
      return NextResponse.json(
        { error: 'AI query is required' },
        { status: 400 }
      );
    }

    let parsed;
    
    // Use AI parser if enabled, otherwise fall back to rule-based
    const useAI = process.env.USE_AI_PARSER === 'true' && process.env.OPENAI_API_KEY;
    
    if (useAI) {
      try {
        parsed = await parseAIQueryWithLLM(aiQuery);
      } catch (error) {
        console.error('AI parsing failed, falling back to rule-based:', error);
        // Fall back to existing rule-based parser
        parsed = parseAIQuery(aiQuery);
      }
    } else {
      // Use existing rule-based parser
      parsed = parseAIQuery(aiQuery);
    }

    // Rest of the existing logic remains the same...
    // (insurance handling, location parsing, hospital search, etc.)
  } catch (error) {
    // Error handling...
  }
}
```

### Step 3: Map AI Response to Procedure IDs

The AI will return procedure names (like "MRI", "CT Scan"), but you need to map them to your procedure IDs from `procedures.json`. Add a mapping function:

```typescript
function mapProcedureNamesToIds(procedureNames: string[]): string[] {
  const procedures = proceduresData as any[];
  const procedureIdMap: Record<string, string> = {};
  
  // Build a map of procedure names to IDs
  procedures.forEach(proc => {
    procedureIdMap[proc.name.toLowerCase()] = proc.id;
    procedureIdMap[proc.id.toLowerCase()] = proc.id;
  });
  
  return procedureNames
    .map(name => procedureIdMap[name.toLowerCase()])
    .filter(id => id !== undefined);
}
```

Then use it in the parsed result:
```typescript
parsed.procedures = mapProcedureNamesToIds(parsed.procedures);
```

## Testing

### Test Cases

Create test queries to verify the AI integration:

1. **Simple query**: "I need an MRI in Beverly Hills, CA"
2. **Multiple procedures**: "I need an MRI and CT scan with Blue Cross insurance in 90210"
3. **With distance**: "Find me an X-Ray within 25 miles of Los Angeles, CA"
4. **No insurance**: "I need a blood test, paying cash, in New York, NY"
5. **Complex query**: "How much would an MRI and ultrasound cost with Aetna Premium plan in zip code 10001 within 50 miles?"
6. **CPT codes**: "I need procedure 70551 and 71250 with Cigna in Chicago, IL"

### Testing Script

Create a test file `test-ai-parser.ts`:

```typescript
import { parseAIQueryWithLLM } from './app/api/ai-search/route';

async function test() {
  const queries = [
    "I need an MRI in Beverly Hills, CA",
    "Find me an MRI and CT scan with Blue Cross insurance in 90210",
    "I need a blood test, paying cash, in New York, NY",
  ];

  for (const query of queries) {
    console.log(`\nQuery: ${query}`);
    const result = await parseAIQueryWithLLM(query);
    console.log('Result:', JSON.stringify(result, null, 2));
  }
}

test();
```

Run with: `npx ts-node test-ai-parser.ts`

## Cost Optimization

### Strategies

1. **Use GPT-3.5-turbo instead of GPT-4**: 10x cheaper with similar performance for structured tasks
2. **Set token limits**: Use `max_tokens: 500` to limit response size
3. **Cache common queries**: Cache results for frequently asked queries
4. **Batch processing**: If processing multiple queries, batch them
5. **Monitor usage**: Set up usage alerts in your AI provider dashboard

### Estimated Costs

- **GPT-3.5-turbo**: ~$0.001-0.002 per query
- **10,000 queries/month**: ~$10-20/month
- **100,000 queries/month**: ~$100-200/month

## Fallback Strategy

Always implement a fallback to the rule-based parser:

1. **If AI service is unavailable**: Fall back to `parseAIQuery()`
2. **If API key is missing**: Use rule-based parser
3. **If AI returns invalid data**: Validate and fall back if needed
4. **If rate limits hit**: Fall back temporarily

Example implementation:

```typescript
let parsed;
try {
  if (process.env.USE_AI_PARSER === 'true' && process.env.OPENAI_API_KEY) {
    parsed = await parseAIQueryWithLLM(aiQuery);
  } else {
    parsed = parseAIQuery(aiQuery);
  }
} catch (error) {
  console.error('AI parsing failed:', error);
  parsed = parseAIQuery(aiQuery); // Fallback
}
```

## Next Steps

1. Implement the AI parser function
2. Test with various query types
3. Monitor costs and performance
4. Iterate on the prompt for better accuracy
5. Add logging to track AI vs. rule-based usage
6. Consider adding conversation context for follow-up queries

## Troubleshooting

### Common Issues

1. **"API key not found"**: Check `.env.local` file exists and has correct key
2. **"Invalid JSON response"**: Add better error handling and validation
3. **"Rate limit exceeded"**: Implement retry logic with exponential backoff
4. **"High costs"**: Review token usage, consider caching, use cheaper model

### Debugging

Enable detailed logging:

```typescript
console.log('AI Query:', query);
console.log('AI Response:', responseContent);
console.log('Parsed Result:', parsed);
```

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

