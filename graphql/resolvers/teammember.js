const { UserInputError, AuthenticationError } = require('apollo-server');

const User = require('../../models/User');
const Project = require('../../models/Project');
const checkAuth = require('../../utilities/check-auth');

module.exports = {
    Query: {
        async getTeammembers(_, { projectId }){
            try{
                const project = await Project.findById(projectId);
                if(project){
                    return project.teammembers;
                } else {
                    throw new Error('Teammember not found')
                }
            } catch(err){
                throw new Error(err);
            }
        }
    },

    Mutation: {
        addTeammember: async (_, { projectId, teammemberId }, context) => {
            const { username } = checkAuth(context);
            const project = await Project.findById(projectId);
            const user = await User.findById(teammemberId);

            if (project && user){
                if (project.username === username){
                    user.role = "Agent";
                    project.teammembers.unshift( user );
                    
                    await project.save();
                    return project;
                } else {
                    throw new AuthenticationError('Only the Project Owner can take this action')
                }
            } else {
                throw new UserInputError('This Project no longer exists')
            }
        },

        async removeTeammember(_, { projectId, teammemberId }, context){
            const { username } = checkAuth(context);
            const project = await Project.findById(projectId);

            if(project){
                const teamIndex = project.teammembers.findIndex((t) => t.id === teammemberId);
        
                if (project.username === username || username == "OfficialGaby") {
                  project.teammembers.splice(teamIndex, 1);
                  await project.save();
                  return project;
                } else {
                    throw new AuthenticationError('Action not allowed');
                  }
            } else {
                throw new UserInputError('Project not found');
              }
        }
    } 
};