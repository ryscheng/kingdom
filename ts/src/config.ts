const requireEnv = (value: string | undefined, identifier: string) => {
  if (!value) {
    throw new Error(`Required env var ${identifier} does not exist`);
  }
  return value;
};

/**
export const OPEN_WEATHER_API_KEY = requireEnv(
  process.env.OPEN_WEATHER_API_KEY,
  "OPEN_WEATHER_API_KEY",
);
**/
export const OPEN_WEATHER_API_KEY =
  process.env.OPEN_WEATHER_API_KEY ?? "MISSING";
export const HYPEM_USER = process.env.HYPEM_USER;
