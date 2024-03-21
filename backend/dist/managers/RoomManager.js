"use strict";

// Import necessary modules
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;

// Global variable to keep track of room IDs
let GLOBAL_ROOM_ID = 1;

// Define the RoomManager class
class RoomManager {
  // Constructor to initialize rooms map
  constructor() {
    this.rooms = new Map();
  }

  // Method to create a new room with two users
  createRoom(user1, user2) {
    // Generate a new room ID
    const roomId = this.generate().toString();

    // Add users to the room
    this.rooms.set(roomId.toString(), {
      user1,
      user2,
    });

    // Emit "send-offer" event to both users with room ID
    user1.socket.emit("send-offer", {
      roomId,
    });
    user2.socket.emit("send-offer", {
      roomId,
    });
  }

  // Method to handle offer message from a user
  onOffer(roomId, sdp, senderSocketid) {
    // Get the room based on the room ID
    const room = this.rooms.get(roomId);
    if (!room) {
      return; // If room not found, exit
    }

    // Determine the receiving user based on senderSocketid
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;

    // Emit "offer" event to the receiving user with SDP and room ID
    receivingUser?.socket.emit("offer", {
      sdp,
      roomId,
    });
  }

  // Method to handle answer message from a user
  onAnswer(roomId, sdp, senderSocketid) {
    // Get the room based on the room ID
    const room = this.rooms.get(roomId);
    if (!room) {
      return; // If room not found, exit
    }

    // Determine the receiving user based on senderSocketid
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;

    // Emit "answer" event to the receiving user with SDP and room ID
    receivingUser?.socket.emit("answer", {
      sdp,
      roomId,
    });
  }

  // Method to handle ICE candidates message from a user
  onIceCandidates(roomId, senderSocketid, candidate, type) {
    // Get the room based on the room ID
    const room = this.rooms.get(roomId);
    if (!room) {
      return; // If room not found, exit
    }

    // Determine the receiving user based on senderSocketid
    const receivingUser =
      room.user1.socket.id === senderSocketid ? room.user2 : room.user1;

    // Emit "add-ice-candidate" event to the receiving user with candidate and type
    receivingUser.socket.emit("add-ice-candidate", { candidate, type });
  }

  // Method to generate a unique room ID
  generate() {
    return GLOBAL_ROOM_ID++;
  }
}

// Export the RoomManager class
exports.RoomManager = RoomManager;
