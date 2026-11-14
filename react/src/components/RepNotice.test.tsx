import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RepNotice from './RepNotice';

const MOCK_SYSTEM_TIME = new Date('2026-11-12T12:00:00Z');

describe('RepNotice', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_SYSTEM_TIME);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the notice text', () => {
    render(
      <RepNotice
        notice={{
          id: 1,
          text: 'New members of Congress take office in January 2027.',
          expiresAt: '2027-01-04T00:00:00Z'
        }}
      />
    );

    expect(screen.getByRole('note')).toHaveTextContent(
      'New members of Congress take office in January 2027.'
    );
  });

  it('renders a notice with no expiry', () => {
    render(<RepNotice notice={{ id: 1, text: 'Hello', expiresAt: null }} />);

    expect(screen.getByRole('note')).toHaveTextContent('Hello');
  });

  it('renders nothing without a notice', () => {
    const { container } = render(<RepNotice />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for blank text', () => {
    const { container } = render(
      <RepNotice notice={{ id: 1, text: '  ', expiresAt: null }} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing once expired', () => {
    const { container } = render(
      <RepNotice
        notice={{ id: 1, text: 'Old', expiresAt: '2026-11-12T12:00:00Z' }}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
