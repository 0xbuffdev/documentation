import { createContext } from "react-router";

export const cloudflareContext = createContext<{
	env: Env & { RESEND_API_KEY?: string };
	ctx: ExecutionContext;
}>();
