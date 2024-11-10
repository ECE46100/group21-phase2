import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Home from '../src/pages/home';
import React from 'react';

beforeEach(() => {
  localStorage.clear();
  jest.resetAllMocks();
  global.fetch = jest.fn();
});

test('renders title', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const title = screen.getByText(/Home/i);
  expect(title).toBeInTheDocument();
});

test('renders links', () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
  const Upload = screen.getByText(/Upload/i);
  expect(Upload).toBeInTheDocument();
  const Update = screen.getByText(/Update/i);
  expect(Update).toBeInTheDocument();
  const Rating = screen.getByText(/Rating/i);
  expect(Rating).toBeInTheDocument();
  const Download = screen.getByText(/Download/i);
  expect(Download).toBeInTheDocument();
})
