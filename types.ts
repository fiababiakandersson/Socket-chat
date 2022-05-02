export interface ServerToClientEvents {
  "chat message": (message: string) => void;
  welcome: (message: string) => void;
}

export interface ClientToServerEvents {
  "chat message": (message: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface ServerSocketData {
  name: string;
  age: number;
}
