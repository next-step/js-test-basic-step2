import '@testing-library/jest-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  waitForDomChange,
  waitFor,
  getByText,
  fireEvent
} from '@testing-library/dom';
import { createCounter } from '@/counter/backup/counter';
import { createServerCounter } from '@/counter/serverCounter/counter';

const INIT_VAL = 10;
const MIN = 9;
const MAX = 11;

let container;
let counter;
let mockAxios;

beforeEach(() => {
  container = document.createElement('div');
  counter = createCounter({ initVal: INIT_VAL, min: MIN, max: MAX });
  mockAxios = new MockAdapter(axios);
  createMockRouter(mockAxios);
  createServerCounter(container);
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.innerHTML = '';
  mockAxios.reset();
});

it('생성시 버튼과 초기값을 렌더링한다.', () => {
  const response = getCounterState(counter);

  expect(container).toBeInTheDocument();
  expect(getByText(container, '+')).toBeVisible();
  expect(getByText(container, '-')).toBeVisible();
  expect(container).toHaveTextContent(response.value);
  expect(mockAxios.history.get.length).toBe(1);

  // 의문점 - mockAxios.history.get[0].data === getCounterState(counter) 일 것으로 기대했지만 undefined임.
  // expect(mockAxios.history.get[0].data).toBe(getCounterState(counter));
  // expect(mockAxios.history.get[0].data).toBe(undefined);
});

it('+ 버튼 클릭시 서버에 inc요청을 보낸 후 응답값으로 뷰를 갱신한다.', async () => {
  fireEvent.click(getByText(container, '+'));

  await waitFor(() => {
    const response = getCounterState(counter);
    expect(container).toHaveTextContent(response.value);
  });

  expect(mockAxios.history.put.length).toBe(1);
});

it('- 버튼 클릭시 서버에 dec 요청을 보낸 후 응답값으로 뷰를 갱신한다.', async () => {
  fireEvent.click(getByText(container, '-'));

  await waitFor(() => {
    const response = getCounterState(counter);
    expect(container).toHaveTextContent(response.value);
  });

  expect(mockAxios.history.put.length).toBe(1);
});

it('최대값이면 + 버튼이 disabled 상태가 되고, 클릭해도 서버에 요청을 보내지 않는다', async () => {
  fireEvent.click(getByText(container, '+'));
  await waitFor(() => expect(getByText(container, '+')).toBeDisabled());
  await waitFor(() => expect(mockAxios.history.put.length).toBe(1));

  fireEvent.click(getByText(container, '+'));
  await waitFor(() => expect(getByText(container, '+')).toBeDisabled());
  await waitFor(() => expect(mockAxios.history.put.length).toBe(1));
});

it('최소값이면 - 버튼이 disabled 상태가 되고, 클릭해도 서버에 요청을 보내지 않는다', async () => {
  fireEvent.click(getByText(container, '-'));
  await waitFor(() => expect(getByText(container, '-')).toBeDisabled());
  await waitFor(() => expect(mockAxios.history.put.length).toBe(1));

  fireEvent.click(getByText(container, '-'));
  await waitFor(() => expect(getByText(container, '-')).toBeDisabled());
  await waitFor(() => expect(mockAxios.history.put.length).toBe(1));
});

const getCounterState = (counter) => ({
  value: counter.val(),
  isMax: counter.isMax(),
  isMin: counter.isMin()
});

const createMockRouter = (mockAxios) => {
  mockAxios.onGet('/counter').reply(() => [200, getCounterState(counter)]);

  mockAxios.onPut('/counter/inc').reply(() => {
    counter.inc();
    return [200, getCounterState(counter)];
  });

  mockAxios.onPut('/counter/dec').reply(() => {
    counter.dec();
    return [200, getCounterState(counter)];
  });
};
