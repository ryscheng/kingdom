interface IntentParameter {
  readonly name: string;
  readonly type: string;
}

interface Intent {
  readonly name: string;
  readonly description: string;
  callback(...parameters: any[]): Promise<string>;
  readonly parameters: IntentParameter[];
  readonly utterances: string[];
}

export { Intent };
