// Example User Controller
const userController = {
  // GET all users
  getAllUsers: async (req, res, next) => {
    try {
      res.json({
        success: true,
        message: 'Get all users',
        data: []
      });
    } catch (error) {
      next(error);
    }
  }, 

  // GET user by ID
  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;
      res.json({
        success: true,
        message: `Get user ${id}`,
        data: {}
      });
    } catch (error) {
      next(error);
    }
  },

  // POST create user
  createUser: async (req, res, next) => {
    try {
      const userData = req.body;
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT update user
  updateUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      res.json({
        success: true,
        message: `User ${id} updated successfully`,
        data: userData
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE user
  deleteUser: async (req, res, next) => {
    try {
      const { id } = req.params;
      res.json({
        success: true,
        message: `User ${id} deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;
