import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TopHeader from '../components/TopHeader';
import Sidebar from '../components/Sidebar';
import ServicesCatalog from '../components/ServicesCatalog';

describe('TopHeader Component Unit Tests', () => {
  it('renders student/citizen welcome greeting and does not expose Browser Live Stream button', () => {
    render(<TopHeader studentName="Priya" t={{}} />);

    expect(screen.getByText(/Hello, Priya!/)).toBeInTheDocument();
    expect(screen.queryByText(/Browser Live Stream/i)).not.toBeInTheDocument();
  });

  it('allows language dropdown toggle', () => {
    const handleChangeLang = vi.fn();
    render(<TopHeader studentName="Priya" currentLang="en" onChangeLang={handleChangeLang} t={{}} />);

    const langBtn = screen.getByText('English');
    fireEvent.click(langBtn);

    // Hindi option should now be visible in dropdown
    const hindiOpt = screen.getByText(/हिंदी \(Hindi\)/);
    expect(hindiOpt).toBeInTheDocument();

    fireEvent.click(hindiOpt);
    expect(handleChangeLang).toHaveBeenCalledWith('hi');
  });
});

describe('Sidebar Component Unit Tests', () => {
  it('renders all primary navigation tabs', () => {
    const setActiveTab = vi.fn();
    render(<Sidebar activeTab="dashboard" setActiveTab={setActiveTab} t={{}} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Government Services')).toBeInTheDocument();
    expect(screen.getByText('Help & Support')).toBeInTheDocument();
  });

  it('triggers setActiveTab when navigation tab is clicked', () => {
    const setActiveTab = vi.fn();
    render(<Sidebar activeTab="dashboard" setActiveTab={setActiveTab} t={{}} />);

    fireEvent.click(screen.getByText('Government Services'));
    expect(setActiveTab).toHaveBeenCalledWith('services');

    fireEvent.click(screen.getByText('My Applications'));
    expect(setActiveTab).toHaveBeenCalledWith('applications');
  });
});

describe('ServicesCatalog Component Unit Tests', () => {
  const mockServices = [
    {
      id: 'nsp-pms-2026',
      title: 'Post-Matric Scholarship Scheme for College Students',
      department: 'Ministry of Education',
      category: 'Scholarship',
      description: 'Scholarship for college students',
      award_amount: '₹25,000 / year',
      deadline: '2026-12-31',
      portal_url: 'https://scholarships.gov.in'
    },
    {
      id: 'morth-dl-renewal-2026',
      title: 'Driving Licence Renewal (Parivahan)',
      department: 'Ministry of Road Transport & Highways',
      category: 'Transport & Mobility',
      description: 'Renew driving licence online',
      award_amount: 'Statutory Fee ₹200',
      deadline: '2027-12-31',
      portal_url: 'https://parivahan.gov.in'
    }
  ];

  it('renders all services in catalog', () => {
    render(<ServicesCatalog services={mockServices} onSelectScheme={vi.fn()} onStartWithScheme={vi.fn()} />);

    expect(screen.getByText(/Post-Matric Scholarship Scheme/)).toBeInTheDocument();
    expect(screen.getByText(/Driving Licence Renewal/)).toBeInTheDocument();
  });

  it('filters services based on search query', () => {
    render(<ServicesCatalog services={mockServices} onSelectScheme={vi.fn()} onStartWithScheme={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/Search scheme, ministry/i);
    fireEvent.change(searchInput, { target: { value: 'Transport' } });

    expect(screen.queryByText(/Post-Matric Scholarship Scheme/)).not.toBeInTheDocument();
    expect(screen.getByText(/Driving Licence Renewal/)).toBeInTheDocument();
  });

  it('filters services based on category pill click', () => {
    render(<ServicesCatalog services={mockServices} onSelectScheme={vi.fn()} onStartWithScheme={vi.fn()} />);

    const transportFilter = screen.getByRole('button', { name: 'Transport & Mobility' });
    fireEvent.click(transportFilter);

    expect(screen.queryByText(/Post-Matric Scholarship Scheme/)).not.toBeInTheDocument();
    expect(screen.getByText(/Driving Licence Renewal/)).toBeInTheDocument();
  });
});
