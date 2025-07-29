import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnifiedAssessment } from '../UnifiedAssessment';
import { BrowserRouter } from 'react-router-dom';

// Mock the auth hook
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: '1', email: 'test@example.com' },
    loading: false
  })
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('UnifiedAssessment', () => {
  it('renders initial quick assessment form', () => {
    renderWithRouter(<UnifiedAssessment />);
    
    expect(screen.getByText('Quick Investment Score')).toBeInTheDocument();
    expect(screen.getByLabelText(/business idea/i)).toBeInTheDocument();
  });

  it('allows user to fill out quick assessment', async () => {
    renderWithRouter(<UnifiedAssessment />);
    
    const businessIdeaInput = screen.getByLabelText(/business idea/i);
    fireEvent.change(businessIdeaInput, { target: { value: 'My innovative startup idea' } });
    
    expect(businessIdeaInput).toHaveValue('My innovative startup idea');
  });

  it('shows continue button after filling basic fields', async () => {
    renderWithRouter(<UnifiedAssessment />);
    
    // Fill required fields
    fireEvent.change(screen.getByLabelText(/business idea/i), { 
      target: { value: 'Test idea' } 
    });
    fireEvent.change(screen.getByLabelText(/target market/i), { 
      target: { value: 'Test market' } 
    });
    
    await waitFor(() => {
      expect(screen.getByText(/continue to comprehensive/i)).toBeInTheDocument();
    });
  });
});