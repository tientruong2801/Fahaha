// Example User Service
const User = require('../models/user.model');

const userService = {
  async getAllUsers() {
    try {
      const users = await User.findAll();
      return users;
    } catch (error) {
      throw new Error('Error fetching users: ' + error.message);
    }
  },

  async getUserById(id) {
    try {
      const user = await User.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  },

  async createUser(userData) {
    try {
      // TODO: Add validation and password hashing
      const user = await User.create(userData);
      return user;
    } catch (error) {
      throw new Error('Error creating user: ' + error.message);
    }
  },

  async updateUser(id, userData) {
    try {
      const user = await User.update(id, userData);
      return user;
    } catch (error) {
      throw new Error('Error updating user: ' + error.message);
    }
  },

  async deleteUser(id) {
    try {
      await User.delete(id);
      return true;
    } catch (error) {
      throw new Error('Error deleting user: ' + error.message);
    }
  }
};

module.exports = userService;
