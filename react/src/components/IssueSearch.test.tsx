import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import IssueSearch from './IssueSearch';
import { Issue } from '../common/models/issue';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the state provider
jest.mock('../state/stateProvider', () => ({
  withLocation: (component: any) => component
}));

// Mock the API utility
jest.mock('../utils/api', () => ({
  postSearchTerm: jest.fn()
}));

// Mock state names utility
jest.mock('../utils/stateNames', () => ({
  stateNameFromAbbr: (abbr: string) => {
    const stateMap: Record<string, string> = {
      'CA': 'California',
      'TX': 'Texas',
      'NY': 'New York'
    };
    return stateMap[abbr] || abbr;
  }
}));

// Sample issues for testing
const mockIssues: Issue[] = [
  {
    id: 1,
    name: 'Climate Change Action',
    reason: 'Climate change is a critical issue requiring immediate action',
    script: 'Please support climate change legislation',
    slug: 'climate-change-action',
    hidden: false,
    active: true,
    contactType: '',
    contactAreas: [],
    categories: [],
    createdAt: '',
    outcomeModels: [],
    link: '',
    linkTitle: '',
    stats: {} as any
  },
  {
    id: 2,
    name: 'Healthcare Reform',
    reason: 'Healthcare costs are rising and need reform',
    script: 'Please support healthcare reform bill',
    slug: 'healthcare-reform',
    hidden: false,
    active: true,
    contactType: '',
    contactAreas: [],
    categories: [],
    createdAt: '',
    outcomeModels: [],
    link: '',
    linkTitle: '',
    stats: {} as any
  },
  {
    id: 3,
    name: 'Educational Funding',
    reason: 'Schools need more funding for climate education',
    script: 'Please increase educational funding',
    slug: 'educational-funding',
    hidden: false,
    active: true,
    contactType: '',
    contactAreas: [],
    categories: [],
    createdAt: '',
    outcomeModels: [],
    link: '',
    linkTitle: '',
    stats: {} as any
  },
  {
    id: 4,
    name: 'Tax Climate Incentives',
    reason: 'Tax incentives can help address climate issues',
    script: 'Please support tax incentives for climate action',
    slug: 'tax-climate-incentives',
    hidden: false,
    active: true,
    contactType: '',
    contactAreas: [],
    categories: [],
    createdAt: '',
    outcomeModels: [],
    link: '',
    linkTitle: '',
    stats: {} as any
  },
  {
    id: 5,
    name: 'Reform Immigration',
    reason: 'Immigration system needs comprehensive reform',
    script: 'Please support immigration reform',
    slug: 'reform-immigration',
    hidden: false,
    active: true,
    contactType: '',
    contactAreas: [],
    categories: [],
    createdAt: '',
    outcomeModels: [],
    link: '',
    linkTitle: '',
    stats: {} as any
  }
];

const mockApiResponse = {
  issues: mockIssues,
  stateIssues: {
    'CA': [{...mockIssues[0], id: 10}, {...mockIssues[1], id: 11}],
    'TX': [{...mockIssues[2], id: 12}]
  }
};

describe('IssueSearch Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockApiResponse });
    
    // Mock DOM querySelector for static section
    const mockElement = { style: { display: '' } };
    jest.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);
  });

  const renderComponent = (locationState?: any) => {
    const props = {
      locationState: locationState || null
    };
    return render(<IssueSearch {...props} />);
  };

  describe('Search Result Detection', () => {
    it('should find issues by exact title match', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'Climate Change Action' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        const issueNames = results.map(result => result.textContent);
        expect(issueNames.some(name => name?.includes('Climate Change Action'))).toBe(true);
      });
    });

    it('should find issues by partial title match', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'climate' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        const issueNames = results.map(result => result.textContent);
        expect(issueNames.some(name => name?.includes('Climate Change Action'))).toBe(true);
        expect(issueNames.some(name => name?.includes('Tax Climate Incentives'))).toBe(true);
      });
    });

    it('should find issues by whole word matches', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'reform' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        const issueNames = results.map(result => result.textContent);
        expect(issueNames.some(name => name?.includes('Healthcare Reform'))).toBe(true);
        expect(issueNames.some(name => name?.includes('Reform Immigration'))).toBe(true);
      });
    });

    it('should search in reason field', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'costs' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        const issueNames = results.map(result => result.textContent);
        expect(issueNames.some(name => name?.includes('Healthcare Reform'))).toBe(true);
      });
    });

    it('should search in script field', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'legislation' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        const issueNames = results.map(result => result.textContent);
        expect(issueNames.some(name => name?.includes('Climate Change Action'))).toBe(true);
      });
    });

    it('should be case insensitive', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'CLIMATE' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        const issueNames = results.map(result => result.textContent);
        expect(issueNames.some(name => name?.includes('Climate Change Action'))).toBe(true);
      });
    });
  });

  describe('Search Prioritization Logic', () => {
    it('should prioritize title matches first', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'climate' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        expect(results.length).toBeGreaterThan(0);
        
        // First result should be a title match (Climate Change Action or Tax Climate Incentives)
        const firstResult = results[0].textContent;
        expect(
          firstResult?.includes('Climate Change Action') || 
          firstResult?.includes('Tax Climate Incentives')
        ).toBe(true);
      });
    });

    it('should find whole word matches properly', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'tax' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        const issueNames = results.map(result => result.textContent);
        expect(issueNames.some(name => name?.includes('Tax Climate Incentives'))).toBe(true);
      });
    });
  });

  describe('Search Input Behavior', () => {
    it('should not show search results for queries shorter than 3 characters', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      
      // Clear the search first to ensure we're starting fresh
      fireEvent.change(searchInput, { target: { value: '' } });
      
      // Type short queries - these should not trigger search results mode
      fireEvent.change(searchInput, { target: { value: 'c' } });
      
      // The component should not show search-specific results for < 3 chars
      // But it may show the regular ordered issues list
      // We can check that no "no results" message appears
      expect(screen.queryByText(/No issues found matching/)).toBeNull();
      
      fireEvent.change(searchInput, { target: { value: 'cl' } });
      expect(screen.queryByText(/No issues found matching/)).toBeNull();
    });

    it('should show results for queries with 3 or more characters', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'cli' } });

      await waitFor(() => {
        const results = screen.queryAllByRole('link');
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it('should show "no results" message when no matches found', async () => {
      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'nonexistentterm' } });

      await waitFor(() => {
        expect(screen.getByText(/No issues found matching/)).toBeInTheDocument();
      });
    });

    it('should limit results to 10 or fewer', async () => {
      // Create many matching issues
      const manyIssues = Array.from({ length: 15 }, (_, i) => ({
        id: `${i + 20}`,
        name: `Climate Issue ${i + 1}`,
        reason: `Climate related reason ${i + 1}`,
        script: `Climate related script ${i + 1}`,
        slug: `climate-issue-${i + 1}`,
        hidden: false,
        active: true,
        completed: false,
        contacts: []
      }));

      mockedAxios.get.mockResolvedValue({ 
        data: { 
          issues: manyIssues, 
          stateIssues: {} 
        } 
      });

      renderComponent();
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'climate' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        expect(results.length).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('Location-based Search', () => {
    it('should include state issues when location is available', async () => {
      const locationState = { state: 'CA', district: '1' };
      renderComponent(locationState);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'climate' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        expect(results.length).toBeGreaterThan(0);
      });
    });

    it('should search only national issues when no location is available', async () => {
      renderComponent(null);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });

      const searchInput = screen.getByPlaceholderText('Search all issues...');
      fireEvent.change(searchInput, { target: { value: 'climate' } });

      await waitFor(() => {
        const results = screen.getAllByRole('link');
        expect(results.length).toBeGreaterThan(0);
      });
    });
  });
});