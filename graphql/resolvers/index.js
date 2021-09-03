const projectResolvers      = require('./projects');
const userResolvers         = require('./users');
const taskResolvers         = require('./tasks');
const commentResolvers      = require('./comments');
const teammemberResolvers   = require ('./teammember');

module.exports = {
    Query: {
        ...projectResolvers.Query,
        ...taskResolvers.Query,
        ...teammemberResolvers.Query,
        ...userResolvers.Query
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...projectResolvers.Mutation,
        ...taskResolvers.Mutation,
        ...teammemberResolvers.Mutation,
        ...commentResolvers.Mutation
    },
    Subscription: {
        ...taskResolvers.Subscription
    }
};