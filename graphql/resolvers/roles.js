const { AuthenticationError, UserInputError } = require("apollo-server");

const Role = require("../../models/role");
const checkAuth = require("../../util/check-auth");

module.exports = {
  Query: {
    async getRoles() {
      try {
        const roles = await Role.find().sort({ createdAt: -1 });

        return roles;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getRole(_, { roleId }) {
      try {
        const role = await Role.findById(roleId);
        if (role) {
          return role;
        } else {
          throw new Error("Role not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createRole(_, { rolesInput: { rolesname } }, context) {
      const user = checkAuth(context);

      if (rolesname.trim() === "") {
        throw new Error("Roles Name No must not be empty");
      }

      if (!user.role === "admin") {
        throw new Error("User must be an Admin to Create a Department");
      }

      const newRole = new Role({
        rolesname,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const role = await newRole.save();

      context.pubsub.publish("NEW_ROLE", {
        newRole: role,
      });

      return role;
    },

    async deleteRole(_, { roleId }, context) {
      const user = checkAuth(context);

      try {
        const role = await Role.findById(roleId);
        if (user.username === role.username) {
          await role.delete();
          return "Role deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    async updateRole(parent, args, context) {
      const user = checkAuth(context);

      try {
        if (user.username) {
          const { roleId } = args;

          const { rolesname } = args.role;

          const updates = {};
          if (rolesname !== undefined) {
            updates.rolesname = rolesname;
          }

          const role = await Role.findByIdAndUpdate(roleId, updates, {
            new: true,
          });
          return role;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (error) {}
    },
  },
  Subscription: {
    newRole: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_ROLE"),
    },
  },
};
