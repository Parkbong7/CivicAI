import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AvailableServices from '../components/AvailableServices';
import ApplicationPreviewWidget from '../components/ApplicationPreviewWidget';

describe('AvailableServices Component Unit Tests', () => {
  it('renders all 4 primary government service cards', () => {
    const handleSelect = vi.fn();
    const handleBrowse = vi.fn();

    render(<AvailableServices onSelectService={handleSelect} onBrowseAll={handleBrowse} t={{}} />);

    expect(screen.getByText('Scholarship Application')).toBeInTheDocument();
    expect(screen.getByText('Licence Renewal')).toBeInTheDocument();
    expect(screen.getByText('Subsidy Claim')).toBeInTheDocument();
    expect(screen.getByText('Other Services')).toBeInTheDocument();
  });

  it('triggers onSelectService with correct id when clicked', () => {
    const handleSelect = vi.fn();
    const handleBrowse = vi.fn();

    render(<AvailableServices onSelectService={handleSelect} onBrowseAll={handleBrowse} t={{}} />);

    fireEvent.click(screen.getByText('Licence Renewal'));
    expect(handleSelect).toHaveBeenCalledWith('licence');

    fireEvent.click(screen.getByText('Subsidy Claim'));
    expect(handleSelect).toHaveBeenCalledWith('subsidy');
  });

  it('triggers onBrowseAll when Browse All header link is clicked', () => {
    const handleSelect = vi.fn();
    const handleBrowse = vi.fn();

    render(<AvailableServices onSelectService={handleSelect} onBrowseAll={handleBrowse} t={{}} />);

    fireEvent.click(screen.getByText('Browse All'));
    expect(handleBrowse).toHaveBeenCalled();
  });
});

describe('ApplicationPreviewWidget Unit Tests', () => {
  it('renders default placeholder when profile is empty', () => {
    const handleReview = vi.fn();
    render(<ApplicationPreviewWidget applicantProfile={{}} onReviewDetails={handleReview} t={{}} />);

    expect(screen.getByText('Application Preview')).toBeInTheDocument();
    expect(screen.getByText('Student Scholarship Application')).toBeInTheDocument();
    expect(screen.getByText(/Awaiting Details/)).toBeInTheDocument();
  });

  it('renders applicant name, course and income when profile is provided', () => {
    const handleReview = vi.fn();
    const profile = {
      name: 'Amit Patel',
      course: 'B.Tech IT',
      annual_income: 200000
    };

    render(<ApplicationPreviewWidget applicantProfile={profile} onReviewDetails={handleReview} t={{}} />);

    expect(screen.getByText("Amit Patel's Scholarship")).toBeInTheDocument();
    expect(screen.getByText(/B\.Tech IT/)).toBeInTheDocument();
    expect(screen.getByText(/₹2,00,000\/year/)).toBeInTheDocument();
  });

  it('triggers onReviewDetails when review link is clicked', () => {
    const handleReview = vi.fn();
    render(<ApplicationPreviewWidget applicantProfile={{}} onReviewDetails={handleReview} t={{}} />);

    fireEvent.click(screen.getByText('Review Details'));
    expect(handleReview).toHaveBeenCalled();
  });
});
