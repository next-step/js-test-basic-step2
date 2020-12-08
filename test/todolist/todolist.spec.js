import '@testing-library/jest-dom';
import fetchMock from 'fetch-mock-jest';
import {
  waitForDomChange,
  waitFor,
  getByTestId,
  getByText,
  fireEvent
} from '@testing-library/dom';
import { BASE_URL, METHODS } from '@/todolist/constants';
import * as API from '@/todolist/api/apis';
import App from '@/todolist/components/App';
import Store from '@/todolist/store';
import { parseHash } from '@/todolist/utils';
import { init, addTodo, updateTodo, deleteTodo } from '@/todolist/api/apis';
import { FILTER } from '@/todolist/constants';

const users = [
  {
    _id: 'NcWgvespP',
    name: 'younho9',
    todoList: [
      {
        _id: '6vVsS7eYc',
        contents: 'todolist1',
        isCompleted: false,
        priority: 'NONE'
      },
      {
        _id: 'm5_W5fiYy',
        contents: 'todolist2',
        isCompleted: true,
        priority: 'NONE'
      },
      {
        _id: 'SsybklFMZ',
        contents: 'todolist3',
        isCompleted: false,
        priority: 'NONE'
      },
      {
        _id: 'G8MCG9y6_',
        contents: 'todolist4',
        isCompleted: false,
        priority: 'NONE'
      }
    ]
  },
  { _id: '-2qS_EuGx', name: 'hs_test4', todoList: [] }
];

const newTodo = {
  _id: '6vDSsdfSc',
  contents: 'todoList2',
  priority: 'NONE',
  isCompleted: false
};

const updatedTodo = {
  _id: '6vVsS7eYc',
  contents: 'updatedTodoList1',
  priority: 'NONE',
  isCompleted: false
};

let $app;
let todoCount;

beforeEach(() => {
  fetchMock.config.overwriteRoutes = true;
  fetchMock
    .get(`${BASE_URL}/users`, users)
    .post(`${BASE_URL}/users/${users[0]._id}/items`, newTodo)
    .put(
      `${BASE_URL}/users/${users[0]._id}/items/${users[0].todoList[0]._id}`,
      updatedTodo
    )
    .delete(
      `${BASE_URL}/users/${users[0]._id}/items/${users[0].todoList[0]._id}`,
      { todoList: [] }
    );

  $app = document.createElement('div');
  $app.id = 'app';
  document.body.append($app);

  new Store();
  new App(document.querySelector('#app'));
});

describe('todolist 통신 테스트', () => {
  it('init', async () => {
    const response = await init();

    expect(response).toEqual({
      users,
      currentUser: users[0]._id,
      todoList: users[0].todoList,
      currentFilter: FILTER.ALL
    });
  });

  it('addTodo', async () => {
    const response = await addTodo({
      contents: newTodo.contents,
      userId: users[0]._id
    });

    expect(response).toEqual({ todoItem: newTodo });
  });

  it('updateTodo', async () => {
    const response = await updateTodo({
      id: users[0].todoList[0]._id,
      contents: updatedTodo.contents,
      userId: users[0]._id
    });

    expect(response).toEqual({ todoItem: updatedTodo });
  });

  it('deleteTodo', async () => {
    const response = await deleteTodo({
      id: users[0].todoList[0]._id,
      userId: users[0]._id
    });

    expect(response).toEqual({ todoList: [] });
  });
});

// 의문점 ? getByTestId, getByText matcher 뿐만 아니라 querySelector로도 동작하지 않음.
// 테스트 실패 후에 DOM이 나타나는데 이 때는 $app 내에 정상적으로 렌더링 되는 것으로 보임.

// describe('todolist UI 테스트', () => {
//   it('최초 렌더링 시, todoList의 개수는 0번째 유저의 todoList의 개수이다', async () => {
//     await waitFor(
//       () => {
//         expect(getByTestId($app, 'todo-count')).toBeVisible();
//       },
//       { timeout: 5000 }
//     );
//   });
// });
