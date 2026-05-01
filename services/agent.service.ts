/** Observability facade over OpenClaw bridge agents (Fase 2 naming). */
export type { Agent, AgentSummary, AgentStatus } from '~/models/agent'
export { agentToSummary } from '~/models/agent'
export {
  createOpenClawAgentService,
  type OpenClawAgentService,
} from '~/services/openclaw-agent.service'
