import * as socketio from 'socket.io-client';

function Connect() {
    socketio('http://localhost:80');
}

export default Connect;