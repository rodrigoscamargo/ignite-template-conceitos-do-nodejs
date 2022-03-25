const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  if(username){

  const user = users.find(user => user.username === username);

  if(user){
    request.user = user;

    return next();
  }
  }

  return response.status(400).json({error: 'Messagem do erro'});
}

app.post('/users', (request, response) => {
   const { name, username } = request.body;

   const userExist = users.find(user => user.username === username);

  if(!userExist){
    const user = {
      id:  uuidv4(),
      name: name,
      username: username,
      todos: []
    }
 
    users.push(user);
 
    return response.status(201).json(user);
  }

  return response.status(400).json({error: 'Messagem do erro'});

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title , deadline } = request.body;
 
  const todo = {
    id:  uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);


  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title , deadline } = request.body;

  const todoIndex =  user.todos.findIndex(todo => todo.id === id);

  if(todoIndex != -1){
    const todo = user.todos[todoIndex];

    todo.title = title;
    todo.deadline = new Date(deadline);

    return response.status(200).json(todo);
  }

  return response.status(404).json({error: 'Messagem do erro'});
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex =  user.todos.findIndex(todo => todo.id === id);

  if(todoIndex != -1){
    const todo = user.todos[todoIndex];

    todo.done = true;

    user.todos[todoIndex] = todo;

    return response.status(200).json(todo);
  }

  return response.status(404).json({error: 'Messagem do erro'});
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex =  user.todos.findIndex(todo => todo.id === id);

  if(todoIndex > -1){

    user.todos.splice(todoIndex, 1);

    return response.status(204).send();
  }
  return response.status(404).json({error: 'Messagem do erro'});
});

module.exports = app;