import React, { useState, useEffect } from 'react';
import { getDonationStats } from '../utils/api';

interface FundraisingProgressProps {
  target?: number;
  current?: number;
  donateUrl?: string;
}

interface State {
  currentAmount: number;
  targetAmount: number;
}

const FundraisingProgress: React.FC<FundraisingProgressProps> = ({ 
  target = 100000, 
  current = 0,
  donateUrl = "https://secure.actblue.com/donate/5calls-state"
}) => {
  const [state, setState] = useState<State>({
    currentAmount: current,
    targetAmount: target
  });

  useEffect(() => {
    getDonationStats()
      .then((donationData) => {
        setState(prevState => ({
          ...prevState,
          currentAmount: donationData.total
        }));
      })
      .catch((error) => {
        console.error('Failed to fetch donation stats:', error);
        // Fallback to placeholder amount if API fails
        setState(prevState => ({
          ...prevState,
          currentAmount: 12500
        }));
      });
  }, []);

  const progressPercentage = Math.min((state.currentAmount / state.targetAmount) * 100, 100);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAmountClick = () => {
    window.open(donateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fundraising-progress">
      <div className="progress-header">
        <div className="progress-amounts">
          <a 
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="current-amount clickable-amount"
            onClick={(e) => {
              e.preventDefault();
              handleAmountClick();
            }}
          >
            {formatCurrency(state.currentAmount)}
          </a>
          <a 
            href={donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="target-amount clickable-amount"
            onClick={(e) => {
              e.preventDefault();
              handleAmountClick();
            }}
          >
            of {formatCurrency(state.targetAmount)} goal
          </a>
        </div>
        <div className="progress-percentage">{Math.round(progressPercentage)}%</div>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className="donate-button-container">
        <a 
          href={donateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="button donate-button"
        >
          Donate Now
        </a>
      </div>
    </div>
  );
};

export default FundraisingProgress;