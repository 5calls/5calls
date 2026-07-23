import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  getLocationSummary,
  getUsaSummary,
  RegionSummaryData,
  UsaSummaryData
} from '../utils/api';
import * as Constants from '../common/constants';
import {
  ExpandedRepData,
  getTopIssueData,
  processRepsData,
  getDistrictId
} from '../utils/dashboardData';
import {
  drawUsaPane,
  drawRepsPane,
  handleTabKeydown,
  themeColor,
  purple,
  themeAccentColor,
  defaultDarkColor,
  MAX_FOR_BEESWARM,
  BEESWARM_TARGET_WIDTH
} from '../utils/dashboardVisualizations';

const defaultUsa: RegionSummaryData = {
  id: 'usa',
  name: 'USA',
  total: 0,
  issueCounts: []
};
const defaultUsaSummary: UsaSummaryData = { usa: defaultUsa, states: [] };

const Dashboard: React.FC = () => {
  const [usaData, setUsaData] = useState<UsaSummaryData>(defaultUsaSummary);
  const [repsData, setRepsData] = useState<ExpandedRepData[]>([]);
  const [district, setDistrict] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const isDrawn = useRef(false);

  useEffect(() => {
    let active = true;

    async function requestDashboardData() {
      let districtId = getDistrictId(
        new URLSearchParams(window.location.search),
        window.localStorage
      );

      let usaSummaryData = null;
      let repsSummaryData = null;

      try {
        if (
          districtId === null ||
          districtId === undefined ||
          districtId.length === 0
        ) {
          usaSummaryData = await getUsaSummary().catch(() => null);
          districtId = '';
        } else {
          [usaSummaryData, repsSummaryData] = await Promise.all([
            getUsaSummary().catch(() => null),
            getLocationSummary(districtId).catch(() => null)
          ]);
        }
      } catch {
        if (active) {
          setIsError(true);
          setIsLoading(false);
        }
        return;
      }

      if (!active) return;

      if (usaSummaryData === null) {
        setIsError(true);
        setIsLoading(false);
        return;
      }

      const processedReps = processRepsData(repsSummaryData, MAX_FOR_BEESWARM);

      setUsaData(usaSummaryData);
      setRepsData(processedReps);
      setDistrict(districtId);
      setIsLoading(false);
    }

    requestDashboardData();

    // Sent by the location page.
    const handleUpdateReps = () => {
      // This is a bit of a hack; would be better to just pull in new
      // reps data, but first must detangle loading reps data from USA data.
      window.location.reload();
    };

    document.addEventListener(
      Constants.CUSTOM_EVENTS.UPDATE_REPS,
      handleUpdateReps
    );

    return () => {
      active = false;
      document.removeEventListener(
        Constants.CUSTOM_EVENTS.UPDATE_REPS,
        handleUpdateReps
      );
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (
      !usaData ||
      usaData.states.length === 0 ||
      !usaData.usa ||
      usaData.usa.total === 0
    ) {
      return;
    }

    if (isDrawn.current) return;
    isDrawn.current = true;

    const hasRepsData = repsData.length > 0;
    const duration = 'last 7 days';
    const { topIssueIds, issueIdToName } = getTopIssueData(usaData);

    // Use consistent coloring throughout the dashboard.
    const issueColor = d3
      .scaleOrdinal<number, string>([
        themeColor, // blue
        purple,
        '#66a61e', // bright green
        '#e7298a', // pink
        '#e6ab02', // yellow
        '#a6761d', // brown
        '#1b9e77', // teal
        themeAccentColor, // red
        defaultDarkColor
        // Now it repeats
      ])
      .domain(topIssueIds);

    interface TabData {
      index: number;
      name: string; // Visual name.
      id: string;
      selected: boolean;
      drawn: boolean; // Whether the contents are drawn.
      controls: string; // The tab panel ID that this aria-controls.
    }

    const top_tabs: TabData[] = [];
    top_tabs.push({
      index: 0,
      name: 'Your Reps',
      id: 'your_reps',
      selected: hasRepsData,
      drawn: false,
      controls: 'reps_section'
    });
    top_tabs.push({
      index: 1,
      name: 'Nationwide',
      id: 'usa',
      selected: !hasRepsData,
      drawn: false,
      controls: 'card_usa'
    });

    const tabs: TabData[] = [];
    if (repsData.length > 0) {
      let index = 0;
      repsData.forEach((r: ExpandedRepData) =>
        tabs.push({
          index: index++,
          name: r.repInfo.name,
          id: r.id,
          selected: false,
          drawn: false,
          controls: `card_${r.id}`
        })
      );
      tabs[0].selected = true;
    }

    const handleTopNavClick = function (_: any, newTab: TabData) {
      top_tabs.forEach((t) => (t.selected = false));
      newTab.selected = true;
      topNavButtons
        .attr('aria-selected', (t: TabData) => t.selected)
        .attr('tabindex', (t: TabData) => (t.selected ? 0 : -1))
        .attr('class', (t: TabData) => (t.selected ? 'selected' : null));
      if (newTab.id === 'usa') {
        d3.select('div#reps_section').style('display', 'none');
        d3.select(`div#card_usa.dashboard_card`).style('display', null);
        if (!top_tabs[1].drawn) {
          // TODO: lookup instead of index for less brittle.
          // Draw it the first time it is needed.
          // TODO: Check with PR, DC that this works as expected.
          let initialState: string | null = null;
          if (district && district.length > 0) {
            initialState = district.split('-')[0];
          }
          drawUsaPane(usaData, initialState, issueColor, duration);
          top_tabs[1].drawn = true;
        }
        d3.select('div#nav')
          .style('visibility', 'hidden')
          .attr('aria-hidden', true);
      } else {
        d3.select('div#reps_section').style('display', null);
        d3.select(`div#card_usa.dashboard_card`).style('display', 'none');
        d3.select('div#nav')
          .style('visibility', 'visible')
          .attr('aria-hidden', null);
        if (hasRepsData) {
          const selectedRepId = tabs.find(
            (t: TabData) => t.selected === true
          )!.id;
          d3.select(`div#card_${selectedRepId}.dashboard_card`).style(
            'display',
            null
          );
        } else if (district && district.length > 0) {
          document.getElementById('location_error')!.removeAttribute('hidden');
        } else {
          document.getElementById('location_picker')!.removeAttribute('hidden');
        }
      }
    };

    // Clean up any existing top nav buttons to prevent duplicates
    d3.select('div#topNav').selectAll('*').remove();

    const topNavButtons = d3
      .select('div#topNav')
      .selectAll('button')
      .data(top_tabs)
      .enter()
      .append('button')
      .attr('role', 'tab')
      .attr('aria-selected', (t: TabData) => t.selected)
      .attr('aria-controls', (t: TabData) => t.controls)
      .attr('tabindex', (t: TabData) => (t.selected ? 0 : -1))
      .attr('id', (t: TabData) => `tab_${t.id}`)
      .attr('class', (t: TabData) => (t.selected ? 'selected' : null))
      .html((t: TabData) => t.name)
      .on('keydown', function (event: KeyboardEvent, t: TabData) {
        handleTabKeydown(event, top_tabs, t.index, (e, tab) =>
          handleTopNavClick(e, tab)
        );
      });
    topNavButtons.on('click', handleTopNavClick);

    if (repsData.length) {
      const finalDate = Date.now();
      const beeswarmScale = d3
        .scaleTime()
        .domain([finalDate - 7 * 24 * 60 * 60 * 1000, finalDate])
        .range([25, BEESWARM_TARGET_WIDTH - 25])
        .nice();

      const handleRepTabClick = function (_: Event | null, newTab: TabData) {
        tabs.forEach((t) => (t.selected = false));
        newTab.selected = true;
        navButtons
          .attr('aria-selected', (t: TabData) => t.selected)
          .attr('aria-controls', (t: TabData) => t.controls)
          .attr('tabindex', (t: TabData) => (t.selected ? 0 : -1))
          .attr('id', (t: TabData) => `tab_${t.id}`)
          .attr('class', (t: TabData) => (t.selected ? 'selected' : null))
          .on('keydown', function (event: KeyboardEvent, t: TabData) {
            handleTabKeydown(event, tabs, t.index, (e, tab) =>
              handleRepTabClick(e, tab)
            );
          });
        d3.selectAll('div.dashboard_card').style('display', 'none');
        d3.select(`div#card_${newTab.id}.dashboard_card`).style(
          'display',
          null
        );
        // Ensure it's only drawn once.
        if (!newTab.drawn) {
          drawRepsPane(
            repsData.find((r) => r.id === newTab.id)!,
            district,
            beeswarmScale,
            issueColor,
            issueIdToName,
            duration
          );
          newTab.drawn = true;
        }
      };

      // Clean up any existing nav buttons to prevent duplicates
      d3.select('div#nav').selectAll('*').remove();

      const navButtons = d3
        .select('div#nav')
        .selectAll('button')
        .data(tabs)
        .enter()
        .append('button')
        .attr('role', 'tab')
        .attr('aria-selected', (t: TabData) => t.selected)
        .attr('class', (t: TabData) => (t.selected ? 'selected' : null))
        .html((t: TabData) => t.name);
      navButtons.on('click', handleRepTabClick);

      handleRepTabClick(null, tabs.find((t) => t.selected)!);
    }

    d3.selectAll('h2.subtitle_detail').html(`Total calls, ${duration}`);
    handleTopNavClick(null, top_tabs.find((t) => t.selected)!);
    d3.select('div#dashboard-content').style('visibility', 'visible');

    return () => {
      isDrawn.current = false;
      d3.select('div#topNav').selectAll('*').remove();
      d3.select('div#nav').selectAll('*').remove();
      d3.select('div#reps_section').selectAll('.dashboard_card').remove();
      d3.select('div#dashboard-content').style('visibility', 'hidden');
    };
  }, [isLoading, usaData, repsData, district]);

  if (
    !isLoading &&
    (isError ||
      usaData.states.length === 0 ||
      !usaData.usa ||
      usaData.usa.total === 0)
  ) {
    return (
      <div>
        <h2>Error loading the dashboard</h2>
        <p>Please try again later</p>
      </div>
    );
  }

  return (
    <div id="dashboard-react-wrapper">
      {isLoading && (
        <div>
          <h2>Loading the latest data...</h2>
          <div id="loader" aria-label="loading icon" role="status"></div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
