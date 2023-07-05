import { FastifyReply, HookHandlerDoneFunction } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    verifySession: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction
    ) => Promise<void>;

    verifyCourseAccess: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction
    ) => Promise<void>;

    verifyAssignmentAccess: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction
    ) => Promise<void>;

    config: {
      SESSION_KEY: string;
      HASH_SECRET: string;
      POSTGRES_HOST: string;
      POSTGRES_USER: string;
      POSTGRES_DATABASE: string;
      POSTGRES_PASSWORD: string;
      POSTGRES_PORT: number;
    };
  }
  interface FastifyRequest {
    user?: {
      username: string;
      id: string;
    };
    course?: {
      id: string;
      name: string;
    };
    assignment?: {
      id: string;
      course_id: string;
      name: string;
      out_date: Date;
      due_date: Date;
      progress: number;
    };
  }
}

declare module "@fastify/secure-session" {
  interface SessionData {
    user_id: string;
  }
}
