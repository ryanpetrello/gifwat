import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import GifGrid from './GifGrid';

const mockGifs = [
  { id: '1', url: 'https://example.com/1.gif', tags: ['funny'] },
  { id: '2', url: 'https://example.com/2.gif', tags: ['cat'] },
  { id: '3', url: 'https://example.com/3.gif', tags: ['dog'] },
];

describe('GifGrid', () => {
  it('renders all gifs', () => {
    render(
      <GifGrid
        gifs={mockGifs}
        onCopy={() => {}}
        onDelete={() => {}}
        copiedId={null}
        selectedIndex={-1}
      />
    );

    const images = screen.getAllByAltText('GIF');
    expect(images).toHaveLength(3);
  });

  it('renders empty grid when no gifs', () => {
    const { container } = render(
      <GifGrid
        gifs={[]}
        onCopy={() => {}}
        onDelete={() => {}}
        copiedId={null}
        selectedIndex={-1}
      />
    );

    expect(container.querySelector('.gif-grid')).toBeInTheDocument();
    expect(screen.queryByAltText('GIF')).not.toBeInTheDocument();
  });

  it('passes isCopied to the correct gif card', () => {
    render(
      <GifGrid
        gifs={mockGifs}
        onCopy={() => {}}
        onDelete={() => {}}
        copiedId="2"
        selectedIndex={-1}
      />
    );

    // The second card should show "Copied!"
    expect(screen.getByText('Copied!')).toBeInTheDocument();
    // Other cards should show "Click to copy"
    expect(screen.getAllByText('Click to copy')).toHaveLength(2);
  });

  it('passes isSelected to the correct gif card', () => {
    const { container } = render(
      <GifGrid
        gifs={mockGifs}
        onCopy={() => {}}
        onDelete={() => {}}
        copiedId={null}
        selectedIndex={1}
      />
    );

    const cards = container.querySelectorAll('.gif-card');
    expect(cards[0]).not.toHaveClass('selected');
    expect(cards[1]).toHaveClass('selected');
    expect(cards[2]).not.toHaveClass('selected');
  });

  it('calls onCopy with correct id and url when gif is clicked', async () => {
    const user = userEvent.setup();
    const handleCopy = vi.fn();

    render(
      <GifGrid
        gifs={mockGifs}
        onCopy={handleCopy}
        onDelete={() => {}}
        copiedId={null}
        selectedIndex={-1}
      />
    );

    const copyOverlays = screen.getAllByText('Click to copy');
    await user.click(copyOverlays[1]); // Click second gif

    expect(handleCopy).toHaveBeenCalledWith('2', 'https://example.com/2.gif');
  });

  it('calls onDelete with correct id', async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn();

    render(
      <GifGrid
        gifs={mockGifs}
        onCopy={() => {}}
        onDelete={handleDelete}
        copiedId={null}
        selectedIndex={-1}
      />
    );

    const deleteButtons = screen.getAllByRole('button');
    // Click twice for confirmation
    await user.click(deleteButtons[0]);
    await user.click(deleteButtons[0]);

    expect(handleDelete).toHaveBeenCalledWith('1');
  });
});
