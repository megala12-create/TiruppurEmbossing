import { adminRoute, ok } from "@/lib/admin/api";
import { chatProviderConfigured, CHAT_MODEL } from "@/lib/rag/provider";
import { knowledgeBaseStats, refreshKnowledgeBase } from "@/lib/rag/knowledge";

/** Current knowledge-base stats, for the admin "Knowledge base" tab. */
export const GET = adminRoute(async () => {
  const stats = await knowledgeBaseStats();
  return ok({ stats, providerConfigured: chatProviderConfigured(), model: CHAT_MODEL });
});

/** Rebuilds the knowledge base from source (data/*.ts + content/knowledge/*). */
export const POST = adminRoute(async () => {
  refreshKnowledgeBase();
  const stats = await knowledgeBaseStats();
  return ok({ stats });
});
