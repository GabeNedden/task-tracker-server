const { AuthenticationError } = require('apollo-server');

const Project = require('../../models/Project')
const checkAuth = require('../../utilities/check-auth');

module.exports = {
    Query: {
        async getProjects(){
            try{
                const projects = await Project.find().sort({ createdAt: -1 });
                return projects;
            } catch(err){
                throw new Error(err);
            }
        },
        async getProject(_, { projectId }){
            try{
                const project = await Project.findById(projectId);
                if(project){
                    return project;
                } else {
                    throw new Error('Project not found')
                }
            } catch(err){
                throw new Error(err);
            }
        },
        async getMyProjects(_, {}, context){
            const user = checkAuth(context);
            try{
                const projects = await Project.find({ "username": user.username }).sort({createdAt: -1});
                return projects;
            } catch(err){
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createProject(_, { name }, context){
            const user = checkAuth(context);

            if(name.trim() === ''){
                throw new Error('Project name must not be empty');
            }

            const newProject = new Project({
                name,
                description: "",
                user: user.id,
                status: "Open",
                privacy: "On",
                teammembers: [],
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const project = await newProject.save();

            return project
        },

        async updateProject(_, { projectId, name, description }, context){
            const user = checkAuth(context);

            try{
                const project = await Project.findById(projectId);
                if(user.username === project.username){
                    project.name = name;
                    project.description = description;
                    await project.save()
                    return project;
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } catch(err){
                throw new Error(err);
            }
        },

        async togglePrivacy(_, { projectId }, context){
            const user = checkAuth(context);
            const project = await Project.findById(projectId);

            if(user.username === project.username){
                if(project.privacy !== "On"){
                    project.privacy = "On";
                } else {
                    project.privacy = "Off"
                };
                await project.save();
                return project;
            } else throw new AuthenticationError('Only the project owner can modify this')

        },

        async completeProject(_, { projectId }, context) {
            const { username } = checkAuth(context);
            
            const project = await Project.findById(projectId);
            if (project) {
              if (project.status === "Open") {
                project.status = "Complete";
              } else {
                project.status = "Open";
                };
      
              await project.save();
              return project;
            } else throw new UserInputError('Project not found');
        },

        async archiveProject(_, { projectId }, context) {
            const { username } = checkAuth(context);
            
            const project = await Project.findById(projectId);
            if (project) {
              if (project.status === "Archived") {
                project.status = "Open";
              } else {
                project.status = "Archived";
                };
      
              await project.save();
              return project;
            } else throw new UserInputError('Project not found');
        },

        async deleteProject(_, { projectId }, context){
            const user = checkAuth(context);

            try{
                const project = await Project.findById(projectId);
                if(user.username === project.username){
                    await project.delete();
                    return 'Project deleted successfully';
                } else {
                    throw new AuthenticationError('Action not allowed');
                }
            } catch(err){
                throw new Error(err);
            }
        }
    }
};