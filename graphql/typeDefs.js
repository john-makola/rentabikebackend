const { gql } = require("apollo-server");

module.exports = gql`
  scalar DateTime
  type Role {
    id: ID!
    username: String!
    createdAt: String!
    rolesname: String!
  }

  type User {
    id: ID!
    email: String!
    mobileno: String!
    token: String!
    username: String!
    lastname: String!
    firstname: String!
    role: RoleInput
    createdAt: String!
     }

  input RoleInput {
    rolesname: String!
  }

  input RegisterInput {
    username: String!
    password: String!
    confirmPassword: String!
    email: String!
    mobileno: String!
   lastname: String!
    firstname: String!
    role: String!
  }

 
  type Query {
    # Get All Items
    
    getRoles: [Role]
    getUsers: [User]
    

  type Mutation {
 
    createRole(rolesInput: RoleInput): Role!
    register(registerInput: RegisterInput): User!
   
    
    #Login Users
    login(username: String!, password: String!): User!

`;
