import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import AddGifModal from './AddGifModal';

describe('AddGifModal', () => {
  it('renders the modal with form elements', () => {
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} />);

    expect(screen.getByRole('heading', { name: 'Add GIF' })).toBeInTheDocument();
    expect(screen.getByLabelText('GIF URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Tags')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add GIF' })).toBeInTheDocument();
  });

  it('has autofocus on URL input', () => {
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} />);
    expect(screen.getByLabelText('GIF URL')).toHaveFocus();
  });

  it('disables submit button when URL is empty', () => {
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Add GIF' })).toBeDisabled();
  });

  it('enables submit button when URL is provided', async () => {
    const user = userEvent.setup();
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/test.gif');

    expect(screen.getByRole('button', { name: 'Add GIF' })).toBeEnabled();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(<AddGifModal onAdd={() => {}} onClose={handleClose} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking overlay background', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const { container } = render(<AddGifModal onAdd={() => {}} onClose={handleClose} />);

    const overlay = container.querySelector('.modal-overlay');
    await user.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside the modal', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const { container } = render(<AddGifModal onAdd={() => {}} onClose={handleClose} />);

    const modal = container.querySelector('.modal');
    await user.click(modal);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onAdd with URL and parsed tags on submit', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<AddGifModal onAdd={handleAdd} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/test.gif');
    await user.type(screen.getByLabelText('Tags'), 'funny cat reaction');
    await user.click(screen.getByRole('button', { name: 'Add GIF' }));

    expect(handleAdd).toHaveBeenCalledWith('https://example.com/test.gif', ['funny', 'cat', 'reaction']);
  });

  it('trims whitespace from URL and tags', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<AddGifModal onAdd={handleAdd} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), '  https://example.com/test.gif  ');
    await user.type(screen.getByLabelText('Tags'), '  funny    cat  ');
    await user.click(screen.getByRole('button', { name: 'Add GIF' }));

    expect(handleAdd).toHaveBeenCalledWith('https://example.com/test.gif', ['funny', 'cat']);
  });

  it('filters out empty tags from extra spaces', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<AddGifModal onAdd={handleAdd} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/test.gif');
    await user.type(screen.getByLabelText('Tags'), 'funny     cat   ');
    await user.click(screen.getByRole('button', { name: 'Add GIF' }));

    expect(handleAdd).toHaveBeenCalledWith('https://example.com/test.gif', ['funny', 'cat']);
  });

  it('allows submitting with no tags', async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn();
    render(<AddGifModal onAdd={handleAdd} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/test.gif');
    await user.click(screen.getByRole('button', { name: 'Add GIF' }));

    expect(handleAdd).toHaveBeenCalledWith('https://example.com/test.gif', []);
  });

  it('shows preview when URL is entered', async () => {
    const user = userEvent.setup();
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/test.gif');

    const preview = screen.getByAltText('Preview');
    expect(preview).toHaveAttribute('src', 'https://example.com/test.gif');
  });

  it('shows error when preview fails to load', async () => {
    const user = userEvent.setup();
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/test.gif');
    const preview = screen.getByAltText('Preview');

    fireEvent.error(preview);

    expect(screen.getByText('Could not load preview')).toBeInTheDocument();
  });

  it('resets preview error when URL changes', async () => {
    const user = userEvent.setup();
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} />);

    await user.type(screen.getByLabelText('GIF URL'), 'https://example.com/bad.gif');
    fireEvent.error(screen.getByAltText('Preview'));
    expect(screen.getByText('Could not load preview')).toBeInTheDocument();

    await user.type(screen.getByLabelText('GIF URL'), 'x');

    expect(screen.queryByText('Could not load preview')).not.toBeInTheDocument();
    expect(screen.getByAltText('Preview')).toBeInTheDocument();
  });

  it('pre-fills URL field when initialUrl is a valid URL', () => {
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} initialUrl="https://example.com/test.gif" />);

    expect(screen.getByLabelText('GIF URL')).toHaveValue('https://example.com/test.gif');
    expect(screen.getByRole('button', { name: 'Add GIF' })).toBeEnabled();
  });

  it('leaves URL field empty when initialUrl is not a valid URL', () => {
    render(<AddGifModal onAdd={() => {}} onClose={() => {}} initialUrl="not a url" />);

    expect(screen.getByLabelText('GIF URL')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Add GIF' })).toBeDisabled();
  });
});
