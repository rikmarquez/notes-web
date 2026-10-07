import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import NoteEditPage from '../../pages/NoteEditPage';
import notesService from '../../services/notesService';

jest.mock('react-quill', () => () => <div data-testid="quill" />);
jest.mock('react-quill/dist/quill.snow.css', () => ({}), { virtual: true });
jest.mock('../../components/Layout/Header', () => () => null);
jest.mock('../Attachments/AttachmentsSection', () => () => null);
jest.mock('../Tags/TagInput', () => () => null);
jest.mock('../../utils/markdownPaste', () => ({ attachMarkdownPaste: () => () => {} }));
jest.mock('../../utils/helpers', () => ({ getErrorMessage: (e) => String(e) }));
jest.mock('../../services/notesService', () => ({
  __esModule: true,
  default: { getNote: jest.fn(), updateNote: jest.fn(), createNote: jest.fn() }
}));

const note = { id: 7, title: 'Hola', summary: '', content: '', tags: [], is_private: false };

const renderPage = async () => {
  notesService.getNote.mockResolvedValue({ success: true, data: { note } });
  notesService.updateNote.mockResolvedValue({ success: true, data: { note } });
  render(
    <MemoryRouter initialEntries={['/note/7/edit']}>
      <Routes>
        <Route path="/note/:id/edit" element={<NoteEditPage />} />
        <Route path="/note/:id" element={<div>VIEW PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
  await act(async () => {});
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => { jest.useRealTimers(); jest.clearAllMocks(); });

test('auto-save persists and stays in the editor', async () => {
  await renderPage();
  const title = screen.getByLabelText(/Título/);
  title.focus();
  fireEvent.change(title, { target: { value: 'Hola mundo' } });

  await act(async () => { jest.advanceTimersByTime(30000); });
  await act(async () => {});

  expect(notesService.updateNote).toHaveBeenCalledTimes(1);
  expect(screen.queryByText('VIEW PAGE')).not.toBeInTheDocument();
  expect(screen.getByText(/Nota guardada automáticamente/)).toHaveClass('status-ok');
  expect(screen.getByLabelText(/Título/)).toHaveFocus();
  expect(screen.getByLabelText(/Título/)).not.toBeDisabled();
});

test('edits made during an in-flight auto-save are not marked as saved', async () => {
  await renderPage();
  let resolveUpdate;
  notesService.updateNote.mockReturnValue(new Promise((r) => { resolveUpdate = r; }));
  const title = screen.getByLabelText(/Título/);
  fireEvent.change(title, { target: { value: 'Hola mundo' } });

  await act(async () => { jest.advanceTimersByTime(30000); });
  expect(title).not.toBeDisabled();
  fireEvent.change(title, { target: { value: 'Hola mundo!' } });
  await act(async () => { resolveUpdate({ success: true, data: { note } }); });

  expect(screen.queryByText(/Nota guardada automáticamente/)).not.toBeInTheDocument();
  await act(async () => { jest.advanceTimersByTime(30000); });
  await act(async () => {});
  expect(notesService.updateNote).toHaveBeenCalledTimes(2);
  expect(notesService.updateNote.mock.calls[1][1].title).toBe('Hola mundo!');
  expect(screen.getByText(/Nota guardada automáticamente/)).toBeInTheDocument();
});

test('manual save still navigates to the note view', async () => {
  await renderPage();
  fireEvent.change(screen.getByLabelText(/Título/), { target: { value: 'Hola mundo' } });
  fireEvent.click(screen.getByText('Actualizar'));
  await act(async () => {});

  expect(notesService.updateNote).toHaveBeenCalledTimes(1);
  expect(screen.getByText('VIEW PAGE')).toBeInTheDocument();
});
