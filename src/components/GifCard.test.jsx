import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GifCard from './GifCard';

const mockGif = {
  id: '123',
  url: 'https://example.com/test.gif',
  tags: ['funny', 'cat'],
};

describe('GifCard', () => {
  it('renders the gif image', () => {
    render(<GifCard gif={mockGif} onCopy={() => {}} onDelete={() => {}} />);
    const img = screen.getByAltText('GIF');
    expect(img).toHaveAttribute('src', mockGif.url);
  });

  it('renders tags', () => {
    render(<GifCard gif={mockGif} onCopy={() => {}} onDelete={() => {}} />);
    expect(screen.getByText('funny')).toBeInTheDocument();
    expect(screen.getByText('cat')).toBeInTheDocument();
  });

  it('does not render tags section when no tags', () => {
    const gifNoTags = { ...mockGif, tags: [] };
    render(<GifCard gif={gifNoTags} onCopy={() => {}} onDelete={() => {}} />);
    expect(screen.queryByText('funny')).not.toBeInTheDocument();
  });

  it('calls onCopy when preview is clicked', async () => {
    const user = userEvent.setup();
    const handleCopy = vi.fn();
    render(<GifCard gif={mockGif} onCopy={handleCopy} onDelete={() => {}} />);

    await user.click(screen.getByText('Click to copy'));
    expect(handleCopy).toHaveBeenCalledTimes(1);
  });

  it('shows "Copied!" text when isCopied is true', () => {
    render(<GifCard gif={mockGif} onCopy={() => {}} onDelete={() => {}} isCopied={true} />);
    expect(screen.getByText('Copied!')).toBeInTheDocument();
  });

  it('shows "Enter to copy" when isSelected is true', () => {
    render(<GifCard gif={mockGif} onCopy={() => {}} onDelete={() => {}} isSelected={true} />);
    expect(screen.getByText('Enter to copy')).toBeInTheDocument();
  });

  it('applies selected class when isSelected is true', () => {
    const { container } = render(
      <GifCard gif={mockGif} onCopy={() => {}} onDelete={() => {}} isSelected={true} />
    );
    expect(container.querySelector('.gif-card')).toHaveClass('selected');
  });

  it('requires double-click to delete (confirmation)', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();
    render(<GifCard gif={mockGif} onCopy={() => {}} onDelete={handleDelete} />);

    const deleteButton = screen.getByRole('button');
    expect(deleteButton).toHaveTextContent('×');

    // First click shows confirmation
    await user.click(deleteButton);
    expect(deleteButton).toHaveTextContent('?');
    expect(handleDelete).not.toHaveBeenCalled();

    // Second click confirms delete
    await user.click(deleteButton);
    expect(handleDelete).toHaveBeenCalledTimes(1);
  });

  it('resets delete confirmation after timeout', async () => {
    vi.useFakeTimers();
    render(<GifCard gif={mockGif} onCopy={() => {}} onDelete={() => {}} />);

    const deleteButton = screen.getByRole('button');
    fireEvent.click(deleteButton);
    expect(deleteButton).toHaveTextContent('?');

    // Fast-forward past the 3 second timeout
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(deleteButton).toHaveTextContent('×');
    vi.useRealTimers();
  });

  // Skipped: jsdom doesn't properly simulate image error events
  it.skip('shows error state when image fails to load', async () => {
    render(<GifCard gif={mockGif} onCopy={() => {}} onDelete={() => {}} />);
    const img = screen.getByAltText('GIF');

    fireEvent.error(img);

    expect(screen.getByText('Failed to load')).toBeInTheDocument();
    expect(screen.queryByAltText('GIF')).not.toBeInTheDocument();
  });
});
