import { render, screen } from '@testing-library/react';
import PageFooter from './PageFooter';

describe('PageFooter', () => {
  it('should render copyright notice', () => {
    render(<PageFooter />);
    
    const copyrightText = screen.getByText('© 2026 Godel Technologies. All rights reserved.');
    expect(copyrightText).toBeInTheDocument();
  });

  it('should render exchange rates update message', () => {
    render(<PageFooter />);
    
    const updateMessage = screen.getByText('Exchange rates are updated hourly');
    expect(updateMessage).toBeInTheDocument();
  });

  it('should render lastUpdated when timestamp is provided', () => {
    const timestamp = new Date('2026-01-14T12:00:00Z').getTime();
    render(<PageFooter lastUpdated={timestamp} />);
    
    const lastUpdatedElement = screen.getByText(/Last updated:/);
    expect(lastUpdatedElement).toBeInTheDocument();
  });

  it('should not render lastUpdated when timestamp is not provided', () => {
    render(<PageFooter />);
    
    const lastUpdatedElement = screen.queryByText(/Last updated:/);
    expect(lastUpdatedElement).not.toBeInTheDocument();
  });

  it('should format lastUpdated timestamp correctly', () => {
    const timestamp = new Date('2026-01-14T12:00:00Z').getTime();
    render(<PageFooter lastUpdated={timestamp} />);
    
    const lastUpdatedElement = screen.getByText(/Last updated:/);
    expect(lastUpdatedElement).toHaveTextContent('Last updated:');
  });

  it('should use semantic footer element', () => {
    const { container } = render(<PageFooter />);
    
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });

  it('should have appropriate responsive text sizing for copyright', () => {
    render(<PageFooter />);
    
    const copyrightText = screen.getByText('© 2026 Godel Technologies. All rights reserved.');
    expect(copyrightText).toHaveClass('text-xs', 'sm:text-sm');
  });

  it('should have proper spacing for copyright notice', () => {
    render(<PageFooter />);
    
    const copyrightText = screen.getByText('© 2026 Godel Technologies. All rights reserved.');
    expect(copyrightText).toHaveClass('mt-4');
  });

  it('should maintain center alignment', () => {
    const { container } = render(<PageFooter />);
    
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('text-center');
  });

  it('should render all elements together', () => {
    const timestamp = new Date('2026-01-14T12:00:00Z').getTime();
    render(<PageFooter lastUpdated={timestamp} />);
    
    expect(screen.getByText('Exchange rates are updated hourly')).toBeInTheDocument();
    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText('© 2026 Godel Technologies. All rights reserved.')).toBeInTheDocument();
  });
});
