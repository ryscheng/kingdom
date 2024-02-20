interface Driver {
  start(): Promise<void>;
  stop(): Promise<void>;
}

export { Driver };
