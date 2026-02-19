
export interface EvolutionState {
  rawInput: string;
  output: string;
  isLoading: boolean;
  error: string | null;
}

export enum MessageType {
  ERROR = 'error',
  SUCCESS = 'success',
  INFO = 'info'
}
