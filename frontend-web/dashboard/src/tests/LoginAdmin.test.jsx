import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';

import LoginAdmin from '../page/LoginAdmin';
import { loginAdmin } from '../services/authService';
import api from '../services/api';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('HU-03 - Login administrador', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockNavigate.mockClear();
  });

  test('CP-HU03-F-01: guarda admin y token en sessionStorage después del login exitoso', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const mockResponse = {
      data: {
        user: {
          id: 1,
          correo: 'admin@saferoute.com',
          rol: 'admin',
        },
        token: 'fake-jwt-token',
      },
    };

    api.post.mockResolvedValue(mockResponse);

    const result = await loginAdmin('admin@saferoute.com', 'admin123');

    expect(api.post).toHaveBeenCalledWith('/api/auth/admin-login', {
      correo: 'admin@saferoute.com',
      password: 'admin123',
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      'admin',
      JSON.stringify({
        id: 1,
        correo: 'admin@saferoute.com',
        rol: 'admin',
      })
    );

    expect(setItemSpy).toHaveBeenCalledWith('token', 'fake-jwt-token');

    expect(sessionStorage.getItem('token')).toBe('fake-jwt-token');
    expect(sessionStorage.getItem('admin')).toBe(
      JSON.stringify({
        id: 1,
        correo: 'admin@saferoute.com',
        rol: 'admin',
      })
    );

    expect(result).toEqual(mockResponse.data);
  });

  test('CP-HU03-F-02: campo correo vacío muestra error de validación', async () => {
    render(
      <BrowserRouter>
        <LoginAdmin />
      </BrowserRouter>
    );

    const correoInput = screen.getByLabelText(/correo/i, { selector: 'input' });
    expect(correoInput).toBeInTheDocument();

    const passwordInput = screen.getByLabelText(/contraseña/i, {
      selector: 'input',
    });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El correo es obligatorio')).toBeInTheDocument();
    });

    expect(api.post).not.toHaveBeenCalled();
  });

  test('CP-HU03-F-03: debe iniciar sesión y redirigir al dashboard cuando las credenciales son válidas', async () => {
    api.post.mockResolvedValue({
      data: {
        user: {
          id: 1,
          correo: 'admin@saferoute.com',
          rol: 'admin',
        },
        token: 'fake-jwt-token',
      },
    });

    render(
      <BrowserRouter>
        <LoginAdmin />
      </BrowserRouter>
    );

    const correoInput = screen.getByLabelText(/correo/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/contraseña/i, {
      selector: 'input',
    });
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(correoInput, {
      target: { value: 'admin@saferoute.com' },
    });

    fireEvent.change(passwordInput, {
      target: { value: 'admin123' },
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/api/auth/admin-login', {
        correo: 'admin@saferoute.com',
        password: 'admin123',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(screen.queryByText(/error al iniciar sesión/i)).not.toBeInTheDocument();
  });
});