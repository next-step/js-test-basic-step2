import '@testing-library/jest-dom/extend-expect';
import { getByText, fireEvent, getByTestId } from '@testing-library/dom';
import { createUICounter } from '../../src/uiCounter/counter';

let container;
const INIT_VAL = 10;
const MIN = 8;
const MAX = 12;

beforeEach(() => {
  container = document.createElement('div');
  createUICounter(container, {
    initVal: INIT_VAL,
    min: MIN,
    max: MAX,
  });
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.innerHTML = '';
});

it('생성시 버튼과 초기값을 렌더링한다.', () => {
  expect(getByText(container, '+')).toBeVisible();
  expect(getByText(container, '-')).toBeVisible();

  expect(getByText(container, `${INIT_VAL}`)).toBeInTheDocument();

  expect(getByText(container, '+')).toHaveClass('btn-inc');
  expect(getByText(container, '-')).toHaveClass('btn-dec');

  expect(getByText(container, '+')).not.toBeDisabled();
  expect(getByText(container, '-')).not.toBeDisabled();

  expect(getByTestId(container, 'value')).toHaveTextContent(INIT_VAL);
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
  fireEvent.click(getByText(container, '+'));
  fireEvent.click(getByText(container, '+'));

  expect(getByText(container, '+')).toBeDisabled();
  expect(getByTestId(container, 'value')).toHaveTextContent(MAX);
});

it('Min값인 경우 - 버튼이 disabled 상태가 되며, 클릭해도 감소하지 않는다.', () => {
  fireEvent.click(getByText(container, '-'));
  fireEvent.click(getByText(container, '-'));
  fireEvent.click(getByText(container, '-'));

  expect(getByText(container, '-')).toBeDisabled();
  expect(getByTestId(container, 'value')).toHaveTextContent(MIN);
});
