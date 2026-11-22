import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExecutionTimelineWidget from '../components/ExecutionTimelineWidget';

describe('ExecutionTimelineWidget Unit Tests', () => {
  it('renders in Standby state when automation is not running', () => {
    render(<ExecutionTimelineWidget currentStage={0} automationRunning={false} t={{}} />);

    expect(screen.getByText('Standby')).toBeInTheDocument();
    expect(screen.getByText('Agent Execution Timeline')).toBeInTheDocument();
    expect(screen.getByText('Understanding user request')).toBeInTheDocument();
    expect(screen.getByText('Waiting for approval')).toBeInTheDocument();
  });

  it('renders in Live state when automation is actively running', () => {
    render(<ExecutionTimelineWidget currentStage={6} automationRunning={true} t={{}} />);

    expect(screen.getByText('Live')).toBeInTheDocument();
  });

  it('renders all 7 sequential timeline stages', () => {
    render(<ExecutionTimelineWidget currentStage={1} automationRunning={false} t={{}} />);

    const stageTitles = [
      'Understanding user request',
      'Finding relevant government service',
      'Checking eligibility',
      'Opening scholarship portal',
      'Filling application form',
      'Verifying details',
      'Waiting for approval'
    ];

    stageTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });
});
