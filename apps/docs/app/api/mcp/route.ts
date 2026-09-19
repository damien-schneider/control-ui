import { createMcpHandler } from "mcp-handler";
import { mcpServerInfo, mcpServerInstructions, registerRegistryTools } from "@/app/(features)/agent-discovery/mcp-server";

const handler = createMcpHandler(registerRegistryTools, { serverInfo: mcpServerInfo, instructions: mcpServerInstructions });

export { handler as DELETE, handler as GET, handler as POST };
