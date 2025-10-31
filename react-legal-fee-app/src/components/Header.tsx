import React from 'react';
import { SystemStats } from '../types';

interface HeaderProps {
  stats: SystemStats;
}

const Header: React.FC<HeaderProps> = ({ stats }) => {
  return (
    <div className="header">
      <h1>Confidential Legal Fee Allocation System</h1>
      <p>Privacy-preserving legal cost calculation platform powered by Zama FHE technology</p>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-number" id="totalCases">
            {stats.totalCases}
          </div>
          <div className="stat-label">Total Cases</div>
        </div>
        <div className="stat-item">
          <div className="stat-number" id="activeCases">
            {stats.activeCases}
          </div>
          <div className="stat-label">Active Cases</div>
        </div>
        <div className="stat-item">
          <div className="stat-number" id="settledCases">
            {stats.settledCases}
          </div>
          <div className="stat-label">Settled Cases</div>
        </div>
      </div>
    </div>
  );
};

export default Header;
