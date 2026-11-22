import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatSection from '../components/ChatSection';
import ApplicationsTracking from '../components/ApplicationsTracking';

describe('ChatSection Component Unit Tests', () => {
  it('renders chat message bubbles and header', () => {
    const messages = [
      { role: 'assistant', content: 'Namaste! How can I assist you today?' },
      { role: 'user', content: 'I need scholarship information.' }
    ];

    render(
      <ChatSection 
        messages={messages} 
        onSendMessage={vi.fn()} 
        onClearChat={vi.fn()} 
        t={{}} 
      />
    );

    expect(screen.getByText('Chat with CivicPilot')).toBeInTheDocument();
    expect(screen.getByText('Namaste! How can I assist you today?')).toBeInTheDocument();
    expect(screen.getByText('I need scholarship information.')).toBeInTheDocument();
  });

  it('triggers onClearChat when Clear Chat button is clicked', () => {
    const handleClear = vi.fn();
    render(
      <ChatSection 
        messages={[]} 
        onSendMessage={vi.fn()} 
        onClearChat={handleClear} 
        t={{}} 
      />
    );

    const clearBtn = screen.getByText('Clear Chat');
    fireEvent.click(clearBtn);
    expect(handleClear).toHaveBeenCalled();
  });

  it('triggers onOpenDocScanner when OCR scanner button is clicked', () => {
    const handleScanner = vi.fn();
    render(
      <ChatSection 
        messages={[]} 
        onSendMessage={vi.fn()} 
        onClearChat={vi.fn()} 
        onOpenDocScanner={handleScanner}
        t={{}} 
      />
    );

    const ocrBtn = screen.getByText(/AI Document Scanner \(OCR\)/);
    fireEvent.click(ocrBtn);
    expect(handleScanner).toHaveBeenCalled();
  });

  it('triggers onSendMessage when user types and submits form', () => {
    const handleSend = vi.fn();
    render(
      <ChatSection 
        messages={[]} 
        onSendMessage={handleSend} 
        onClearChat={vi.fn()} 
        t={{}} 
      />
    );

    const input = screen.getByPlaceholderText(/Type or speak/i);
    fireEvent.change(input, { target: { value: 'My income is 1.5 Lakhs' } });
    fireEvent.submit(input.closest('form'));

    expect(handleSend).toHaveBeenCalledWith('My income is 1.5 Lakhs');
  });
});

describe('ApplicationsTracking Component Unit Tests', () => {
  const mockApplications = [
    {
      id: 'app-001',
      reference_number: 'CP-20261121-ABC123',
      scheme_title: 'Post-Matric Scholarship Scheme 2026',
      applicant_name: 'Priya Sharma',
      college_name: 'Delhi Technological University',
      status: 'submitted',
      mode: 'live',
      receipt_data: { reference_number: 'NSP-987654' }
    },
    {
      id: 'app-002',
      reference_number: 'CP-20261121-XYZ789',
      scheme_title: 'Driving Licence Renewal',
      applicant_name: 'Rahul Verma',
      status: 'under_review',
      mode: 'live'
    }
  ];

  it('renders application records with official live submission badges and reference numbers', () => {
    render(<ApplicationsTracking applications={mockApplications} onOpenReceipt={vi.fn()} />);

    expect(screen.getByText('CP-20261121-ABC123')).toBeInTheDocument();
    expect(screen.getByText('CP-20261121-XYZ789')).toBeInTheDocument();
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('Rahul Verma')).toBeInTheDocument();
    expect(screen.getAllByText('Official Portal Submission')).toHaveLength(2);
  });

  it('filters applications list via search input', () => {
    render(<ApplicationsTracking applications={mockApplications} onOpenReceipt={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Search reference #, student name/i);
    fireEvent.change(searchInput, { target: { value: 'Driving Licence' } });

    expect(screen.queryByText('CP-20261121-ABC123')).not.toBeInTheDocument();
    expect(screen.getByText('CP-20261121-XYZ789')).toBeInTheDocument();
  });
});
