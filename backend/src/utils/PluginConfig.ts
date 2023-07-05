const envSchema = {
  type: "object",
  required: [
    "SESSION_KEY",
    "HASH_SECRET",
    "POSTGRES_HOST",
    "POSTGRES_USER",
    "POSTGRES_DATABASE",
    "POSTGRES_PASSWORD",
    "POSTGRES_PORT",
  ],
  properties: {
    POSTGRES_HOST: {
      type: "string",
    },
    POSTGRES_USER: {
      type: "string",
    },
    POSTGRES_DATABASE: {
      type: "string",
    },
    POSTGRES_PASSWORD: {
      type: "string",
    },
    POSTGRES_PORT: {
      type: "number",
    },
    SESSION_KEY: {
      type: "string",
    },
    HASH_SECRET: {
      type: "string",
    },
  },
};
export default envSchema;
