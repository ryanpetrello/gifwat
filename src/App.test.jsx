import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/tauri';
import App from './App';

vi.mock('@tauri-apps/api/tauri');

const mockGifs = [
  { id: '1', url: 'https://example.com/funny.gif', tags: ['funny', 'reaction'] },
  { id: '2', url: 'https://example.com/cat.gif', tags: ['cat', 'animal'] },
  { id: '3', url: 'https://example.com/dog.gif', tags: ['dog'] },
];

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invoke.mockResolvedValue(mockGifs);
  });

  it('renders header with search bar and add button', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by URL or tag...')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
  });

  it('loads and displays gifs on mount', async () => {
    render(<App />);

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('get_gifs');
    });

    expect(screen.getAllByAltText('GIF')).toHaveLength(3);
  });

  it('shows empty state when no gifs', async () => {
    invoke.mockResolvedValue([]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No GIFs yet!')).toBeInTheDocument();
    });
    expect(screen.getByText('Click + to get started.')).toBeInTheDocument();
  });

  it('filters gifs by search query in URL', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByAltText('GIF')).toHaveLength(3);
    });

    await user.type(screen.getByPlaceholderText('Search by URL or tag...'), 'cat');

    expect(screen.getAllByAltText('GIF')).toHaveLength(1);
  });

  it('filters gifs by search query in tags', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByAltText('GIF')).toHaveLength(3);
    });

    await user.type(screen.getByPlaceholderText('Search by URL or tag...'), 'animal');

    expect(screen.getAllByAltText('GIF')).toHaveLength(1);
    expect(screen.getByText('cat')).toBeInTheDocument();
  });

  it('shows "No GIFs match" when search has no results', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByAltText('GIF')).toHaveLength(3);
    });

    await user.type(screen.getByPlaceholderText('Search by URL or tag...'), 'nonexistent');

    expect(screen.getByText('No GIFs match your search.')).toBeInTheDocument();
  });

  it('opens add modal when + button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '+' }));

    expect(screen.getByRole('heading', { name: 'Add GIF' })).toBeInTheDocument();
    expect(screen.getByLabelText('GIF URL')).toBeInTheDocument();
  });

  it('closes add modal when Cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByRole('heading', { name: 'Add GIF' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('heading', { name: 'Add GIF' })).not.toBeInTheDocument();
  });

  it('adds a new gif and closes modal', async () => {
    const user = userEvent.setup();
    invoke.mockImplementation((cmd) => {
      if (cmd === 'get_gifs') return Promise.resolve(mockGifs);
      if (cmd === 'add_gif') return Promise.resolve();
      return Promise.resolve();
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '+' }));
    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/new.gif');
    await user.type(screen.getByLabelText('Tags'), 'new test');
    await user.click(screen.getByRole('button', { name: 'Add GIF' }));

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('add_gif', {
        url: 'https://example.com/new.gif',
        tags: ['new', 'test'],
      });
    });

    expect(screen.queryByText('Add GIF')).not.toBeInTheDocument();
  });

  it('copies gif URL to clipboard', async () => {
    const user = userEvent.setup();
    invoke.mockImplementation((cmd) => {
      if (cmd === 'get_gifs') return Promise.resolve(mockGifs);
      if (cmd === 'copy_to_clipboard') return Promise.resolve();
      return Promise.resolve();
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByAltText('GIF')).toHaveLength(3);
    });

    const copyOverlays = screen.getAllByText('Click to copy');
    await user.click(copyOverlays[0]);

    expect(invoke).toHaveBeenCalledWith('copy_to_clipboard', {
      text: 'https://example.com/funny.gif',
    });
  });

  it('deletes a gif after confirmation', async () => {
    const user = userEvent.setup();
    invoke.mockImplementation((cmd) => {
      if (cmd === 'get_gifs') return Promise.resolve(mockGifs);
      if (cmd === 'delete_gif') return Promise.resolve();
      return Promise.resolve();
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByAltText('GIF')).toHaveLength(3);
    });

    const deleteButtons = screen.getAllByRole('button', { name: '×' });
    await user.click(deleteButtons[0]); // First click for confirmation
    await user.click(deleteButtons[0]); // Second click to delete

    await waitFor(() => {
      expect(invoke).toHaveBeenCalledWith('delete_gif', { id: '1' });
    });
  });

  it('handles case-insensitive search', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByAltText('GIF')).toHaveLength(3);
    });

    await user.type(screen.getByPlaceholderText('Search by URL or tag...'), 'CAT');

    expect(screen.getAllByAltText('GIF')).toHaveLength(1);
  });
});
