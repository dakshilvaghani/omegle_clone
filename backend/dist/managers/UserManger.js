"use strict";

// Import necessary modules
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const RoomManager_1 = require("./RoomManager");

// Define the UserManager class
class UserManager {
  // Constructor to initialize users array, queue array, and room manager
  constructor() {
    this.users = [];
    this.queue = [];
    this.roomManager = new RoomManager_1.RoomManager();
  }

  // Method to add a new user to the UserManager
  addUser(name, socket) {
    // Add the new user to the users array
    this.users.push({
      name,
      socket,
    });

    // Add the user's socket ID to the queue
    this.queue.push(socket.id);

    // Emit "lobby" event to the user's socket
    socket.emit("lobby");

    // Check if there are enough users in the queue to create a room
    this.clearQueue();

    // Initialize event handlers for the user's socket
    this.initHandlers(socket);
  }

  // Method to remove a user from the UserManager
  removeUser(socketId) {
    // Find the user with the specified socket ID and remove it from the users array
    const user = this.users.find((x) => x.socket.id === socketId);
    this.users = this.users.filter((x) => x.socket.id !== socketId);

    // Remove the user's socket ID from the queue
    this.queue = this.queue.filter((x) => x === socketId);
  }

  // Method to check if there are enough users in the queue to create a room
  clearQueue() {
    // Check if there are at least two users in the queue
    if (this.queue.length < 2) {
      return;
    }

    // Remove the IDs of two users from the queue
    const id1 = this.queue.pop();
    const id2 = this.queue.pop();

    // Find the users with the specified socket IDs
    const user1 = this.users.find((x) => x.socket.id === id1);
    const user2 = this.users.find((x) => x.socket.id === id2);

    // Check if both users exist
    if (!user1 || !user2) {
      return;
    }

    // Create a room with the two users
    this.roomManager.createRoom(user1, user2);

    // Recursively call clearQueue to check if there are more users in the queue
    this.clearQueue();
  }

  // Method to initialize event handlers for the user's socket
  initHandlers(socket) {
    // Handle "offer" event
    socket.on("offer", ({ sdp, roomId }) => {
      this.roomManager.onOffer(roomId, sdp, socket.id);
    });

    // Handle "answer" event
    socket.on("answer", ({ sdp, roomId }) => {
      this.roomManager.onAnswer(roomId, sdp, socket.id);
    });

    // Handle "add-ice-candidate" event
    socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
      this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
    });
  }
}

// Export the UserManager class
exports.UserManager = UserManager;
