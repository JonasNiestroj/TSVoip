import * as socketio from 'socket.io-client';

function Connect(): SocketIOClient.Socket {
    return socketio('http://localhost:80');
}

export default Connect;