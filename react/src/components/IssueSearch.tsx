import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as Constants from '../common/constants';
import { Issue } from '../common/models/issue';
import { WithLocationProps } from '../state/locationState';
import { withLocation } from '../state/stateProvider';
import { postSearchTerm } from '../utils/api';
import { stateNameFromAbbr } from '../utils/stateNames';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface IssueSearchProps {}

interface SearchState {
  searchTerm: string;
  nationalIssues: Issue[];
  stateIssues: Record<string, Issue[]>;
  isLoading: boolean;
  isSearchFocused: boolean;
  hasSearched: boolean;
  hasLoggedSearch: boolean;
}

interface IssuesResponse {
  issues: Issue[];
  stateIssues: Record<string, Issue[]>;
}

const IssueSearch: React.FC<IssueSearchProps & WithLocationProps> = ({
  locationState
}) => {
  const [state, setState] = useState<SearchState>({
    searchTerm: '',
    nationalIssues: [],
    stateIssues: {},
    isLoading: false,
    isSearchFocused: false,
    hasSearched: false,
    hasLoggedSearch: false
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchIssues = async (): Promise<IssuesResponse> => {
    const response = await axios.get<IssuesResponse>(
      Constants.ISSUES_FOR_PUBLISHING_API_URL
    );
    return response.data;
  };

  const loadIssues = async () => {
    setState((prev) => {
      if (prev.hasSearched) return prev;
      return { ...prev, isLoading: true };
    });

    try {
      const response = await fetchIssues();
      setState((prev) => ({
        ...prev,
        nationalIssues: response.issues,
        stateIssues: response.stateIssues,
        isLoading: false,
        hasSearched: true
      }));
    } catch (error) {
      console.error('Failed to fetch issues:', error);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Load issues on mount if location is available, or when location becomes available
  useEffect(() => {
    if (locationState) {
      loadIssues();
    }
  }, [locationState]);

  // Listen for location loaded event and load issues immediately
  useEffect(() => {
    const handleLocationLoaded = () => {
      if (!state.hasSearched) {
        loadIssues();
      }
    };

    document.addEventListener(
      Constants.CUSTOM_EVENTS.LOCATION_LOADED,
      handleLocationLoaded
    );

    // Also load issues on mount if no location is set (fallback for users without location)
    const timer = setTimeout(() => {
      if (!locationState && !state.hasSearched) {
        loadIssues();
      }
    }, 100); // Reduced timeout since we have the event listener

    return () => {
      document.removeEventListener(
        Constants.CUSTOM_EVENTS.LOCATION_LOADED,
        handleLocationLoaded
      );
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    // Hide static issues list only when we have loaded dynamic issues or when actively searching
    const staticSection = document.querySelector('.i-bar-list-section');
    if (staticSection) {
      const shouldHide = (state.hasSearched && !state.isLoading) || state.searchTerm.length >= 3;
      (staticSection as HTMLElement).style.display = shouldHide ? 'none' : '';
    }
  }, [state.searchTerm, state.hasSearched, state.isLoading]);

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

  const handleSearchFocus = async () => {
    if (!state.isSearchFocused) {
      setState((prev) => ({ ...prev, isSearchFocused: true }));

      // Only load issues on focus if we don't have location
      if (!locationState && !state.hasSearched) {
        await loadIssues();
      }
    }
  };

  const handleSearchBlur = () => {
    // Don't hide search results on blur - keep them visible even when clicking outside
    // Results should remain visible until explicitly cleared or user starts a new search
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

  const getOrderedIssues = (): Issue[] => {
    const userState = locationState?.state;
    const userStateIssues = userState
      ? (state.stateIssues[userState] || []).filter(
          (issue) => !issue.hidden && issue.active
        )
      : [];
    const nationalIssues = state.nationalIssues.filter(
      (issue) => !issue.hidden && issue.active
    );

    // Return user's state issues first, then national issues (only active ones)
    return [...userStateIssues, ...nationalIssues];
  };

  const getIssueState = (issue: Issue): string | null => {
    // Check if this issue exists in any state's issue array
    for (const [stateAbbr, stateIssuesArray] of Object.entries(
      state.stateIssues
    )) {
      if (stateIssuesArray.some((stateIssue) => stateIssue.id === issue.id)) {
        return stateAbbr;
      }
    }
    return null; // It's a national issue
  };

  const renderIssueItem = (issue: Issue) => {
    const stateAbbr = getIssueState(issue);
    const stateName = stateAbbr ? stateNameFromAbbr(stateAbbr) : null;

    // Generate correct URL format: state issues use /state/<state name lowercase>/<slug>/, national issues use /issue/<slug>/
    const issueUrl = stateName
      ? `/state/${stateName.toLowerCase()}/${issue.slug}/`
      : `/issue/${issue.slug}/`;

    return (
      <a
        key={issue.id}
        className="i-bar-item is-unsorted"
        href={issueUrl}
        style={{ position: 'relative' }}
      >
        <div className="i-bar-item-check">
          <div className="i-bar-check-completed" data-issue-id={issue.id}>
            <i className="fa fa-phone"></i>
            <span className="sr-only">Needs your calls</span>
          </div>
        </div>
        <strong>{issue.name}</strong>
        {stateName && (
          <div className="i-bar-state-banner">
            {stateName}
          </div>
        )}
      </a>
    );
  };

  const filterIssues = (searchTerm: string): Issue[] => {
    if (!searchTerm || searchTerm.length < 3) {
      return [];
    }

    // Only search within user's state issues + national issues if location is available
    const userState = locationState?.state;
    const searchableIssues = userState
      ? [
          ...(state.stateIssues[userState] || []).filter(
            (issue) => !issue.hidden
          ),
          ...state.nationalIssues.filter((issue) => !issue.hidden)
        ]
      : state.nationalIssues.filter((issue) => !issue.hidden);

    const lowercaseSearch = searchTerm.toLowerCase();
    const filtered = searchableIssues.filter(
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
    return filtered
      .sort((a, b) => {
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
      })
      .slice(0, 10); // Limit to top 10 results
  };

  const filteredIssues = filterIssues(state.searchTerm);
  const orderedIssues = getOrderedIssues();
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

      {((shouldShowSearchResults && !state.isLoading) ||
        (!shouldShowSearchResults &&
          orderedIssues.length > 0 &&
          state.hasSearched)) && (
        <div className="i-bar-search-results">
          {shouldShowSearchResults ? (
            filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => renderIssueItem(issue))
            ) : (
              <div className="i-bar-search-no-results">
                No issues found matching &ldquo;{state.searchTerm}&rdquo;
              </div>
            )
          ) : (
            orderedIssues.map((issue) => renderIssueItem(issue))
          )}
        </div>
      )}
    </div>
  );
};

export default withLocation(IssueSearch);
