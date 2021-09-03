const { model, Schema } = require('mongoose');

const projectSchema = new Schema({
    name: String,
    description: String,
    status: String,
    privacy: String,
    username: String,
    createdAt: String,
    teammembers: [{
        role: String,
        username: String,
        createdAt: String
    }],
    tasks: [{   
        name: String,
        description: String,
        status: String,
        assignedTo: String,
        username: String,
        createdAt: String,
        lastInteracted: String,
        comments: [{
                      body: String,
                      username: String,
                      createdAt: String
                }],
        points: [{
                      username: String,
                      createdAt: String
                }]                 
            }],
    user: {
            type: Schema.Types.ObjectId,
            ref: 'users'
    }
});

module.exports = model('Project', projectSchema);
