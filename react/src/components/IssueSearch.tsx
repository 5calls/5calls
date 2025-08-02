import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as Constants from '../common/constants';
import { Issue } from '../common/models/issue';
import { postSearchTerm } from '../utils/api';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IssueSearchProps {}

interface SearchState {
  searchTerm: string;
  issues: Issue[];
  isLoading: boolean;
  isSearchFocused: boolean;
  hasSearched: boolean;
  hasLoggedSearch: boolean;
}

const IssueSearch: React.FC<IssueSearchProps> = () => {
  const [state, setState] = useState<SearchState>({
    searchTerm: '',
    issues: [],
    isLoading: false,
    isSearchFocused: false,
    hasSearched: false,
    hasLoggedSearch: false
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

  // Debounced search term tracking
  useEffect(() => {
    if (state.searchTerm.length >= 3 && !state.hasLoggedSearch) {
      const timeoutId = setTimeout(() => {
        postSearchTerm(state.searchTerm);
        setState((prev) => ({ ...prev, hasLoggedSearch: true }));
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
    }
  }, [state.searchTerm, state.hasLoggedSearch]);

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
      isSearchFocused: false,
      hasLoggedSearch: false
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
    const filtered = issues.filter(
      (issue) =>
        issue.name.toLowerCase().includes(lowercaseSearch) ||
        issue.reason.toLowerCase().includes(lowercaseSearch) ||
        issue.script.toLowerCase().includes(lowercaseSearch) ||
        issue.slug.toLowerCase().includes(lowercaseSearch)
    );

    // Create word boundary regex for whole-word matching
    const wholeWordRegex = new RegExp(
      `\\b${lowercaseSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'i'
    );

    // Sort with enhanced prioritization
    return filtered.sort((a, b) => {
      // Check for whole-word matches in name
      const aNameWholeWord = wholeWordRegex.test(a.name);
      const bNameWholeWord = wholeWordRegex.test(b.name);

      // Check for any name matches (including partial)
      const aNameMatch = a.name.toLowerCase().includes(lowercaseSearch);
      const bNameMatch = b.name.toLowerCase().includes(lowercaseSearch);

      // Check for whole-word matches in any field
      const aAnyWholeWord =
        wholeWordRegex.test(a.name) ||
        wholeWordRegex.test(a.reason) ||
        wholeWordRegex.test(a.script) ||
        wholeWordRegex.test(a.slug);
      const bAnyWholeWord =
        wholeWordRegex.test(b.name) ||
        wholeWordRegex.test(b.reason) ||
        wholeWordRegex.test(b.script) ||
        wholeWordRegex.test(b.slug);

      // Priority order:
      // 1. Whole-word match in name
      // 2. Partial match in name
      // 3. Whole-word match in any field
      // 4. Partial match in any field

      if (aNameWholeWord && !bNameWholeWord) return -1;
      if (!aNameWholeWord && bNameWholeWord) return 1;

      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      if (aAnyWholeWord && !bAnyWholeWord) return -1;
      if (!aAnyWholeWord && bAnyWholeWord) return 1;

      return 0;
    });
  };

  const filteredIssues = filterIssues(state.issues, state.searchTerm);
  const shouldShowSearchResults = state.searchTerm.length >= 3;

  return (
    <div className="i-bar-search">
      <div className="i-bar-search-field">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search all issues..."
          value={state.searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          className="i-bar-search-input"
          maxLength={30}
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
