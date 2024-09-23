const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDef = protoLoader.loadSync("todo.proto", {});
const grpcObject = grpc.loadPackageDefinition(packageDef);
const todoPackage = grpcObject.todoPackage;

const server = new grpc.Server();
server.addService(todoPackage.Todo.service, {
  createTodo: createTodo,
  readTodos: readTodos,
  readTodosStream: readTodosStream,
});
server.bindAsync(
  "0.0.0.0:40000",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Error binding the server:", error);
      return;
    }
    console.log(`Server running at 0.0.0.0:${port}`);
  }
);

const todos = [];
function createTodo(call, callBack) {
  const todoItem = {
    id: todos.length + 1,
    text: call.request.text,
  };
  todos.push(todoItem);
  callBack(null, todoItem);
}

function readTodosStream(call, callBack) {
  todos.forEach((t) => call.write(t));
  call.end();
}

function readTodos(call, callBack) {
  callBack(null, { items: todos });
}
