const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { AuthenticationError, UserInputError } = require("apollo-server");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../../util/validators");
const { SECRET_KEY } = require("../../config");
const User = require("../../models/User");


function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      mobileno: user.mobileno,
      lastname: user.lastname,
      firstname: user.firstname,
      role: user.role,
      createdAt: user.createdAt,
    },
    SECRET_KEY,
    { expiresIn: "2h" }
  );
}

module.exports = {
  Query: {
    async getUsers() {
      try {
        let filteredUsers = await User.find()
    
        return filteredUsers;
      } catch (err) {
        throw new Error(err);
      }
    },
  },

  Mutation: {
    async login(_, { username, password }) {
      const { errors, valid } = validateLoginInput(username, password);

      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }

      const user = await User.findOne({ username });

      if (!user) {
        errors.general = "Wrong Username or Password try again";
        throw new UserInputError("Wrong Username or Password try again", {
          errors,
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Wrong Username or Password try again";
        throw new UserInputError("Wrong Username or Password try again", {
          errors,
        });
      }

      const token = generateToken(user);

      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },
    async register(
      _,
      {
        registerInput: {
          username,
          email,
          password,
          confirmPassword,
          mobileno,
          lastname,
          firstname,
          role,
        },
      }
    ) {
      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username,
        firstname,
        lastname,
        password,
        confirmPassword,
        email,
        role
      );
      if (!valid) {
        throw new UserInputError("Errors", { errors });
      }
      // TODO: Make sure user doesnt already exist
      const user = await User.findOne({ username });
      if (user) {
        throw new UserInputError("Username is taken", {
          errors: {
            username: "This username is taken",
          },
        });
      }
      // hash password and create an auth token
      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        mobileno,
        lastname,
        firstname,
        role,
        createdAt: new Date().toISOString(),
      });

      const res = await newUser.save();

      const token = generateToken(res);

      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },

  },
};
