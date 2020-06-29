let users = require('./user');
let friendly = require('./friendly');
let messages = require('./messages');
let todo = require('./todo');


module.exports= {
    ...users,
    ...friendly,
    ...messages,
    ...todo
}