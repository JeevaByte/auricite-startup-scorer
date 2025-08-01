import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UnifiedAssessment from '@/pages/UnifiedAssessment';
import { AuthProvider } from '@/hooks/useAuth';
import { TooltipProvider } from '@/components/ui/tooltip';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } })
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { totalScore: 750, businessIdea: 80, financials: 75, team: 70, traction: 75 } })
    }
  }
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('UnifiedAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the assessment form', () => {
    const Wrapper = createWrapper();
    render(<UnifiedAssessment />, { wrapper: Wrapper });
    
    expect(screen.getByText(/Investment Readiness Assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/Let's assess your startup's investment readiness/i)).toBeInTheDocument();
  });

  it('displays all assessment steps', () => {
    const Wrapper = createWrapper();
    render(<UnifiedAssessment />, { wrapper: Wrapper });
    
    // Check if step navigation is present
    expect(screen.getByText(/Business Idea/i)).toBeInTheDocument();
    expect(screen.getByText(/Financials/i)).toBeInTheDocument();
    expect(screen.getByText(/Team/i)).toBeInTheDocument();
    expect(screen.getByText(/Traction/i)).toBeInTheDocument();
  });

  it('allows navigation between steps', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    render(<UnifiedAssessment />, { wrapper: Wrapper });
    
    // Navigate to next step
    const nextButton = screen.getByText(/Next/i);
    await user.click(nextButton);
    
    // Should show financials step
    await waitFor(() => {
      expect(screen.getByText(/Revenue Generation/i)).toBeInTheDocument();
    });
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    render(<UnifiedAssessment />, { wrapper: Wrapper });
    
    // Try to submit without filling required fields
    const submitButton = screen.getByText(/Submit Assessment/i);
    await user.click(submitButton);
    
    // Should show validation messages
    await waitFor(() => {
      expect(screen.getByText(/Please complete all required fields/i)).toBeInTheDocument();
    });
  });

  it('submits assessment and navigates to results', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    render(<UnifiedAssessment />, { wrapper: Wrapper });
    
    // Fill out all required fields in each step
    // Business Idea step
    const prototypeSelect = screen.getByRole('combobox');
    await user.click(prototypeSelect);
    await user.click(screen.getByText(/MVP/i));
    
    // Navigate through all steps and fill required fields
    const nextButton = screen.getByText(/Next/i);
    
    // Go to Financials
    await user.click(nextButton);
    const revenueYes = screen.getByLabelText(/Yes/i);
    await user.click(revenueYes);
    
    // Go to Team  
    await user.click(nextButton);
    const fullTimeYes = screen.getAllByLabelText(/Yes/i)[0];
    await user.click(fullTimeYes);
    
    // Go to Traction
    await user.click(nextButton);
    const termSheetsNo = screen.getByLabelText(/No/i);
    await user.click(termSheetsNo);
    
    // Submit
    const submitButton = screen.getByText(/Submit Assessment/i);
    await user.click(submitButton);
    
    // Should navigate to results
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/results', expect.any(Object));
    });
  });

  it('handles assessment submission errors gracefully', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    
    // Mock submission error
    vi.mocked(require('@/integrations/supabase/client').supabase.functions.invoke)
      .mockRejectedValueOnce(new Error('Submission failed'));
    
    render(<UnifiedAssessment />, { wrapper: Wrapper });
    
    // Fill out form and submit
    const submitButton = screen.getByText(/Submit Assessment/i);
    await user.click(submitButton);
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to submit assessment/i)).toBeInTheDocument();
    });
  });

  it('saves draft automatically', async () => {
    const user = userEvent.setup();
    const Wrapper = createWrapper();
    render(<UnifiedAssessment />, { wrapper: Wrapper });
    
    // Fill out some fields
    const prototypeSelect = screen.getByRole('combobox');
    await user.click(prototypeSelect);
    await user.click(screen.getByText(/MVP/i));
    
    // Wait for autosave (implementation dependent)
    await waitFor(() => {
      expect(localStorage.getItem('assessmentDraft')).toBeTruthy();
    }, { timeout: 3000 });
  });
});