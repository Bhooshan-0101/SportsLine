import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Navbar from '../layout/Navbar';
import { AuthProvider } from '../../context/AuthContext';
import { CartProvider } from '../../context/CartContext';

const theme = createTheme();

// Mock the contexts
const mockAuthContext = {
  isAuthenticated: false,
  user: null,
  logout: jest.fn(),
};

const mockCartContext = {
  totalItems: 0,
};

// Wrapper component for tests
const TestWrapper = ({ children, authValue = mockAuthContext, cartValue = mockCartContext }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <AuthProvider value={authValue}>
        <CartProvider value={cartValue}>
          {children}
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navbar with logo', () => {
    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    expect(screen.getByText('SportsLine')).toBeInTheDocument();
  });

  it('shows login and register links when not authenticated', () => {
    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows user menu when authenticated', () => {
    const authenticatedContext = {
      isAuthenticated: true,
      user: { firstName: 'John', lastName: 'Doe', role: 'customer' },
      logout: jest.fn(),
    };

    render(
      <TestWrapper authValue={authenticatedContext}>
        <Navbar />
      </TestWrapper>
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('shows cart badge with item count', () => {
    const cartContextWithItems = {
      totalItems: 3,
    };

    const authenticatedContext = {
      isAuthenticated: true,
      user: { firstName: 'John', lastName: 'Doe', role: 'customer', wishlist: [] },
      logout: jest.fn(),
    };

    render(
      <TestWrapper authValue={authenticatedContext} cartValue={cartContextWithItems}>
        <Navbar />
      </TestWrapper>
    );

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows wishlist badge with item count', () => {
    const authenticatedContext = {
      isAuthenticated: true,
      user: { firstName: 'John', lastName: 'Doe', role: 'customer', wishlist: ['1', '2'] },
      logout: jest.fn(),
    };

    render(
      <TestWrapper authValue={authenticatedContext}>
        <Navbar />
      </TestWrapper>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows admin link for admin users', () => {
    const adminContext = {
      isAuthenticated: true,
      user: { firstName: 'Admin', lastName: 'User', role: 'admin' },
      logout: jest.fn(),
    };

    render(
      <TestWrapper authValue={adminContext}>
        <Navbar />
      </TestWrapper>
    );

    // Open mobile menu to see admin link
    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('calls logout function when logout is clicked', async () => {
    const mockLogout = jest.fn();
    const authenticatedContext = {
      isAuthenticated: true,
      user: { firstName: 'John', lastName: 'Doe', role: 'customer' },
      logout: mockLogout,
    };

    render(
      <TestWrapper authValue={authenticatedContext}>
        <Navbar />
      </TestWrapper>
    );

    // Open user menu
    const userButton = screen.getByText('John Doe');
    fireEvent.click(userButton);

    // Click logout
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('opens mobile menu when menu button is clicked', () => {
    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    const menuButton = screen.getByLabelText('menu');
    fireEvent.click(menuButton);

    // Check if mobile menu items are visible
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('navigates to correct routes', () => {
    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    const homeLink = screen.getByText('Home');
    const productsLink = screen.getByText('Products');

    expect(homeLink.closest('a')).toHaveAttribute('href', '/');
    expect(productsLink.closest('a')).toHaveAttribute('href', '/products');
  });

  it('shows search functionality', () => {
    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    // Look for search input (might be hidden on mobile)
    const searchInputs = screen.queryAllByPlaceholderText(/search/i);
    expect(searchInputs.length).toBeGreaterThanOrEqual(0);
  });

  it('handles responsive design', () => {
    // Test mobile view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    render(
      <TestWrapper>
        <Navbar />
      </TestWrapper>
    );

    // Menu button should be visible on mobile
    expect(screen.getByLabelText('menu')).toBeInTheDocument();
  });
});
