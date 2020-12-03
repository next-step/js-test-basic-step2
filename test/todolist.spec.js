import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  getTodosByUsername,
  addTodo,
  editTodoContents,
  deleteTodo,
} from '../src/apis/todo';

const getDeepCopy = (object) => JSON.parse(JSON.stringify(object));
const getIdByURL = (url) => url.slice(url.lastIndexOf('/') + 1);
const USER_NAME = 'read0more';
const BASE_URL = 'https://blackcoffee-todolist.df.r.appspot.com/api/u';
const initialData = {
  todoList: [
    { _id: 'PxbfPN-eP', contents: 'test', isCompleted: false, priority: 0 },
    { _id: 'PxbfPN-eP', contents: 'test', isCompleted: true, priority: 0 },
    { _id: 'HuoNlzNFn', contents: 'test2', isCompleted: false, priority: 1 },
    { _id: 'DhUmIseK1', contents: 'test3', isCompleted: true, priority: 2 },
    { _id: 'fePWVALFS', contents: 'test4', isCompleted: false, priority: 0 },
  ],
};

let todos = getDeepCopy(initialData);

const mockAxios = new MockAdapter(axios);
mockAxios.onGet(`${BASE_URL}/${USER_NAME}/item`).reply(() => [200, todos]);

describe('todolist 통신 테스트', () => {
  afterEach(async () => {
    todos = getDeepCopy(initialData);
  });

  it('todolist를 읽어온다.', async () => {
    const todosByAPI = await getTodosByUsername(USER_NAME);
    expect(todosByAPI).toEqual(todos.todoList);
  });

  it('todolist를 생성한다.', async () => {
    const newTodoText = 'new todo';
    const addTodoMock = (todoText) => {
      const newTodos = getDeepCopy(todos);
      const newTodo = {
        contents: todoText,
      };

      newTodos.todoList.push(newTodo);

      return newTodos;
    };

    mockAxios.onPost(`${BASE_URL}/${USER_NAME}/item`).reply((config) => {
      const newTodoText = JSON.parse(config.data).contents;
      const newTodos = addTodoMock(newTodoText);
      todos = newTodos;

      return [200, todos];
    });

    const todosByAPI = await addTodo(USER_NAME, newTodoText);
    expect(todosByAPI).toEqual(todos.todoList);
  });

  it('todolist를 수정한다.', async () => {
    const targetId = todos.todoList[2]._id;
    const editTodoText = '수정 todo';

    const editTodoMock = (id, todoText) => {
      let newTodos = getDeepCopy(todos);

      newTodos.todoList = newTodos.todoList.map((todo) => {
        if (todo.id === id) {
          todo.contents = todoText;
        }

        return todo;
      });

      return newTodos;
    };

    mockAxios
      .onPut(`${BASE_URL}/${USER_NAME}/item/${targetId}`)
      .reply((config) => {
        const id = getIdByURL(config.url);
        const editTodoText = JSON.parse(config.data).contents;
        const newTodos = editTodoMock(id, editTodoText);
        todos = newTodos;

        const updatedTodo = todos.todoList.find((todo) => todo.id === id);
        return [200, updatedTodo];
      });

    const todoByAPI = await editTodoContents(USER_NAME, targetId, editTodoText);
    const updatedTodo = todos.todoList.find((todo) => todo.id === targetId);
    expect(todoByAPI).toEqual(updatedTodo);
  });

  it('todolist를 삭제한다.', async () => {
    const targetId = todos.todoList[2]._id;

    const deleteTodoMock = (id) => {
      let newTodos = getDeepCopy(todos);
      newTodos.todoList = newTodos.todoList.filter((todo) => todo.id !== id);

      return newTodos;
    };

    mockAxios
      .onDelete(`${BASE_URL}/${USER_NAME}/item/${targetId}`)
      .reply((config) => {
        const id = getIdByURL(config.url);
        const newTodos = deleteTodoMock(id);
        todos = newTodos;
        return [200, todos];
      });

    const todosByAPI = await deleteTodo(USER_NAME, targetId);
    expect(todosByAPI).toEqual(todos.todoList);
  });
});
