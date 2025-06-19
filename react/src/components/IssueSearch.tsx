import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as Constants from '../common/constants';
import { Issue } from '../common/models/issue';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IssueSearchProps {}

interface SearchState {
  searchTerm: string;
  issues: Issue[];
  isLoading: boolean;
  isSearchFocused: boolean;
  hasSearched: boolean;
}

const IssueSearch: React.FC<IssueSearchProps> = () => {
  const [state, setState] = useState<SearchState>({
    searchTerm: '',
    issues: [],
    isLoading: false,
    isSearchFocused: false,
    hasSearched: false
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Toggle visibility of static issues list based on search term
    const staticSection = document.querySelector('.i-bar-list-section');
    if (staticSection) {
      const shouldHide = state.searchTerm.length >= 3;
      (staticSection as HTMLElement).style.display = shouldHide ? 'none' : '';
    }
  }, [state.searchTerm]);

  const fetchIssues = async (): Promise<Issue[]> => {
    const response = await axios.get<Issue[]>(Constants.ISSUES_API_URL);
    return response.data;
  };

  const handleSearchFocus = async () => {
    if (!state.isSearchFocused && !state.hasSearched) {
      setState((prev) => ({ ...prev, isSearchFocused: true, isLoading: true }));

      try {
        const issues = await fetchIssues();
        setState((prev) => ({
          ...prev,
          issues,
          isLoading: false,
          hasSearched: true
        }));
      } catch (error) {
        console.error('Failed to fetch issues:', error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    } else {
      setState((prev) => ({ ...prev, isSearchFocused: true }));
    }
  };

  const handleSearchBlur = () => {
    // Don't hide search results on blur - let users click elsewhere and return
    // Only hide if search is empty
    if (!state.searchTerm) {
      setTimeout(() => {
        setState((prev) => ({ ...prev, isSearchFocused: false }));
      }, 150);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setState((prev) => ({ ...prev, searchTerm }));
  };

  const clearSearch = () => {
    setState((prev) => ({
      ...prev,
      searchTerm: '',
      isSearchFocused: false
    }));
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  const filterIssues = (issues: Issue[], searchTerm: string): Issue[] => {
    if (!searchTerm || searchTerm.length < 3) {
      return [];
    }

    const lowercaseSearch = searchTerm.toLowerCase();
    return issues.filter(
      (issue) =>
        issue.name.toLowerCase().includes(lowercaseSearch) ||
        issue.reason.toLowerCase().includes(lowercaseSearch) ||
        issue.slug.toLowerCase().includes(lowercaseSearch)
    );
  };

  const filteredIssues = filterIssues(state.issues, state.searchTerm);
  const shouldShowSearchResults = state.searchTerm.length >= 3;

  return (
    <div className="i-bar-search">
      <div className="i-bar-search-input">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search all issues..."
          value={state.searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          className="i-bar-search-field"
        />
        {state.searchTerm && (
          <button
            className="i-bar-search-clear"
            onClick={clearSearch}
            type="button"
          >
            <i className="fa fa-times"></i>
          </button>
        )}
      </div>

      {state.isLoading && (
        <div className="i-bar-search-loading">
          <i className="fa fa-spinner fa-spin"></i>
          <span>Loading issues...</span>
        </div>
      )}

      {shouldShowSearchResults && !state.isLoading && (
        <div className="i-bar-search-results">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => (
              <a
                key={issue.id}
                className="i-bar-item is-unsorted"
                href={`/issue/${issue.slug}/`}
              >
                <div className="i-bar-item-check">
                  <div
                    className="i-bar-check-completed"
                    data-issue-id={issue.id}
                  >
                    <i className="fa fa-phone"></i>
                    <span className="sr-only">Needs your calls</span>
                  </div>
                </div>
                <strong>{issue.name}</strong>
              </a>
            ))
          ) : (
            <div className="i-bar-search-no-results">
              No issues found matching &ldquo;{state.searchTerm}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IssueSearch;
