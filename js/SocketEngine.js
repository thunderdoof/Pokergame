class SocketEngine {
    constructor(io) {
        this.io = io
        this.connected = {}

    }
    emit(path, data, socket_id) {
        this.connected[socket_id].emit(path, data) //scope socket
    }
    broadcast(path, data) {
        this.io.sockets.emit(path, data)
    }
    getConnected() {
        return this.connected
    }
    getConnectedLength() {
       return Object.keys(this.connected).length
    }
    addConnection(socket) {
        this.connected[socket.id] = socket 
    }
    
}
module.exports = SocketEngine;
