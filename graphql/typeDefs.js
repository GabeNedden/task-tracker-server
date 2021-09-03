const { gql } = require('apollo-server');

module.exports = gql`
    type Project {
        id: ID!
        name: String,
        description: String,
        status: String,
        privacy: String,
        createdAt: String!
        username: String!,
        tasks: [Task],
        teammembers: [Teammember]
    }
    type Task {
        id: ID,
        name: String,
        description: String,
        status: String,
        assignedTo: String,
        lastInteracted: String,
        createdAt: String,
        username: String,
        comments: [Comment],
        points: [Point]
    }
    type Teammember {
        id: ID,
        role: String,
        username: String,
        createdAt: String
    }
    type Comment {
        id: ID,
        body: String,
        username: String,
        createdAt: String,
    }
    type Point {
        id: ID!
        createdAt: String!
        username: String!
    }
    type User {
        id: ID
        email: String
        token: String
        username: String
        createdAt: String
    }
    input RegisterInput {
        username: String!
        password: String!
        confirmPassword: String!
        email: String!
    }
    type Query {
        getProjects: [Project]
        getProject(projectId: ID!): Project
        getMyProjects: [Project]
        getTasks(projectId: ID!): [Task]
        getTeammembers(projectId: ID!): [Teammember]
        getUser(input: String): User
        getUsers: [User]
    }
    type Mutation {
        register(registerInput: RegisterInput): User!
        login(username: String! password: String!): User!
        createProject(name: String! description: String): Project!
        updateProject(projectId: ID!, name: String!, description: String): Project!
        togglePrivacy(projectId: ID!): Project
        completeProject(projectId: ID!): Project!
        archiveProject(projectId: ID!): Project!
        deleteProject(projectId: ID!): String!
        createTask(projectId: ID! name: String!): Project!
        updateTask(projectId: ID, taskId: ID, name: String, description: String, status: String, lastInteracted:String): Project!
        deleteTask(projectId: ID! taskId: ID!): Project!
        claimTask(taskId: ID!): Task!
        addTeammember(projectId: ID! teammemberId: ID!): Project!
        removeTeammember(projectId: ID! teammemberId: ID!): Project!
        createComment(projectId: ID, taskId: ID! body: String!): Task!
        deleteComment(projectId: ID, commentId: ID!): Task!
    }
    type Subscription {
        newTask: Task!
    }
`;