const { UserInputError, AuthenticationError } = require('apollo-server');

const Project = require('../../models/Project');
const checkAuth = require('../../utilities/check-auth');

module.exports = {
    Query: {
        async getTasks(_, { projectId }){
            try{
                const project = await Project.findById(projectId);
                if(project){
                    return project.tasks;
                } else {
                    throw new Error('Tasks not found')
                }
            } catch(err){
                throw new Error(err);
            }
        }
    },

    Mutation: {
        createTask: async (_, { projectId, name }, context) => {
            const { username } = checkAuth(context);
            if(name.trim() === ''){
                throw new UserInputError('Empty task name', {
                    errors: {
                        name: 'Task name must not be empty'
                    }
                })
            }

            const project = await Project.findById(projectId);
            
            if(project){
                project.tasks.unshift({
                    name,
                    description: "",
                    username,
                    status: "Open",
                    assignedTo: "Unassigned",
                    createdAt: new Date().toISOString()
                });
                
                await project.save();

                context.pubsub.publish('NEW_TASK', {
                    newTask: project.tasks
                });

                return project;
        
            } else throw new UserInputError('Project not found');
        },

        async deleteTask(_, { projectId, taskId }, context){
            const { username } = checkAuth(context);

            const project = await Project.findById(projectId);

            if(project){
                const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
        
                if (project.username === username) {
                  project.tasks.splice(taskIndex, 1);
                  await project.save();
                  return project;
                } else {
                    throw new AuthenticationError('Action not allowed');
                  }
            } else {
                throw new UserInputError('Project not found');
              }
        },

        async updateTask(_, { projectId, taskId, name, description, status }, context){
            const user = checkAuth(context);

            try{
                const project = await Project.findById(projectId);
                if(project){
                    const taskIndex = project.tasks.findIndex((t) => t.id === taskId);
                    task = project.tasks[taskIndex];
                    task.name = name;
                    task.description = description;
                    task.status = status;
                    task.lastInteracted = user.username;

                    await project.save()
                    return project;
                } else {
                    throw new UserInputError('Project does not exist');
                }
            } catch(err){
                throw new Error(err);
            }
        },

        async claimTask(_, { taskId }, context){
            const { username } = checkAuth(context);

            const task = await Task.findById(taskId);
            if(task){
                if(task.points.find(point => point.username === username)){
                    //task already claimed, unclaim
                    task.points = task.points.filter(point => point.username !== username);
                } else {
                    //not claimed, claim it
                    task.points.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await task.save();
                return task;
            } else throw new UserInputError('Task not found');
        }
    },
    Subscription: {
        newTask: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_TASK')
        }
    }
};