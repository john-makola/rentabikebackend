
//Global
const datetime = require("./datetime");

//RentaBike System

const rolesResolvers = require("./roles");
const usersResolvers = require("./users");


module.exports = {
  DateTime: [datetime],

  Query: {
    ...rolesResolvers.Query,
    ...usersResolvers.Query,

  },
  

};
