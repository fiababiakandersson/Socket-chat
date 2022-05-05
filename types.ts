export interface ServerToClientEvents {
  message: ( message: string, from: {id: string, username: string}) => void;
  connected: (username: string) => void;
  roomList: (rooms: string[]) => void;
  joined: (room: string) => void;
  _error: (errorMessage: string) => void;
}

export interface ClientToServerEvents {
  message: (message: string, to: string) => void;
  join: (room: string) => void;
}

export interface InterServerEvents {
  //ping: () => void;
}

export interface ServerSocketData {
  username: string;
}
