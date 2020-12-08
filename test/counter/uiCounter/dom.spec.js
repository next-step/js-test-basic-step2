import '@testing-library/jest-dom';
import { getByText, fireEvent, getByTestId } from '@testing-library/dom';
import { createUICounter } from '@/counter/uiCounter/counter';

const INIT_VAL = 10;
const MIN = 9;
const MAX = 11;

let container;

beforeEach(() => {
  container = document.createElement('div');
  createUICounter(container, { initVal: INIT_VAL, min: MIN, max: MAX });

  document.body.appendChild(container);
});

afterEach(() => {
  document.body.innerHTML = '';
});

it('생성시 버튼과 초기값을 렌더링한다.', () => {
  expect(container).toBeInTheDocument();
  expect(getByText(container, '+')).toBeVisible();
  expect(container).toHaveTextContent(INIT_VAL);
  expect(getByText(container, '-')).toBeVisible();
});

it('+ 버튼 클릭시 1 증가한다.', () => {
  fireEvent.click(getByText(container, '+'));
  expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL + 1);
});

it('- 버튼 클릭시 1 감소한다.', () => {
  fireEvent.click(getByText(container, '-'));
  expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL - 1);
});

it('Max값인 경우 + 버튼이 disabled 상태가 되며 클릭해도 증가하지 않는다.', () => {
  fireEvent.click(getByText(container, '+'));
  expect(getByText(container, '+')).toBeDisabled();

  fireEvent.click(getByText(container, '+'));
  expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL + 1);
});

it('Min값인 경우 - 버튼이 disabled 상태가 되며, 클릭해도 감소하지 않는다.', () => {
  fireEvent.click(getByText(container, '-'));
  expect(getByText(container, '-')).toBeDisabled();

  fireEvent.click(getByText(container, '-'));
  expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL - 1);
});
