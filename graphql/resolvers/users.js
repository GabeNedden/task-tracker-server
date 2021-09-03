const bcrypt             = require('bcryptjs');
const jwt                = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../utilities/validators');
const { SECRET_KEY }            = require('../../config');
const User                      = require('../../models/User');
const Project                   = require('../../models/Project');

function generateToken(user){
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username
        },
        SECRET_KEY,
        { expiresIn: '1h' }
    );
}

module.exports = {
    Query: {
        async getUser(_, { input }){
            try{
                const users = await User.find();
                let user = users.find(user => user.username == input || user.email == input);
                if(user){
                    return user;
                } else {
                    throw new UserInputError("User does not exist")
                }
            } catch(err){
                throw new Error(err);
            }
        },

        async getUsers(){
            try{
                const users = await User.find().sort({ createdAt: -1 });
                return users;
            } catch(err){
                throw new Error(err);
            }
        }
    },

    Mutation: {
        async login(_, { username, password }){
            const {errors, valid} = validateLoginInput(username, password);

            if(!valid){
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username });

            if(!user){
                errors.general = 'User not found';
                throw new UserInputError('User not found', {errors});
            }

            const match = await bcrypt.compare(password, user.password);
            if(!match){
                errors.general = 'Wrong Credentials';
                throw new UserInputError('Wrong Credentials', {errors});
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            };
        },
        // Register
        async register(_, {
            registerInput: { 
                username, 
                email, 
                password, 
                confirmPassword 
                }
            })
        
        {
            // Validate user data
            const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);

            if(!valid){
                throw new UserInputError('Errors', { errors });
            }
            // Make sure user doesnt already exist
            const user = await User.findOne({ username });
            if(user){
                throw new UserInputError('Username is taken!', {
                    errors: {
                        username: 'This username is taken'
                    }
                });
            }
            // Make sure email is unique
            const userEmail = await User.findOne({ email });
            if(userEmail){
                throw new UserInputError('Email is in use', {
                    errors: {
                        email: 'This email is already in use'
                    }
                });
            }
            // hash password and create auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString(),
                role: "Default"
            });

            const res = await newUser.save();

            const token = generateToken(res);

            const newProject = new Project({
                name: "Starter Project!",
                description: "",
                user: res._id,
                status: "Open",
                privacy: "On",
                username: res.username,
                createdAt: new Date().toISOString()
            });

            //Add OfficialGaby
            const gaby = await User.findById("5fe3847269143e9f080eb21f");
            gaby.role = "Website Creator";
            newProject.teammembers.unshift( gaby );
            //Add Tasks
            newProject.tasks.unshift({
                name: "Add Tasks to track the progress and needs of your project",
                description: "",
                username: res.username,
                status: "Open",
                createdAt: new Date().toISOString()
            });
            newProject.tasks.unshift({
                name: "If you need help, OfficialGaby has been added as a Teammember for this project",
                description: "",
                username: res.username,
                status: "Open",
                createdAt: new Date().toISOString()
            });
            //Save project
            await newProject.save();

            return {
                ...res._doc,
                id: res._id,
                token
            };
        }
    }
};