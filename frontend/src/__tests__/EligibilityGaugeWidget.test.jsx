import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import EligibilityGaugeWidget from '../components/EligibilityGaugeWidget';

describe('EligibilityGaugeWidget Unit Tests', () => {
  it('renders 0% Match and Awaiting Details when applicant profile is empty', () => {
    const emptyProfile = {
      name: '',
      annual_income: null,
      gpa_percentage: null,
      college_name: '',
      category: ''
    };

    render(<EligibilityGaugeWidget applicantProfile={emptyProfile} selectedScheme={null} t={{}} />);

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Awaiting Details')).toBeInTheDocument();
    expect(screen.getAllByText('Pending')).toHaveLength(4);
  });

  it('calculates 100% Statutorily Eligible when all criteria are satisfied', () => {
    const fullyEligibleProfile = {
      name: 'Priya Sharma',
      annual_income: 150000,
      gpa_percentage: 8.5,
      college_name: 'Delhi Technological University',
      category: 'OBC'
    };

    render(<EligibilityGaugeWidget applicantProfile={fullyEligibleProfile} selectedScheme={null} t={{}} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Statutorily Eligible')).toBeInTheDocument();
    expect(screen.getByText('₹1.5L')).toBeInTheDocument();
    expect(screen.getByText('8.5 CGPA')).toBeInTheDocument();
    expect(screen.getByText('Delhi Technological University')).toBeInTheDocument();
    expect(screen.getByText('OBC')).toBeInTheDocument();
  });

  it('calculates 70% Partially Qualified when income and college are verified but score is pending', () => {
    const partialProfile = {
      name: 'Rahul Verma',
      annual_income: 180000,
      gpa_percentage: null,
      college_name: 'IIT Delhi',
      category: 'General'
    };

    render(<EligibilityGaugeWidget applicantProfile={partialProfile} selectedScheme={null} t={{}} />);

    // 35 (income) + 20 (college) + 15 (category) = 70
    expect(screen.getByText('70%')).toBeInTheDocument();
    expect(screen.getByText('Partially Qualified')).toBeInTheDocument();
  });

  it('displays dynamic award amount from selectedScheme', () => {
    const scheme = {
      title: 'AICTE Pragati Scholarship for Girls',
      award_amount: '₹50,000 / year'
    };

    render(<EligibilityGaugeWidget applicantProfile={{}} selectedScheme={scheme} t={{}} />);

    expect(screen.getByText('AICTE Pragati Scholarship for Girls')).toBeInTheDocument();
    expect(screen.getByText(/₹50,000 \/ year/)).toBeInTheDocument();
  });
});
