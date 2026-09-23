import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { leadService } from './lead.service';
import { bookingService } from './booking.service';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * OpenAI Function Calling tool definitions.
 * These allow the LLM to trigger CRM actions mid-conversation.
 */
const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'save_lead',
      description:
        'Extract and save lead details to the CRM when the user expresses interest in a product, service, or pricing. Call this whenever a potential customer shares contact info or buying intent.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'A short title summarizing the lead (e.g., "Interested in Enterprise Plan")',
          },
          name: { type: 'string', description: "The lead's full name" },
          email: { type: 'string', description: "The lead's email address" },
          phone: { type: 'string', description: "The lead's phone number" },
          company: { type: 'string', description: "The lead's company or organization" },
          requirement: { type: 'string', description: 'What the lead is looking for' },
          budget: { type: 'string', description: "The lead's budget range if mentioned" },
          timeline: { type: 'string', description: 'When they need the solution' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high', 'urgent'],
            description: 'Priority based on buying signals',
          },
        },
        required: ['title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'book_appointment',
      description:
        'Book an appointment or meeting for the user. Call this when the user wants to schedule a demo, consultation, meeting, or callback.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Title of the appointment (e.g., "Product Demo with Acme Corp")',
          },
          description: { type: 'string', description: 'Details about the appointment' },
          scheduledAt: {
            type: 'string',
            format: 'date-time',
            description: 'The appointment date/time in ISO 8601 format',
          },
          duration: {
            type: 'number',
            description: 'Duration in minutes (default 30)',
          },
          timezone: {
            type: 'string',
            description: 'Timezone (e.g., "Asia/Kolkata", "America/New_York")',
          },
          attendeeName: { type: 'string', description: 'Name of the attendee' },
          attendeeEmail: { type: 'string', description: 'Email of the attendee' },
          attendeePhone: { type: 'string', description: 'Phone of the attendee' },
        },
        required: ['title', 'scheduledAt'],
      },
    },
  },
];

interface ContextInfo {
  tenantId: string;
  conversationId: string;
  contactId: string;
  agentConfigId: string;
}

interface ToolExecutionResult {
  toolCallId: string;
  name: string;
  result: Record<string, unknown>;
  success: boolean;
}

export class LlmService {
  /**
   * Process an incoming user message through the LLM with tool-calling support.
   * Implements the full OpenAI tool-call loop:
   *   1. Send messages + tools to the LLM
   *   2. If tool_calls are returned, execute them
   *   3. Re-prompt the LLM with tool results for a natural language response
   *   4. Return the final assistant message
   */
  async processMessage(
    agentConfig: any,
    conversationHistory: any[],
    userMessage: string,
    contextInfo: ContextInfo
  ): Promise<{ content: string; toolResults: ToolExecutionResult[] }> {
    const systemPrompt = this.buildSystemPrompt(agentConfig);
    const toolResults: ToolExecutionResult[] = [];

    // Build the messages array from conversation history
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 20 messages for context window management)
    const recentHistory = conversationHistory.slice(-20);
    for (const msg of recentHistory) {
      if (msg.role === 'user' || msg.sender === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant' || msg.sender === 'assistant') {
        messages.push({ role: 'assistant', content: msg.content });
      }
    }

    // Add the new user message
    messages.push({ role: 'user', content: userMessage });

    const startTime = Date.now();

    try {
      // First LLM call
      const response = await openai.chat.completions.create({
        model: agentConfig?.llmConfig?.model || agentConfig?.model || 'gpt-4o',
        messages,
        tools,
        tool_choice: 'auto',
        temperature: agentConfig?.llmConfig?.temperature ?? 0.7,
        max_tokens: agentConfig?.llmConfig?.maxTokens ?? 1024,
      });

      const choice = response.choices[0];
      const latencyMs = Date.now() - startTime;

      console.log(`[LLM] First call completed in ${latencyMs}ms, finish_reason: ${choice.finish_reason}`);

      // If the model wants to call tools
      if (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
        console.log(`[LLM] Tool calls requested: ${choice.message.tool_calls.map(tc => tc.function.name).join(', ')}`);

        // Add the assistant's tool-call message to the conversation
        messages.push(choice.message);

        // Execute each tool call and collect results
        for (const toolCall of choice.message.tool_calls) {
          const result = await this.executeTool(contextInfo, toolCall);
          toolResults.push(result);

          // Add the tool result as a message for re-prompting
          messages.push({
            role: 'tool',
            tool_call_id: toolCall.id,
            content: JSON.stringify(result.result),
          });
        }

        // Re-prompt the LLM with tool results so it can craft a natural response
        const followUpResponse = await openai.chat.completions.create({
          model: agentConfig?.llmConfig?.model || agentConfig?.model || 'gpt-4o',
          messages,
          temperature: agentConfig?.llmConfig?.temperature ?? 0.7,
          max_tokens: agentConfig?.llmConfig?.maxTokens ?? 1024,
        });

        const followUpLatency = Date.now() - startTime;
        console.log(`[LLM] Follow-up call completed in ${followUpLatency - latencyMs}ms`);

        const finalContent = followUpResponse.choices[0].message.content || 'I have processed your request.';

        return { content: finalContent, toolResults };
      }

      // No tool calls — return the direct response
      return {
        content: choice.message.content || agentConfig?.fallbackMessage || 'I apologize, I could not generate a response.',
        toolResults: [],
      };
    } catch (error: any) {
      console.error('[LLM] Error processing message:', error.message);

      // Handle rate limits gracefully
      if (error.status === 429) {
        return {
          content: 'I am currently experiencing high demand. Please try again in a moment.',
          toolResults: [],
        };
      }

      // Handle context length exceeded
      if (error.code === 'context_length_exceeded') {
        // Retry with truncated history
        const truncatedMessages: ChatCompletionMessageParam[] = [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-5).map((msg: any) => ({
            role: (msg.role === 'user' || msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.content,
          })),
          { role: 'user', content: userMessage },
        ];

        const retryResponse = await openai.chat.completions.create({
          model: agentConfig?.llmConfig?.model || 'gpt-4o',
          messages: truncatedMessages,
          tools,
          tool_choice: 'auto',
        });

        return {
          content: retryResponse.choices[0].message.content || 'I apologize for the delay. How can I help you?',
          toolResults: [],
        };
      }

      return {
        content: agentConfig?.fallbackMessage || 'I encountered an issue. A team member will follow up shortly.',
        toolResults: [],
      };
    }
  }

  /**
   * Execute a tool call and return the result.
   */
  private async executeTool(
    contextInfo: ContextInfo,
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall
  ): Promise<ToolExecutionResult> {
    const args = JSON.parse(toolCall.function.arguments);
    const { tenantId, conversationId, contactId, agentConfigId } = contextInfo;

    try {
      switch (toolCall.function.name) {
        case 'save_lead': {
          const lead = await leadService.create(tenantId, {
            contactId,
            conversationId,
            agentConfigId,
            title: args.title,
            status: 'new',
            priority: args.priority || 'medium',
            extractedData: {
              name: args.name,
              email: args.email,
              phone: args.phone,
              company: args.company,
              requirement: args.requirement,
              budget: args.budget,
              timeline: args.timeline,
            },
          });

          console.log(`[Tool] Lead saved: ${lead._id} - "${args.title}"`);
          return {
            toolCallId: toolCall.id,
            name: 'save_lead',
            result: {
              success: true,
              leadId: lead._id,
              message: `Lead "${args.title}" has been saved to the CRM successfully.`,
            },
            success: true,
          };
        }

        case 'book_appointment': {
          const booking = await bookingService.create(tenantId, {
            contactId,
            conversationId,
            agentConfigId,
            title: args.title,
            description: args.description,
            scheduledAt: new Date(args.scheduledAt),
            duration: args.duration || 30,
            timezone: args.timezone || 'UTC',
            status: 'confirmed',
            attendees: [
              {
                name: args.attendeeName || 'Guest',
                email: args.attendeeEmail,
                phone: args.attendeePhone,
                role: 'guest',
              },
            ],
          });

          console.log(`[Tool] Booking created: ${booking._id} at ${args.scheduledAt}`);
          return {
            toolCallId: toolCall.id,
            name: 'book_appointment',
            result: {
              success: true,
              bookingId: booking._id,
              scheduledAt: args.scheduledAt,
              message: `Appointment "${args.title}" has been booked for ${new Date(args.scheduledAt).toLocaleString()}.`,
            },
            success: true,
          };
        }

        default:
          console.warn(`[Tool] Unknown tool: ${toolCall.function.name}`);
          return {
            toolCallId: toolCall.id,
            name: toolCall.function.name,
            result: { success: false, error: `Unknown tool: ${toolCall.function.name}` },
            success: false,
          };
      }
    } catch (error: any) {
      console.error(`[Tool] Error executing ${toolCall.function.name}:`, error.message);
      return {
        toolCallId: toolCall.id,
        name: toolCall.function.name,
        result: { success: false, error: error.message },
        success: false,
      };
    }
  }

  /**
   * Build a rich system prompt from the agent configuration.
   */
  private buildSystemPrompt(agentConfig: any): string {
    const parts: string[] = [];

    // Base system prompt
    const basePrompt = agentConfig?.llmConfig?.systemPrompt || agentConfig?.systemPrompt || 'You are a helpful AI assistant.';
    parts.push(basePrompt);

    // Add persona instructions
    if (agentConfig?.persona) {
      const p = agentConfig.persona;
      parts.push(`\n## Communication Style`);
      if (p.tone) parts.push(`- Tone: ${p.tone}`);
      if (p.language) parts.push(`- Language: ${p.language}`);
      if (p.personality) parts.push(`- Personality: ${p.personality}`);
      if (p.instructions) parts.push(`\n${p.instructions}`);
    }

    // Add guardrails
    if (agentConfig?.guardrails) {
      const g = agentConfig.guardrails;
      parts.push(`\n## Rules & Guardrails`);
      if (g.blockedTopics?.length) {
        parts.push(`- NEVER discuss these topics: ${g.blockedTopics.join(', ')}`);
      }
      if (g.maxConversationTurns) {
        parts.push(`- Keep conversations under ${g.maxConversationTurns} exchanges. Offer to connect with a human if needed.`);
      }
      if (g.sensitiveDataHandling === 'redact') {
        parts.push('- If the user shares sensitive data (SSN, credit cards), acknowledge receipt but DO NOT repeat it back.');
      } else if (g.sensitiveDataHandling === 'block') {
        parts.push('- If the user shares sensitive data, politely decline to process it and suggest a secure channel.');
      }
    }

    // Add knowledge base context
    if (agentConfig?.knowledgeBase?.length) {
      parts.push(`\n## Knowledge Base`);
      parts.push('Use the following information to answer user questions accurately:');
      for (const entry of agentConfig.knowledgeBase) {
        parts.push(`\n### ${entry.title}\n${entry.content}`);
      }
    }

    // Add tool usage instructions
    parts.push(`\n## Available Actions`);
    parts.push('You have access to CRM tools. Use them proactively:');
    parts.push('- When a user shares their name, email, phone, company, or expresses buying intent → use save_lead');
    parts.push('- When a user asks to schedule a meeting, demo, or callback → use book_appointment');
    parts.push('- Always confirm with the user after performing an action.');

    return parts.join('\n');
  }
}

export const llmService = new LlmService();
