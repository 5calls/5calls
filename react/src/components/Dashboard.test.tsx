import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import fs from 'fs';
import path from 'path';
import * as d3 from 'd3';
import { Feature } from 'geojson';
import Dashboard from './Dashboard';
import {
  getUsaSummary,
  getLocationSummary,
  UsaSummaryData
} from '../utils/api';

// Mock the API calls
jest.mock('../utils/api', () => ({
  getUsaSummary: jest.fn(),
  getLocationSummary: jest.fn()
}));

const mockGetUsaSummary = getUsaSummary as jest.Mock;
const mockGetLocationSummary = getLocationSummary as jest.Mock;

const mockGetScreenCTM = jest.fn();
const mockCreateSVGPoint = jest.fn();

const mockTopoJson = {
  type: 'Topology',
  objects: {
    states: {
      type: 'GeometryCollection',
      geometries: [
        {
          type: 'Polygon',
          id: 'CA',
          properties: { name: 'California' },
          arcs: []
        },
        { type: 'Polygon', id: 'TX', properties: { name: 'Texas' }, arcs: [] }
      ]
    }
  },
  arcs: []
};

const mockUsaData: UsaSummaryData = {
  usa: {
    id: 'usa',
    name: 'USA',
    total: 1500,
    issueCounts: [
      {
        issue_id: 1,
        name: 'Climate Change',
        count: 1000,
        slug: 'climate',
        archived: false,
        total_count: 1000
      },
      {
        issue_id: 2,
        name: 'Healthcare',
        count: 500,
        slug: 'healthcare',
        archived: false,
        total_count: 500
      }
    ]
  },
  states: [
    {
      id: 'CA',
      name: 'California',
      total: 1000,
      issueCounts: [
        {
          issue_id: 1,
          name: 'Climate Change',
          count: 1000,
          slug: 'climate',
          archived: false,
          total_count: 1000
        }
      ]
    },
    {
      id: 'TX',
      name: 'Texas',
      total: 500,
      issueCounts: [
        {
          issue_id: 2,
          name: 'Healthcare',
          count: 500,
          slug: 'healthcare',
          archived: false,
          total_count: 500
        }
      ]
    }
  ]
};

// Loads the real dashboard HTML from the Hugo template.
function loadDashboardHtml(): string {
  const filePath = path.join(
    __dirname,
    '../../../layouts/dashboard/section.html'
  );
  let html = fs.readFileSync(filePath, 'utf8');
  // Strip Hugo template directives
  html = html.replace(/\{\{\s*define\s+"main"\s*\}\}/g, '');
  html = html.replace(/\{\{\s*end\s*\}\}/g, '');
  // Strip script tags to prevent JSDOM from executing external scripts
  html = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  return html;
}

describe('Dashboard Component Integration Tests', () => {
  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    // Stub getBoundingClientRect on Element prototype so D3 map label positioning checks
    // can evaluate coordinates correctly inside JSDOM (which otherwise defaults to all zeroes).
    window.Element.prototype.getBoundingClientRect = () =>
      ({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        top: 0,
        right: 800,
        bottom: 600,
        left: 0,
        toJSON: () => {}
      }) as DOMRect;

    // Stub missing JSDOM SVG layout APIs
    window.SVGElement.prototype.getBBox = () =>
      ({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        toJSON: () => {}
      }) as DOMRect;

    mockGetScreenCTM.mockImplementation(function (this: any) {
      const mockMatrix = {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        flipX: () => mockMatrix,
        flipY: () => mockMatrix,
        inverse: () => mockMatrix,
        multiply: () => mockMatrix,
        rotate: () => mockMatrix,
        rotateFromVector: () => mockMatrix,
        scale: () => mockMatrix,
        skewX: () => mockMatrix,
        skewY: () => mockMatrix,
        translate: () => mockMatrix
      } as unknown as DOMMatrix;
      return mockMatrix;
    });
    window.SVGElement.prototype.getScreenCTM = mockGetScreenCTM;

    mockCreateSVGPoint.mockImplementation(() => {
      const mockPoint = {
        x: 200,
        y: 200,
        matrixTransform: () => mockPoint
      } as unknown as DOMPoint;
      return mockPoint;
    });
    window.SVGSVGElement.prototype.createSVGPoint = mockCreateSVGPoint;

    // Stub D3 transitions to make them synchronous/instantaneous
    jest
      .spyOn(d3.selection.prototype as any, 'transition')
      .mockImplementation(function (this: any) {
        this.delay = () => this;
        this.duration = () => this;
        this.ease = () => this;
        this.on = (event: string, callback: any) => {
          if (event === 'end') {
            this.each(function (this: any) {
              callback.call(this);
            });
          }
          return this;
        };
        return this;
      });
  });

  beforeEach(() => {
    document.body.innerHTML = loadDashboardHtml();
    jest.clearAllMocks();
    localStorage.clear();

    // Mock global fetch to return our mock TopoJSON when loading the US atlas map
    window.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('us-atlas') || url.includes('10m.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTopoJson)
        } as Response);
      }
      return Promise.reject(new Error(`Unhandled fetch url: ${url}`));
    });
  });

  const verifyTopIssuesList = (
    listElementId: string,
    expectedIssues: Array<{
      name: string;
      count: number;
      countTextModifier: string;
      totalCountTextModifier: string;
      totalCount: number;
      slug: string;
    }>,
    totalCalls: number
  ) => {
    const topIssuesList = document.getElementById(listElementId)!;
    expect(topIssuesList).toBeInTheDocument();
    expect(topIssuesList.children.length).toBe(expectedIssues.length);

    expectedIssues.forEach((expected, index) => {
      const row = topIssuesList.children[index] as HTMLElement;
      const issueBtn = row.querySelector('button.issue_name')!;
      const statBtn = row.querySelector('.stat')!;
      const rowDetail = row.querySelector('.row_detail')!;

      expect(issueBtn).toHaveTextContent(expected.name);
      expect(statBtn).toHaveTextContent(
        `${expected.count.toLocaleString()} call${expected.count > 1 ? 's' : ''}`
      );

      // Verify initial collapsed accessibility attributes
      expect(issueBtn).toHaveAttribute('aria-expanded', 'false');
      expect(rowDetail).toHaveAttribute('aria-hidden', 'true');

      // Click the issue row to expand it
      fireEvent.click(issueBtn);

      // Verify expanded accessibility attributes and classes
      expect(issueBtn).toHaveAttribute('aria-expanded', 'true');
      expect(rowDetail).toHaveAttribute('aria-hidden', 'false');
      expect(rowDetail).toHaveClass('expanded');

      // Verify contents of the expanded section
      const expectedPercentage = ((expected.count / totalCalls) * 100).toFixed(
        1
      );
      expect(rowDetail).toHaveTextContent(
        `${expectedPercentage}% of ${expected.countTextModifier} calls in the last 7 days`
      );
      expect(rowDetail).toHaveTextContent(
        `${expected.totalCount.toLocaleString()} total calls ${expected.totalCountTextModifier}`
      );
      expect(rowDetail.querySelector('a')).toHaveAttribute(
        'href',
        `/issue/${expected.slug}`
      );
      expect(rowDetail.querySelector('a')).toHaveTextContent('Make this call');

      // Click the issue row to collapse it again
      fireEvent.click(issueBtn);

      // Verify collapsed attributes are updated
      expect(issueBtn).toHaveAttribute('aria-expanded', 'false');
      expect(rowDetail).not.toHaveClass('expanded');
    });
  };

  const verifyKeyboardTabNavigation = (
    buttonIds: string[],
    directionForward: 'ArrowRight' | 'ArrowDown' = 'ArrowRight',
    directionBackward: 'ArrowLeft' | 'ArrowUp' = 'ArrowLeft'
  ) => {
    const buttons = buttonIds.map((id) => document.getElementById(id)!);
    expect(buttons.every((btn) => btn !== null)).toBe(true);

    // Focus on the first tab
    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    // Press forward arrow key through each tab, checking focus and selection updates
    for (let i = 0; i < buttons.length; i++) {
      const currentBtn = buttons[i];
      const nextIndex = (i + 1) % buttons.length;
      const nextBtn = buttons[nextIndex];

      fireEvent.keyDown(currentBtn, {
        key: directionForward,
        code: directionForward
      });

      expect(document.activeElement).toBe(nextBtn);
      verifyActiveTabState(
        nextBtn,
        buttons.filter((btn) => btn !== nextBtn)
      );
    }

    // Focus on the last tab
    buttons[buttons.length - 1].focus();
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);

    // Press backward arrow key through each tab backwards
    for (let i = buttons.length - 1; i >= 0; i--) {
      const currentBtn = buttons[i];
      const prevIndex = (i - 1 + buttons.length) % buttons.length;
      const prevBtn = buttons[prevIndex];

      fireEvent.keyDown(currentBtn, {
        key: directionBackward,
        code: directionBackward
      });

      expect(document.activeElement).toBe(prevBtn);
      verifyActiveTabState(
        prevBtn,
        buttons.filter((btn) => btn !== prevBtn)
      );
    }
  };

  const verifyActiveTabState = (
    activeElement: HTMLElement,
    inactiveElements: HTMLElement[]
  ) => {
    expect(activeElement).toHaveClass('selected');
    expect(activeElement).toHaveAttribute('aria-selected', 'true');
    expect(activeElement).toHaveAttribute('tabindex', '0');

    inactiveElements.forEach((el) => {
      expect(el).not.toHaveClass('selected');
      expect(el).toHaveAttribute('aria-selected', 'false');
      expect(el).toHaveAttribute('tabindex', '-1');
    });
  };

  const renderDashboard = async () => {
    render(<Dashboard />, {
      container: document.getElementById('react-dashboard') || undefined
    });
    await waitFor(() => {
      expect(
        screen.queryByText('Loading the latest data...')
      ).not.toBeInTheDocument();
    });
  };

  it('should render an error message when USA summary data fails to load (null)', async () => {
    mockGetUsaSummary.mockResolvedValue(null);

    render(<Dashboard />, {
      container: document.getElementById('react-dashboard') || undefined
    });

    // Verify loading indicator is shown initially
    expect(screen.getByText('Loading the latest data...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();

    // Verify error message is rendered once loading finishes
    await waitFor(() => {
      const dashboardRoot = document.getElementById('react-dashboard')!;
      expect(dashboardRoot).toHaveTextContent('Error loading the dashboard');
      expect(dashboardRoot).toHaveTextContent('Please try again later');
    });

    // Verify the static content block remains hidden
    const dashboardContent = document.getElementById('dashboard-content');
    expect(dashboardContent).toHaveStyle('visibility: hidden');
  });

  it('should render the Nationwide tab by default when USA summary loads and there is no reps data', async () => {
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    await renderDashboard();

    const totalAll = document.getElementById('total_all');
    expect(totalAll).toHaveTextContent('1,500');

    // Verify "Nationwide" button tab is selected and has the correct state/classes
    const nationwideTabButton = document.getElementById('tab_usa')!;
    const repsTabButton = document.getElementById('tab_your_reps')!;
    verifyActiveTabState(nationwideTabButton, [repsTabButton]);

    // Verify correct panels are visible/hidden
    const cardUsa = document.getElementById('card_usa');
    const repsSection = document.getElementById('reps_section');
    expect(cardUsa).not.toHaveStyle('display: none');
    expect(repsSection).toHaveStyle('display: none');

    // Verify top five nationwide issues container is rendered
    const topIssuesList = document.getElementById('top_five_all_holder');
    expect(topIssuesList).toBeInTheDocument();

    // Verify that state details are hidden by default
    const stateTotalCard = document.getElementById('state_total_card');
    const stateDetail = document.getElementById('state_detail');
    expect(stateTotalCard).toHaveAttribute('hidden');
    expect(stateDetail).toHaveAttribute('hidden');
  });

  it('should switch to the "Your Reps" tab and show the location picker if clicked and reps data is missing', async () => {
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    await renderDashboard();

    // Verify "Your Reps" tab button is found and click it
    const repsTabButton = document.getElementById('tab_your_reps');
    expect(repsTabButton).toBeInTheDocument();
    fireEvent.click(repsTabButton!);

    // Verify "Your Reps" is now selected in top nav
    const nationwideTabButton = document.getElementById('tab_usa')!;
    verifyActiveTabState(repsTabButton!, [nationwideTabButton]);

    // Verify display styles of the panels
    const cardUsa = document.getElementById('card_usa');
    const repsSection = document.getElementById('reps_section');
    expect(cardUsa).toHaveStyle('display: none');
    expect(repsSection).not.toHaveStyle('display: none');

    // Verify that the location picker is shown (hidden attribute is removed)
    const locationPicker = document.getElementById('location_picker');
    expect(locationPicker).not.toHaveAttribute('hidden');

    // Verify that the location error is hidden
    const locationError = document.getElementById('location_error');
    expect(locationError).toHaveAttribute('hidden');
  });

  it('should switch top tabs and update aria attributes using arrow keys', async () => {
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    await renderDashboard();

    verifyKeyboardTabNavigation(['tab_usa', 'tab_your_reps']);
  });

  const mockRepsData = {
    reps: [
      {
        id: 'rep-123',
        name: 'Rep. Pelosi',
        phone: '123-456-7890',
        party: 'democrat' as const,
        state: 'CA',
        reason: 'Representative'
      }
    ],
    repsData: [
      {
        id: 'rep-123',
        total: 50,
        outcomes: [
          { result: 'contact' as const, count: 30 },
          { result: 'voicemail' as const, count: 20 }
        ],
        topIssues: [
          {
            issue_id: 1,
            name: 'Climate Change',
            count: 40,
            slug: 'climate',
            archived: false,
            total_count: 40
          },
          {
            issue_id: 2,
            name: 'Healthcare',
            count: 10,
            slug: 'healthcare',
            archived: false,
            total_count: 10
          }
        ],
        aggregatedResults: [
          { issue_id: 1, count: 40, time: Date.now() },
          { issue_id: 2, count: 10, time: Date.now() }
        ]
      }
    ]
  };

  it('should load "Your Reps" tab by default and display representative cards when district is stored in localStorage', async () => {
    localStorage.setItem('district', 'CA-12');
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    mockGetLocationSummary.mockResolvedValue(mockRepsData);

    await renderDashboard();
    // The reps card should be in the DOM
    expect(document.getElementById('card_rep-123')).toBeInTheDocument();

    // Verify "Your Reps" button tab is selected by default in the top navigation
    const repsTabButton = document.getElementById('tab_your_reps')!;
    const nationwideTabButton = document.getElementById('tab_usa')!;
    verifyActiveTabState(repsTabButton, [nationwideTabButton]);

    // Verify display styles of the panels
    const cardUsa = document.getElementById('card_usa');
    const repsSection = document.getElementById('reps_section');
    expect(cardUsa).toHaveStyle('display: none');
    expect(repsSection).not.toHaveStyle('display: none');

    // Verify the representative card content
    const repCard = document.getElementById('card_rep-123')!;
    expect(repCard).toHaveTextContent('Rep. Pelosi');
    expect(repCard).toHaveTextContent('50'); // total calls

    // Verify location picker and location error are hidden
    const locationPicker = document.getElementById('location_picker');
    const locationError = document.getElementById('location_error');
    expect(locationPicker).toHaveAttribute('hidden');
    expect(locationError).toHaveAttribute('hidden');

    // Verify top issues list container is rendered
    const topIssuesList = document.getElementById('rep-123_top');
    expect(topIssuesList).toBeInTheDocument();
  });

  it('should render the top issues list correctly and support expanding/collapsing details for Nationwide calls', async () => {
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    await renderDashboard();

    verifyTopIssuesList(
      'top_five_all_holder',
      [
        {
          name: 'Climate Change',
          count: 1000,
          countTextModifier: 'nationwide',
          totalCountTextModifier: 'nationwide',
          totalCount: 1000,
          slug: 'climate'
        },
        {
          name: 'Healthcare',
          count: 500,
          countTextModifier: 'nationwide',
          totalCountTextModifier: 'nationwide',
          totalCount: 500,
          slug: 'healthcare'
        }
      ],
      1500
    );
  });

  it("should render the top issues list correctly and support expanding/collapsing details for a representative's calls", async () => {
    localStorage.setItem('district', 'CA-12');
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    mockGetLocationSummary.mockResolvedValue(mockRepsData);

    await renderDashboard();
    expect(document.getElementById('card_rep-123')).toBeInTheDocument();

    verifyTopIssuesList(
      'rep-123_top',
      [
        {
          name: 'Climate Change',
          count: 40,
          countTextModifier: "Rep. Pelosi's",
          totalCountTextModifier: 'to Rep. Pelosi',
          totalCount: 40,
          slug: 'climate'
        },
        {
          name: 'Healthcare',
          count: 10,
          countTextModifier: "Rep. Pelosi's",
          totalCountTextModifier: 'to Rep. Pelosi',
          totalCount: 10,
          slug: 'healthcare'
        }
      ],
      50
    );
  });

  it("should render California's top issues list in the Nationwide tab when district is stored in localStorage", async () => {
    localStorage.setItem('district', 'CA-12');
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    mockGetLocationSummary.mockResolvedValue(mockRepsData);

    await renderDashboard();
    expect(document.getElementById('card_rep-123')).toBeInTheDocument();

    // Click on the Nationwide tab
    const nationwideTabButton = document.getElementById('tab_usa')!;
    fireEvent.click(nationwideTabButton);

    // Verify state cards are now visible
    const stateTotalCard = document.getElementById('state_total_card');
    const stateDetail = document.getElementById('state_detail');
    expect(stateTotalCard).not.toHaveAttribute('hidden');
    expect(stateDetail).not.toHaveAttribute('hidden');

    // Verify top issues list for California
    verifyTopIssuesList(
      'top_five_state_holder',
      [
        {
          name: 'Climate Change',
          count: 1000,
          countTextModifier: "California's",
          totalCountTextModifier: 'in California',
          totalCount: 1000,
          slug: 'climate'
        }
      ],
      1000
    );
  });

  const mockThreeRepsData = {
    reps: [
      {
        id: 'rep-1',
        name: 'Rep. Pelosi',
        phone: '123-456-7890',
        party: 'democrat' as const,
        state: 'CA',
        reason: 'Rep 1'
      },
      {
        id: 'rep-2',
        name: 'Sen. Feinstein',
        phone: '123-456-7891',
        party: 'democrat' as const,
        state: 'CA',
        reason: 'Sen 1'
      },
      {
        id: 'rep-3',
        name: 'Sen. Padilla',
        phone: '123-456-7892',
        party: 'democrat' as const,
        state: 'CA',
        reason: 'Sen 2'
      }
    ],
    repsData: [
      {
        id: 'rep-1',
        total: 30,
        outcomes: [{ result: 'contact' as const, count: 30 }],
        topIssues: [
          {
            issue_id: 1,
            name: 'Climate Change',
            count: 30,
            slug: 'climate',
            archived: false,
            total_count: 30
          }
        ],
        aggregatedResults: [{ issue_id: 1, count: 30, time: Date.now() }]
      },
      {
        id: 'rep-2',
        total: 20,
        outcomes: [{ result: 'contact' as const, count: 20 }],
        topIssues: [
          {
            issue_id: 2,
            name: 'Healthcare',
            count: 20,
            slug: 'healthcare',
            archived: false,
            total_count: 20
          }
        ],
        aggregatedResults: [{ issue_id: 2, count: 20, time: Date.now() }]
      },
      {
        id: 'rep-3',
        total: 10,
        outcomes: [{ result: 'contact' as const, count: 10 }],
        topIssues: [
          {
            issue_id: 1,
            name: 'Climate Change',
            count: 10,
            slug: 'climate',
            archived: false,
            total_count: 10
          }
        ],
        aggregatedResults: [{ issue_id: 1, count: 10, time: Date.now() }]
      }
    ]
  };

  it('should render representative sub-navigation tabs when multiple reps are loaded and switch contents on selection and arrow navigation', async () => {
    localStorage.setItem('district', 'CA-12');
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    mockGetLocationSummary.mockResolvedValue(mockThreeRepsData);

    await renderDashboard();
    expect(document.getElementById('card_rep-1')).toBeInTheDocument();

    // Verify sub-navigation buttons exist under the heading nav
    const subNav = document.getElementById('nav')!;
    expect(subNav).toBeInTheDocument();

    const tabRep1 = document.getElementById('tab_rep-1')!;
    const tabRep2 = document.getElementById('tab_rep-2')!;
    const tabRep3 = document.getElementById('tab_rep-3')!;

    expect(tabRep1).toHaveTextContent('Rep. Pelosi');
    expect(tabRep2).toHaveTextContent('Sen. Feinstein');
    expect(tabRep3).toHaveTextContent('Sen. Padilla');

    // Verify default active rep display panel: Rep 1 card exists and is shown,
    // and other rep cards do not exist yet (lazy rendering)
    const cardRep1 = document.getElementById('card_rep-1')!;
    expect(cardRep1).not.toHaveStyle('display: none');
    expect(document.getElementById('card_rep-2')).toBeNull();
    expect(document.getElementById('card_rep-3')).toBeNull();

    // Switch to second representative (Sen. Feinstein) using mouse click
    fireEvent.click(tabRep2);

    // Verify active panel switched: Rep 2 card is created and shown,
    // Rep 1 card is hidden, and Rep 3 card still does not exist
    const cardRep2 = document.getElementById('card_rep-2')!;
    expect(cardRep2).not.toHaveStyle('display: none');
    expect(cardRep1).toHaveStyle('display: none');
    expect(document.getElementById('card_rep-3')).toBeNull();

    // Verify active tab updates
    verifyActiveTabState(tabRep2, [tabRep1, tabRep3]);

    // Verify keyboard navigation across all 3 rep sub-tabs using the generic helper
    verifyKeyboardTabNavigation(['tab_rep-1', 'tab_rep-2', 'tab_rep-3']);
  });

  it('should switch map tabs and update aria attributes and DOM display using mouse clicks and keyboard arrow navigation', async () => {
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    await renderDashboard();

    const totalAll = document.getElementById('total_all');
    expect(totalAll).toHaveTextContent('1,500');

    const tabTopCalls = document.getElementById('tab_top_calls')!;
    const tabScaledCalls = document.getElementById('tab_scaled_calls')!;
    const tabTotalCalls = document.getElementById('tab_total_calls')!;

    const pathCA = document.getElementById('state_CA')!;
    const pathTX = document.getElementById('state_TX')!;

    // Initial state: Top Issue Mode
    const fillCATop = pathCA.getAttribute('fill');
    const fillTXTop = pathTX.getAttribute('fill');
    expect(fillCATop).toBeTruthy();
    expect(fillTXTop).toBeTruthy();

    expect(
      document.getElementById('state_map_key_box')!.querySelector('.title')
    ).toHaveTextContent('');
    expect(
      document.getElementById('state_footnote_scaled')
    ).not.toHaveAttribute('hidden');

    // Switch to Call Volumes (scaled calls) using mouse click
    fireEvent.click(tabScaledCalls);
    verifyActiveTabState(tabScaledCalls, [tabTopCalls, tabTotalCalls]);

    // Verify map renders different fill colors for scaled calls
    const fillCAScaled = pathCA.getAttribute('fill');
    const fillTXScaled = pathTX.getAttribute('fill');
    expect(fillCAScaled).not.toBe(fillCATop);
    expect(fillTXScaled).not.toBe(fillTXTop);

    expect(
      document.getElementById('state_map_key_box')!.querySelector('.title')
    ).toHaveTextContent('Calls per 1,000,000 people per state*');
    expect(
      document.getElementById('state_footnote_scaled')
    ).not.toHaveAttribute('hidden');

    // Switch to Total Calls using mouse click
    fireEvent.click(tabTotalCalls);
    verifyActiveTabState(tabTotalCalls, [tabScaledCalls, tabTopCalls]);

    // Verify map renders different fill colors for total calls
    const fillCATotal = pathCA.getAttribute('fill');
    const fillTXTotal = pathTX.getAttribute('fill');
    expect(fillCATotal).not.toBe(fillCAScaled);
    expect(fillCATotal).not.toBe(fillCATop);
    expect(fillTXTotal).not.toBe(fillTXScaled);
    expect(fillTXTotal).not.toBe(fillTXTop);

    expect(
      document.getElementById('state_map_key_box')!.querySelector('.title')
    ).toHaveTextContent('Total calls per state*');
    expect(document.getElementById('state_footnote_scaled')).toHaveAttribute(
      'hidden'
    );

    // Switch back to Top Issue mode to verify legend title updates
    fireEvent.click(tabTopCalls);
    verifyActiveTabState(tabTopCalls, [tabScaledCalls, tabTotalCalls]);
    expect(
      document.getElementById('state_map_key_box')!.querySelector('.title')
    ).toHaveTextContent('Top Issue Per State*');

    // Verify keyboard navigation across the 3 map tabs using our generic helper
    verifyKeyboardTabNavigation([
      'tab_top_calls',
      'tab_scaled_calls',
      'tab_total_calls'
    ]);
  });

  it('should select a state on map path pointer interaction and deselect on subsequent interaction', async () => {
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    mockCreateSVGPoint.mockClear();
    mockGetScreenCTM.mockClear();

    await renderDashboard();

    const pathCA = document.getElementById('state_CA')!;
    const stateTotalCard = document.getElementById('state_total_card')!;
    const stateDetail = document.getElementById('state_detail')!;
    const labelBox = document.getElementById('state_map_label')!;

    // Initial state: no selection detail containers or map labels are visible
    expect(stateTotalCard).toHaveAttribute('hidden');
    expect(stateDetail).toHaveAttribute('hidden');
    expect(labelBox).toHaveAttribute('hidden');

    // Click path to select California without bubbling to SVG zoom start listeners
    fireEvent(pathCA, new MouseEvent('pointerdown', { bubbles: false }));
    fireEvent(pathCA, new MouseEvent('pointerup', { bubbles: false }));

    // Verify SVG layout functions are called (proving drawStateLabel and updateStateLabelPosition executed)
    expect(mockCreateSVGPoint).toHaveBeenCalled();
    expect(mockGetScreenCTM).toHaveBeenCalled();

    // Verify California cards are rendered and visible
    expect(stateTotalCard).not.toHaveAttribute('hidden');
    expect(stateDetail).not.toHaveAttribute('hidden');
    expect(labelBox).not.toHaveAttribute('hidden');

    expect(labelBox.querySelector('.title')).toHaveTextContent('California');
    expect(labelBox.querySelector('.contents')).toHaveTextContent(
      'Climate Change'
    ); // Top issue is Climate Change

    // Click path again to deselect California without bubbling
    fireEvent(pathCA, new MouseEvent('pointerdown', { bubbles: false }));
    fireEvent(pathCA, new MouseEvent('pointerup', { bubbles: false }));

    // Verify label box is hidden again
    expect(labelBox).toHaveAttribute('hidden');
  });

  it('should initialize with a state selected from local storage and keep it selected when map transitions end', async () => {
    localStorage.setItem('district', 'CA-1');
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    mockGetLocationSummary.mockResolvedValue({ reps: [], repsData: [] });

    await renderDashboard();

    const stateSelect = document.getElementById(
      'state_select'
    ) as HTMLSelectElement;
    expect(stateSelect).toBeInTheDocument();

    // Verify California option is selected
    const selectedOption = stateSelect.options[stateSelect.selectedIndex];
    expect(selectedOption).toBeTruthy();
    expect(selectedOption.id).toBe('CA');
  });

  it('should expand/collapse issue rows only with valid activation events (Enter, Space, or Click) and ignore other keys', async () => {
    mockGetUsaSummary.mockResolvedValue(mockUsaData);
    await renderDashboard();

    const topIssuesList = document.getElementById('top_five_all_holder')!;
    expect(topIssuesList).toBeInTheDocument();

    const firstRow = topIssuesList.children[0] as HTMLElement;
    const issueBtn = firstRow.querySelector('button.issue_name')!;
    const rowDetail = firstRow.querySelector('.row_detail')!;

    // Initial state: collapsed
    expect(issueBtn).toHaveAttribute('aria-expanded', 'false');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'true');

    // 1. Try to trigger with an invalid key event (e.g., 'a' or ArrowRight)
    fireEvent.keyDown(issueBtn, { key: 'a', code: 'KeyA' });
    expect(issueBtn).toHaveAttribute('aria-expanded', 'false');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'true');

    fireEvent.keyDown(issueBtn, { key: 'ArrowRight', code: 'ArrowRight' });
    expect(issueBtn).toHaveAttribute('aria-expanded', 'false');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'true');

    // 2. Trigger with 'Enter' key event
    fireEvent.keyDown(issueBtn, { key: 'Enter', code: 'Enter' });
    expect(issueBtn).toHaveAttribute('aria-expanded', 'true');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'false');

    // 3. Try to collapse with an invalid key event (e.g. Escape)
    fireEvent.keyDown(issueBtn, { key: 'Escape', code: 'Escape' });
    expect(issueBtn).toHaveAttribute('aria-expanded', 'true');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'false');

    // 4. Trigger collapse with ' ' (Space) key event
    fireEvent.keyDown(issueBtn, { key: ' ', code: 'Space' });
    expect(issueBtn).toHaveAttribute('aria-expanded', 'false');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'true');

    // 5. Trigger expand with Click event
    fireEvent.click(issueBtn);
    expect(issueBtn).toHaveAttribute('aria-expanded', 'true');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'false');

    // 6. Trigger collapse with Click event
    fireEvent.click(issueBtn);
    expect(issueBtn).toHaveAttribute('aria-expanded', 'false');
    expect(rowDetail).toHaveAttribute('aria-hidden', 'true');
  });
});
