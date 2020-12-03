import '@testing-library/jest-dom/extend-expect';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  waitFor,
  getByText,
  fireEvent,
  getByTestId,
} from '@testing-library/dom';
import { createServerCounter } from '../src/serverCounter/counter';

let container;
const mockAxios = new MockAdapter(axios);
const INIT_VAL = 10;
const MIN = 8;
const MAX = 12;

const initialData = {
  value: INIT_VAL,
  isMin: false,
  isMax: false,
};
let counterData = { ...initialData };

const increase = ({ value, isMin, isMax }) => {
  value = value < MAX ? ++value : value;
  isMax = value === MAX;

  return { value, isMin, isMax };
};

const decrease = ({ value, isMin, isMax }) => {
  value = MIN < value ? --value : value;
  isMin = value === MIN;

  return { value, isMin, isMax };
};

mockAxios.onGet('/counter').reply(() => [200, counterData]);
mockAxios.onPut('/counter/inc').reply(() => {
  counterData = increase(counterData);

  return [200, counterData];
});
mockAxios.onPut('/counter/dec').reply(() => {
  counterData = decrease(counterData);

  return [200, counterData];
});

beforeEach(async () => {
  container = document.createElement('div');

  createServerCounter(container);
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.innerHTML = '';
  counterData = { ...initialData };
});

it('생성시 버튼과 초기값을 렌더링한다.', async () => {
  expect(getByText(container, '+'));
  expect(getByText(container, '-'));
  expect(getByText(container, `${INIT_VAL}`)).toBeInTheDocument();
  expect(getByText(container, '+')).toHaveClass('btn-inc');
  expect(getByText(container, '-')).toHaveClass('btn-dec');
  expect(getByText(container, '+')).not.toBeDisabled();
  expect(getByText(container, '-')).not.toBeDisabled();
  expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL);
});

it('+ 버튼 클릭시 서버에 inc요청을 보낸 후 응답값으로 뷰를 갱신한다.', async () => {
  await waitFor(() => fireEvent.click(getByText(container, '+')));
  await waitFor(() =>
    expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL + 1)
  );
});

it('- 버튼 클릭시 서버에 dec 요청을 보낸 후 응답값으로 뷰를 갱신한다.', async () => {
  await waitFor(() => fireEvent.click(getByText(container, '-')));
  await waitFor(() =>
    expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL - 1)
  );
});

it('최대값이면 + 버튼이 disabled 상태가 되고, 클릭해도 서버에 요청을 보내지 않는다', async () => {
  await waitFor(() => fireEvent.click(getByText(container, '+')));
  await waitFor(() => fireEvent.click(getByText(container, '+')));
  await waitFor(() => fireEvent.click(getByText(container, '+')));
  await waitFor(() => fireEvent.click(getByText(container, '+')));
  await waitFor(() =>
    expect(getByTestId(container, 'value')).toHaveTextContent(MAX)
  );
  await waitFor(() => expect(getByText(container, '+')).toBeDisabled());
});

it('최소값이면 - 버튼이 disabled 상태가 되고, 클릭해도 서버에 요청을 보내지 않는다', async () => {
  await waitFor(() => fireEvent.click(getByText(container, '-')));
  await waitFor(() => fireEvent.click(getByText(container, '-')));
  await waitFor(() => fireEvent.click(getByText(container, '-')));
  await waitFor(() => fireEvent.click(getByText(container, '-')));
  await waitFor(() =>
    expect(getByTestId(container, 'value')).toHaveTextContent(MIN)
  );
  await waitFor(() => expect(getByText(container, '-')).toBeDisabled());
});
