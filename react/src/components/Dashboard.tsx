import React from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Feature } from 'geojson';
import {
  getLocationSummary,
  getUsaSummary,
  IssueCountData,
  RegionSummaryData,
  UsaSummaryData
} from '../utils/api';
import * as Constants from '../common/constants';
import {
  BeeswarmCallCount,
  BeeswarmNode,
  ExpandedRepData,
  getPopulation,
  getTopIssueData,
  getUsaMapKeyData,
  processRepsData
} from '../utils/dashboardData';

// Dashboard state.
interface State {
  usaData: UsaSummaryData;
  repsData: ExpandedRepData[];
  district: string;
  isLoading: boolean;
  isError: boolean;
}

// Colors used by D3.
const themeColor = 'rgb(24, 117, 209)';
const purple = '#9467bd';
const themeAccentColor = '#ed3c1d';
const defaultColor = '#ccc';
const defaultDarkColor = '#666';
const selectedStateStroke = 'rgba(255, 217, 52)';

const USA_TOPOJSON = 'https://cdn.jsdelivr.net/npm/us-atlas@2/us/10m.json';
const MIN_FOR_BEESWARM = 7;
const MAX_FOR_SONIFICATION = 2000;
const MAX_FOR_BEESWARM = 6000;
const BEESWARM_TARGET_WIDTH = 600;
const SONFICATION_DURATION = 7; // In seconds.
const SCALED_POP_DENOMINATOR = 10000;

const drawStateLabel = (
  parentState: SVGGraphicsElement,
  stateName: string,
  contents: string,
  onClose: { (event: any): void }
) => {
  const labelBox = d3.select('div#state_map_label').attr('hidden', null);
  labelBox.select('div.title').html(stateName);
  labelBox.select('div.contents').html(contents);
  labelBox
    .select('button#close_label_btn')
    .on('click', function (event: Event) {
      onClose(event);
    });
  updateStateLabelPosition(parentState);
};

const updateStateLabelPosition = (parent: SVGGraphicsElement) => {
  // The state's bounding box.
  const boundingBox = parent.getBBox();
  const label = d3.select('div#state_map_label');
  const labelWidth = 200;
  // SVG's bounding box.
  const svgBb = parent.parentElement!.parentElement!.getBoundingClientRect();

  // State has no bounds because it's a territory like PR, VI, etc.
  // Show the label in the middle.
  if (boundingBox.width === 0 || boundingBox.height === 0) {
    label
      .style('top', `${svgBb.height / 2}px`)
      .style('left', `${(svgBb.width - labelWidth) / 2}px`)
      .classed('leftLabel', null)
      .classed('rightLabel', null);
    return;
  }

  // Thanks ChatGPT for the matrix conversion math.
  const matrix = parent.getScreenCTM()!;
  const point = parent.ownerSVGElement!.createSVGPoint();
  point.x = boundingBox.x + (1 / 2) * boundingBox.width;
  point.y = boundingBox.y + (1 / 2) * boundingBox.height;
  const screenCoords = point.matrixTransform(matrix);

  const holderBb = d3
    .select('div#state_map_content')
    .node()
    .getBoundingClientRect();
  const svgOffsetY = svgBb.y - holderBb.y;

  screenCoords.y += svgOffsetY - 24; // 24 has to do with where the < is on the label.

  if (labelWidth + screenCoords.x > svgBb.width) {
    label.classed('rightLabel', true);
    label.classed('leftLabel', null);
    screenCoords.x -= labelWidth + 24;
  } else {
    label.classed('rightLabel', null);
    label.classed('leftLabel', true);
    screenCoords.x += 24;
  }

  // Check it is within the drawing bounds, with some reasonable buffer.
  if (
    screenCoords.y + 24 > svgBb.height + svgOffsetY + svgBb.y ||
    screenCoords.y + 24 < svgBb.y + svgOffsetY ||
    screenCoords.x > svgBb.width - labelWidth / 2 ||
    screenCoords.x < -labelWidth / 2
  ) {
    label.attr('hidden', true);
  } else {
    label.attr('hidden', null);
  }

  const yCoord = screenCoords.y - svgBb.y;
  const xCoord = screenCoords.x - svgBb.x;
  label.style('top', `${yCoord}px`).style('left', `${xCoord}px`);
};

const drawStateResults = (
  allStateResults: RegionSummaryData[],
  state: string | null,
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  d3.select('div#state_detail').attr('hidden', state === null ? true : null);
  // TODO: Use D3 to transform rather than clearing and redrawing everything, for better performance
  // and also so animation doesn't always start at 0.
  d3.select('ol#top_five_state_holder').html('');
  const stateResults = allStateResults.find((d) => d.id === state);
  if (stateResults) {
    d3.selectAll('div#total_state').html(stateResults.total.toLocaleString());
    d3.selectAll('div#state_name_subtitle').html(stateResults.name);
    d3.select('div#state_total_card').attr('hidden', null);
  }
  if (!stateResults || stateResults.total === 0) {
    d3.select('h2#state_detail_title').html(
      `There were no calls in ${stateResults ? stateResults.name : state} recorded with 5 Calls, ${duration}`
    );
    if (!stateResults) {
      d3.select('div#state_total_card').attr('hidden', true);
    }
    return;
  }
  d3.select('h2#state_detail_title')
    .attr('class', 'detail_title')
    .html(`Most called issues in ${stateResults.name}, ${duration}`);
  if (!stateResults || stateResults.total === 0) {
    return;
  }
  drawTopFiveIssues(
    'ol#top_five_state_holder',
    stateResults.issueCounts,
    stateResults.id,
    `${stateResults.name}'s`,
    `in ${stateResults.name}`,
    duration,
    issueColor,
    stateResults.total,
    /* shouldShowBeeswarm= */ false
  );
};

const drawUsaPane = (
  usaData: UsaSummaryData,
  state: string | null,
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  const topIssues = usaData.usa.issueCounts
    ? usaData.usa.issueCounts.slice(0, 5)
    : [];
  d3.selectAll('div#total_all').html(usaData.usa.total.toLocaleString());
  drawTopFiveIssues(
    'ol#top_five_all_holder',
    topIssues,
    'usa',
    'nationwide',
    'nationwide',
    duration,
    issueColor,
    usaData.usa.total,
    /* shouldShowBeeswarm= */ false
  );
  drawStateResults(usaData.states, state, issueColor, duration);
  drawUsaMap(usaData.states, issueColor, state, duration, (new_state) => {
    drawStateResults(usaData.states, new_state, issueColor, duration);
  });
};

const drawTopFiveIssues = (
  holder: string,
  data: IssueCountData[],
  sectionId: string,
  countTextModifier: string,
  totalCountTextModifier: string,
  duration: string,
  issueColor: d3.ScaleOrdinal<number, string>,
  total: number,
  shouldShowBeeswarm: boolean
) => {
  const topFiveRow = d3
    .select(holder)
    .selectAll('li.top_five')
    .data(data)
    .enter()
    .append('li')
    .classed('top_five', true)
    .attr('id', (d: IssueCountData) => `top_five_${sectionId}_${d.issue_id}`);
  const rowContent = topFiveRow
    .append('div')
    .classed('top_five_item_holder', true)
    .attr(
      'title',
      (d: IssueCountData) =>
        `${((d.count / total) * 100).toFixed(1)}% of calls: ${d.name}`
    );
  const issueSection = rowContent
    .append('div')
    .attr('class', 'top_five_issue_row')
    .attr('id', (d: IssueCountData) => `issue_row_${sectionId}_${d.issue_id}`);

  const collapseIssueRow = (event: Event, d: IssueCountData) => {
    if (event instanceof KeyboardEvent) {
      if (
        (event.key === ' ' || event.key === 'Enter') &&
        event.target === this
      ) {
        event.preventDefault();
      } else {
        return;
      }
    }
    const row = d3.select(`li#top_five_${sectionId}_${d.issue_id}`);
    row
      .select('button.issue_name')
      .on('click', null)
      .on('keydown', null)
      .classed('short', true)
      .attr('aria-expanded', false)
      .transition()
      .delay(500)
      .attr('class', 'issue_name truncated')
      .on('end', () => {
        row
          .select('div.row_detail')
          .style('visibility', 'visible')
          .attr('aria-hidden', true);
        row.on('click', expandIssueRow).on('keydown', expandIssueRow);
      });
    row.select('div.row_detail').classed('expanded', null);
    event.stopPropagation();
  };

  const expandIssueRow = (event: Event, d: IssueCountData) => {
    if (event instanceof KeyboardEvent) {
      if (
        (event.key === ' ' || event.key === 'Enter') &&
        event.target === this
      ) {
        event.preventDefault();
      } else {
        return;
      }
    }
    const row = d3.select(`li#top_five_${sectionId}_${d.issue_id}`);
    row
      .select('button.issue_name')
      .classed('truncated', false)
      .attr('aria-expanded', true)
      .on('click', collapseIssueRow)
      .on('keydown', collapseIssueRow);
    row
      .select('div.row_detail')
      .attr('aria-hidden', false)
      .style('visibility', 'visible')
      .classed('expanded', true);
    event.stopPropagation();
  };

  const rowDetails = rowContent
    .append('div')
    .classed('row_detail', true)
    .attr('aria-hidden', true)
    .style('visibility', 'hidden');

  rowDetails
    .append('div')
    .html(
      (d: IssueCountData) =>
        `${((d.count / total) * 100).toFixed(1)}% of ${countTextModifier} calls in the ${duration}`
    );
  rowDetails
    .append('div')
    .html(
      (d: IssueCountData) =>
        `${d.total_count.toLocaleString()} total calls ${totalCountTextModifier}`
    );
  rowDetails.append('div').html((d: IssueCountData) => {
    if (d.archived) {
      // TODO: Add a link to the archive when possible.
      return 'This call is no longer active.';
    } else {
      return `<a href="/issue/${d.slug}">Make this call</a>`;
    }
  });

  issueSection
    .append('button')
    .classed('issue_name', true)
    .classed('truncated', true)
    .attr('aria-expanded', false)
    .html((d: IssueCountData) => `${d.name}`)
    .on('click', expandIssueRow)
    .on('keydown', expandIssueRow);

  // TODO: Show as text instead of button if not enough beeswarm.
  let stat;
  if (shouldShowBeeswarm) {
    stat = issueSection
      .append('button')
      .attr('title', 'Highlight these calls below');
  } else {
    stat = issueSection
      .append('div')
      .style('color', (d: IssueCountData) => issueColor(d.issue_id));
  }
  stat
    .attr('class', 'stat')
    .html(
      (d: IssueCountData) =>
        `${d.count.toLocaleString()} call${d.count > 1 ? 's' : ''}`
    );

  const issueBarSvg = rowContent
    .append('div')
    .attr('class', 'issue_bar_holder')
    .append('svg')
    .attr('width', '100%')
    .attr('height', '.5rem')
    .attr(
      'title',
      (d: IssueCountData) => `${((d.count / total) * 100).toFixed(1)}% of calls`
    );
  const issueBar = issueBarSvg.append('g').attr('aria-hidden', true);
  issueBar
    .append('rect')
    .attr('width', '100%')
    .attr('height', '.5rem')
    .attr('y', 0)
    .attr('x', 0)
    .attr('fill', defaultColor)
    .attr('stroke', '#555');
  issueBar
    .append('rect')
    .attr('width', 0)
    .attr('height', '.5rem')
    .attr('y', 0)
    .attr('x', 0)
    .attr('fill', (d: IssueCountData) => issueColor(d.issue_id))
    .transition()
    .delay(500)
    .duration(1000)
    .attr('width', (d: IssueCountData) => `${(d.count / total) * 100}%`);
};

const prepareMapKey = (
  maxTotal: number,
  minColor: string,
  maxColor: string,
  id: string,
  labelSuffix: string
): any => {
  const scaleColor = d3.scaleLinear([0, maxTotal], [minColor, maxColor]);
  const gradientHeight = 6;
  const keySvg = d3
    .select('div#state_map_key')
    .append('svg')
    .attr('id', id)
    .style('overflow', 'visible')
    .style('font-size', '1rem')
    .style('line-height', '1')
    .attr('height', `${gradientHeight}rem`)
    .style('float', 'left')
    .style('margin-right', '.5rem')
    .attr('title', `Values from 0 to ${maxTotal} calls`);
  const gradient = keySvg
    .append('linearGradient')
    .attr('id', `keyLinearGradient_${id}`)
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%');
  gradient.append('stop').attr('offset', '0%').attr('stop-color', maxColor);
  gradient.append('stop').attr('offset', '100%').attr('stop-color', minColor);
  keySvg
    .append('rect')
    .attr('width', '16px')
    .attr('height', '5rem')
    .attr('y', '0.5rem')
    .style('fill', `url(#keyLinearGradient_${id})`);
  keySvg
    .append('line')
    .attr('stroke', 'black')
    .attr('x1', 0)
    .attr('x2', 20)
    .attr('y1', '0.5rem')
    .attr('y2', '0.5rem');
  keySvg
    .append('line')
    .attr('stroke', 'black')
    .attr('x1', 0)
    .attr('x2', 20)
    .attr('y1', '3rem')
    .attr('y2', '3rem');
  keySvg
    .append('line')
    .attr('stroke', 'black')
    .attr('x1', 0)
    .attr('x2', 20)
    .attr('y1', '5.5rem')
    .attr('y2', '5.5rem');
  const maxText = keySvg
    .append('text')
    .attr('x', '24')
    .attr('y', 0)
    .attr('dy', '1rem')
    .attr('fill', 'black')
    .html(`${maxTotal.toLocaleString()} ${labelSuffix}`);
  keySvg
    .append('text')
    .attr('x', '24')
    .attr('y', `${gradientHeight / 2}rem`)
    .attr('dy', '.5rem')
    .attr('fill', 'black')
    .html(`${(maxTotal / 2).toLocaleString()} ${labelSuffix}`);
  keySvg
    .append('text')
    .attr('x', '24')
    .attr('y', `${gradientHeight}rem`)
    .attr('fill', 'black')
    .html(`0 ${labelSuffix}`);
  keySvg
    .attr('width', maxText.node().getBBox().width + 24)
    .style('display', 'none');
  return scaleColor;
};

const drawUsaMap = (
  statesResults: RegionSummaryData[],
  issueColor: d3.ScaleOrdinal<number, string>,
  initialState: string | null,
  duration: string,
  redrawStateResults: { (new_state: string): void }
) => {
  // Draw USA map
  d3.json(USA_TOPOJSON).then((usa: { objects: { states: any } }) => {
    // The data is the states loaded from the topojson file.
    const data: Feature[] = topojson.feature(usa, usa.objects.states).features;
    const territories: Feature[] = [
      {
        type: 'Feature',
        id: 'PR',
        properties: { name: 'Puerto Rico' },
        geometry: {
          type: 'Polygon',
          coordinates: [[]]
        }
      },
      {
        type: 'Feature',
        id: 'AS',
        properties: { name: 'American Samoa' },
        geometry: {
          type: 'Polygon',
          coordinates: [[]]
        }
      },
      {
        type: 'Feature',
        id: 'GU',
        properties: { name: 'Guam' },
        geometry: {
          type: 'Polygon',
          coordinates: [[]]
        }
      },
      {
        type: 'Feature',
        id: 'VI',
        properties: { name: 'Virgin Islands' },
        geometry: {
          type: 'Polygon',
          coordinates: [[]]
        }
      }
    ];
    data.push(...territories);
    // Alphabetize the states
    data.sort((a, b) => a.properties!.name.localeCompare(b.properties!.name));
    data.forEach((d) => {
      const stateResult = statesResults.find(
        (s) => s.name === d.properties!.name
      );
      if (stateResult) {
        d.id = stateResult.id;
      } else {
        // ID must not start with a number, which it does if the state data is missing and ID was not overwritten.
        d.id = '_' + d.id;
      }
    });

    const keyData = getUsaMapKeyData(statesResults, data);
    // Set up the key for the top issue tab.
    d3.select('div#state_map_key')
      .append('ol')
      .selectAll('.key')
      .data(keyData)
      .enter()
      .append('li')
      .attr('class', 'key')
      .style('border-color', (d: IssueCountData) => issueColor(d.issue_id))
      .html(
        (d: IssueCountData) =>
          `<b>${d.count} state${d.count == 1 ? '' : 's'}</b>: ${d.name}`
      );

    // Set up the key for the total calls tab.
    let maxTotal = statesResults.reduce((agg, row) => {
      if (row && row.total > agg) {
        agg = row.total;
      }
      return agg;
    }, 0);
    // Round the max to a round number.
    maxTotal = Math.ceil(maxTotal / 100) * 100;
    // Use colors linearly around `green`.
    const minColor = '#e3f6cf';
    const maxColor = '#488503';
    const totalColorScale = prepareMapKey(
      maxTotal,
      minColor,
      maxColor,
      'total',
      'calls'
    );

    // Set up key data for the scaled count per population tab.
    let maxScaledTotal =
      statesResults.reduce((agg, row) => {
        const population = getPopulation(row.id);
        if (row && population && row.total / population > agg) {
          agg = row.total / population;
        }
        return agg;
      }, 0) * SCALED_POP_DENOMINATOR;
    let scaledPopDenominator = SCALED_POP_DENOMINATOR;
    // If call counts are too low, scale up the denominator!
    if (maxScaledTotal != 0) {
      while (maxScaledTotal < 10) {
        scaledPopDenominator *= 10;
        maxScaledTotal *= 10;
      }
    }
    maxScaledTotal = Math.ceil(maxScaledTotal / 10) * 10;
    // Use colors linearly around `purple`
    const minScaledColor = '#d7d1de';
    const maxScaledColor = '#6319a8';
    const scaledColorScale = prepareMapKey(
      maxScaledTotal,
      minScaledColor,
      maxScaledColor,
      'scaled',
      `per ${scaledPopDenominator.toLocaleString()}`
    );

    const totalCallsPerStateClicked = () => {
      d3.select('button#tab_top_calls')
        .attr('tabindex', -1)
        .classed('selected', null)
        .attr('aria-selected', false);
      d3.select('button#tab_scaled_calls')
        .attr('tabindex', -1)
        .classed('selected', null)
        .attr('aria-selected', false);
      d3.select('button#tab_total_calls')
        .attr('tabindex', 0)
        .classed('selected', true)
        .attr('aria-selected', true);
      d3.select('#state_footnote_scaled').attr('hidden', true);
      const mapSection = d3.select('div#state_map_section');
      mapSection
        .select('div#state_map')
        .select('svg')
        .selectAll('path')
        .attr('fill', (d: Feature) => {
          const stateResult = statesResults.find((state) => state.id === d.id);
          const stateTotal = stateResult ? stateResult.total : 0;
          return totalColorScale(stateTotal);
        });
      mapSection
        .select('h2.detail_title')
        .html(`Total calls per state, ${duration}`);
      mapSection
        .select('div.description')
        .html(
          'The number of calls by state. Select a state in the dropdown for more details below.'
        );
      d3.select('div#state_map_key_box')
        .select('div.title')
        .html('Total calls per state*');
      d3.select('div#state_map_key').select('svg#total').style('display', null);
      d3.select('div#state_map_key')
        .select('svg#scaled')
        .style('display', 'none');
      d3.select('div#state_map_key').select('ol').style('display', 'none');

      if (selectedState) {
        const state_node = mapSection
          .select(`path#state_${selectedState}`)
          .node();
        const state_feature = data.find((s) => s.id === selectedState);
        const state_name = state_feature
          ? state_feature.properties!.name
          : 'Unknown';
        const state_results = statesResults.find((s) => s.id === selectedState);
        const total_calls = state_results ? state_results.total : 0;
        drawStateLabel(
          state_node,
          state_name,
          `${total_calls.toLocaleString()} call${total_calls == 1 ? '' : 's'}`,
          deselectState
        );
      }
    };

    const topCallPerStateClicked = () => {
      d3.select('button#tab_total_calls')
        .attr('tabindex', -1)
        .classed('selected', null)
        .attr('aria-selected', false);
      d3.select('button#tab_scaled_calls')
        .attr('tabindex', -1)
        .classed('selected', null)
        .attr('aria-selected', false);
      d3.select('button#tab_top_calls')
        .attr('tabindex', 0)
        .classed('selected', true)
        .attr('aria-selected', true);
      d3.select('#state_footnote_scaled').attr('hidden', true);

      d3.select('div#state_map_key_box')
        .select('div.title')
        .html('Top Issue Per State*');
      d3.select('div#state_map_key').select('ol').style('display', null);
      d3.select('div#state_map_key')
        .select('svg#total')
        .style('display', 'none');
      d3.select('div#state_map_key')
        .select('svg#scaled')
        .style('display', 'none');

      const mapSection = d3.select('div#state_map_section');
      mapSection
        .select('div#state_map')
        .select('svg')
        .selectAll('path')
        .attr('fill', (d: Feature) => {
          const stateResult = statesResults.find((state) => state.id === d.id);
          const stateTopIssues = stateResult ? stateResult.issueCounts : [];
          if (stateTopIssues && stateTopIssues.length > 0) {
            return issueColor(stateTopIssues[0].issue_id);
          }
          // Default grey for no calls at all.
          return defaultColor;
        });
      mapSection
        .select('h2.detail_title')
        .html(`Top issue per state, ${duration}`);
      mapSection
        .select('div.description')
        .html(
          'The most-called issue by state. Select a state in the dropdown for more details below.'
        );

      if (selectedState) {
        const state_node = mapSection
          .select(`path#state_${selectedState}`)
          .node();
        const state_feature = data.find((s) => s.id === selectedState);
        const state_name = state_feature
          ? state_feature.properties!.name
          : 'Unknown';
        const state_results = statesResults.find((s) => s.id === selectedState);
        const state_issues = state_results ? state_results.issueCounts : [];
        const topIssue =
          state_issues && state_issues.length > 0
            ? state_issues[0]
            : { name: 'No recorded calls' };
        console.error('draw state label');
        drawStateLabel(state_node, state_name, topIssue.name, deselectState);
      }
    };

    const scaledCallsPerStateClicked = () => {
      d3.select('button#tab_total_calls')
        .attr('tabindex', -1)
        .classed('selected', null)
        .attr('aria-selected', false);
      d3.select('button#tab_scaled_calls')
        .attr('tabindex', 0)
        .classed('selected', true)
        .attr('aria-selected', true);
      d3.select('button#tab_top_calls')
        .attr('tabindex', -1)
        .classed('selected', null)
        .attr('aria-selected', false);
      d3.select('#state_footnote_scaled').attr('hidden', null);

      const mapSection = d3.select('div#state_map_section');
      mapSection
        .select('div#state_map')
        .select('svg')
        .selectAll('path')
        .attr('fill', (d: Feature) => {
          const stateResult = statesResults.find((state) => state.id === d.id);
          const stateTotal = stateResult ? stateResult.total : 0;
          return scaledColorScale(
            (stateTotal / getPopulation(d.id)) * scaledPopDenominator
          );
        });
      mapSection
        .select('h2.detail_title')
        .html(
          `Calls per ${scaledPopDenominator.toLocaleString()} people, ${duration}`
        );
      mapSection
        .select('div.description')
        .html(
          `Calls per ${scaledPopDenominator.toLocaleString()} people by state. ` +
            `Select a state in the dropdown for more details below.`
        );
      d3.select('div#state_map_key_box')
        .select('div.title')
        .html(
          `Calls per ${scaledPopDenominator.toLocaleString()} people per state*`
        );
      d3.select('div#state_map_key')
        .select('svg#total')
        .style('display', 'none');
      d3.select('div#state_map_key')
        .select('svg#scaled')
        .style('display', null);
      d3.select('div#state_map_key').select('ol').style('display', 'none');

      if (selectedState) {
        const state_node = mapSection
          .select(`path#state_${selectedState}`)
          .node();
        const state_feature = data.find((s) => s.id === selectedState);
        const state_name = state_feature
          ? state_feature.properties!.name
          : 'Unknown';
        const state_results = statesResults.find((s) => s.id === selectedState);
        const total_calls = state_results ? state_results.total : 0;
        const scaledCalls = Math.round(
          (total_calls / getPopulation(selectedState)) * scaledPopDenominator
        );
        drawStateLabel(
          state_node,
          state_name,
          `${scaledCalls.toLocaleString()} call${scaledCalls == 1 ? '' : 's'} per ` +
            `${scaledPopDenominator.toLocaleString()} people`,
          deselectState
        );
      }
    };

    // Toggles between the three map tabs on arrow events.
    // TODO: Put map tabs into an array like other tabs to make this logic cleaner.
    const handleMapTabEvent = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        if (
          (event.target.id === 'tab_top_calls' && event.key === 'ArrowRight') ||
          (event.target.id === 'tab_total_calls' && event.key === 'ArrowLeft')
        ) {
          scaledCallsPerStateClicked();
          document.getElementById('tab_scaled_calls')?.focus();
        } else if (
          (event.target.id === 'tab_total_calls' &&
            event.key === 'ArrowRight') ||
          (event.target.id === 'tab_scaled_calls' && event.key === 'ArrowLeft')
        ) {
          topCallPerStateClicked();
          document.getElementById('tab_top_calls')?.focus();
        } else {
          totalCallsPerStateClicked();
          document.getElementById('tab_total_calls')?.focus();
        }
      }
    };

    d3.select('button#tab_top_calls')
      .on('click', topCallPerStateClicked)
      .on('keydown', handleMapTabEvent);
    d3.select('button#tab_total_calls')
      .on('click', totalCallsPerStateClicked)
      .on('keydown', handleMapTabEvent);
    d3.select('button#tab_scaled_calls')
      .on('click', scaledCallsPerStateClicked)
      .on('keydown', handleMapTabEvent);

    let selectedState: string | null = null;
    const width = 630;
    const height = 400;
    const svg = d3
      .select('div#state_map')
      .append('svg')
      .style('width', '100%')
      .style('height', 'auto')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr(
        'title',
        'Map showing states colored by top issue. Select a state above.'
      );

    const path = d3.geoPath();
    // Use the path to plot the US map based on the geometry data.
    const group = svg
      .append('g')
      .attr('width', width)
      .attr('height', '100%')
      .style('overflow', 'visible')
      // Hide from screen readers because full text is below, and in a div, and the map is redundant
      .attr('aria-hidden', true);

    // Add them to the dropdown.
    d3.select('select#state_select')
      .on('input', (event: Event) => {
        const selectElement = event.target as HTMLSelectElement;
        const state = selectElement.options[selectElement.selectedIndex].id;
        if (state !== 'none') {
          selectState(state);
        } else {
          deselectState();
        }
      })
      .selectAll('option')
      .data(data)
      .enter()
      .append('option')
      .attr('selected', (d: Feature) => (d.id === initialState ? 'true' : null))
      .attr('id', (d: Feature) => d.id)
      .html((d: Feature) => d.properties!.name);

    const deselectState = (event: Event | null = null) => {
      d3.select('div#state_map_label').attr('hidden', true);
      if (selectedState !== null) {
        d3.select('select#state_select')
          .selectAll('option')
          .attr('selected', null);
        group
          .select(`path#state_${selectedState}`)
          .transition()
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);
        selectedState = null;
        if (event) {
          event.stopPropagation();
        }
      }
    };

    const selectState = (state: string, event: Event | null = null) => {
      if (selectedState === state) {
        deselectState(event);
        return;
      }
      if (selectedState !== null) {
        deselectState(event);
      }
      d3.select('select#state_select')
        .selectAll(`option#${state}`)
        .attr('selected', true);
      selectedState = state;
      const state_path = group.select(`path#state_${selectedState}`);
      const state_node = state_path.node();
      // Bring to front.
      state_node.parentNode.appendChild(state_node);
      const state_feature = data.find((s) => s.id === selectedState);
      const state_name = state_feature
        ? state_feature.properties!.name
        : 'Unknown';
      const state_results = statesResults.find((s) => s.id === state);
      const total_calls = state_results ? state_results.total : 0;
      const state_issues = state_results ? state_results.issueCounts : [];
      const topIssue =
        state_issues && state_issues.length > 0
          ? state_issues[0]
          : { name: 'No recorded calls' };
      d3.select('div#state_map')
        .select('svg')
        .attr(
          'title',
          `${state}'s top: ${topIssue.name}. Map showing states colored by top issue. Select a state above.`
        );
      if (d3.select('button#tab_top_calls').attr('aria-selected') == 'true') {
        drawStateLabel(state_node, state_name, topIssue.name, deselectState);
      } else if (
        d3.select('button#tab_scaled_calls').attr('aria-selected') == 'true'
      ) {
        const scaledCalls = Math.round(
          (total_calls / getPopulation(state)) * scaledPopDenominator
        );
        drawStateLabel(
          state_node,
          state_name,
          `${scaledCalls.toLocaleString()} calls per ${scaledPopDenominator.toLocaleString()} people`,
          deselectState
        );
      } else {
        drawStateLabel(
          state_node,
          state_name,
          `${total_calls.toLocaleString()} calls`,
          deselectState
        );
      }
      state_path
        .transition()
        .attr('stroke', selectedStateStroke)
        .attr('stroke-width', 3);
      redrawStateResults(state);
    };

    // Draw the states
    group
      .selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('transform', `translate(0, 0) scale(0.66, 0.66)`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-linecap', 'round')
      .style('cursor', 'pointer')
      .attr('id', (d: Feature) => 'state_' + d.id)
      .attr('fill', defaultColor)
      .attr('d', path)
      .transition()
      .delay(500)
      .duration(1000)
      .attr('fill', (d: Feature) => {
        const stateResult = statesResults.find((state) => state.id === d.id);
        const stateTopIssues = stateResult ? stateResult.issueCounts : [];
        if (stateTopIssues && stateTopIssues.length > 0) {
          return issueColor(stateTopIssues[0].issue_id);
        }
        // Default grey for no calls at all.
        return defaultColor;
      })
      .on('end', function () {
        if (initialState !== null) {
          selectState(initialState);
        }
        // Track the state over which the pointer went down. If the pointer
        // goes up on the same state it went down on, that's a click.
        let pointerDownState: string = '';
        d3.select(this)
          .on('pointerover', function (event: Event, d) {
            if (selectedState === d.id) {
              return;
            }
            // Bring to front
            this.parentNode.appendChild(this);
            const state = d3.select(this);
            state.transition().attr('stroke', '#fff').attr('stroke-width', 2);
            if (selectedState !== null) {
              // Redraw on top.
              this.parentNode.appendChild(
                group.select(`path#state_${selectedState}`).node()
              );
            }
          })
          .on('pointerdown', function (event: Event, d: Feature) {
            pointerDownState = d.id;
          })
          .on('pointerup', function (event: Event, d: Feature) {
            if (pointerDownState === d.id) {
              selectState(d.id);
            }
            pointerDownState = '';
          })
          .on('pointerout', function (event: Event, d: Feature) {
            const state = d3.select(this);
            if (selectedState !== d.id) {
              state.transition().attr('stroke', '#fff').attr('stroke-width', 1);
            }
            if (selectedState !== null) {
              // Redraw on top.
              this.parentNode.appendChild(
                group.select(`path#state_${selectedState}`).node()
              );
            }
          });
      });

    svg.call(
      d3
        .zoom()
        .extent([
          [0, 0],
          [width, height]
        ])
        .translateExtent([
          [-width / 2, 0],
          [width * 2, height]
        ])
        .scaleExtent([1, 4])
        .on('zoom', zoomed)
    );

    function zoomed({ transform }: { transform: string }) {
      group.attr('transform', transform);
      if (selectedState !== null) {
        updateStateLabelPosition(
          group.select(`path#state_${selectedState}`).node()
        );
      }
    }
  });
};

const inBeeswarmRange = (count: number): boolean => {
  return count >= MIN_FOR_BEESWARM && count <= MAX_FOR_BEESWARM;
};

const drawRepsPane = (
  repData: ExpandedRepData,
  district: string,
  beeswarmScale: d3.ScaleTime<number, number>,
  issueColor: d3.ScaleOrdinal<number, string>,
  issueIdToName: { [key: number]: string },
  duration: string
) => {
  const repCard = d3
    .select('div#reps_section')
    .append('div')
    .attr('id', `card_${repData.id}`)
    .attr('class', 'dashboard_card')
    .attr('aria-labelledby', `tab_${repData.id}`)
    .attr('role', 'tabpanel');

  const leftSide = repCard.append('div');
  const totalCard = leftSide.append('div').attr('class', 'total_card');
  totalCard
    .append('h2')
    .attr('class', 'subtitle_detail')
    .html(`Total calls, ${duration}`);
  totalCard
    .append('div')
    .attr('class', 'highlight')
    .html(repData.total.toLocaleString());
  const totalSubtitle = totalCard.append('div').attr('class', 'subtitle');
  totalSubtitle
    .append('img')
    .attr('src', repData.repInfo.photoURL)
    .style('float', 'left')
    .attr('alt', '');
  const nameSubtitleSection = totalSubtitle
    .append('div')
    .style('overflow', 'hidden');
  const nameDiv = nameSubtitleSection
    .append('div')
    .attr('class', 'subtitle_main')
    .html(`${repData.repInfo.name}`)
    .node();
  let fontSize = 33;
  // Example long name case: FL-25's house rep.
  while (nameDiv.scrollWidth > nameDiv.clientWidth) {
    nameDiv.style.fontSize = `${fontSize--}px`;
  }
  let nameSubtitle =
    repData.repInfo.area === 'US House'
      ? 'House Representative'
      : repData.repInfo.area === 'US Senate'
        ? 'Senator'
        : repData.repInfo.area;
  if (repData.repInfo.party && repData.repInfo.party.length > 0) {
    nameSubtitle += ` (${repData.repInfo.party[0]}-${
      repData.repInfo.area === 'US House' ? district : repData.repInfo.state
    })`;
  } else {
    nameSubtitle += ` (${repData.repInfo.state})`;
  }
  nameSubtitleSection
    .append('div')
    .attr('class', 'subtitle_secondary')
    .html(nameSubtitle);

  const repDetail = repCard.append('div').attr('class', 'detail');
  if (repData.total == 0) {
    repDetail
      .append('div')
      .html(
        `There were no calls to ${repData.repInfo.name} recorded via 5 Calls, ${duration}. Make your voice heard: see <a href="/all">all active issues</a>.`
      );
    return;
  }

  // At this point, this rep does have at least 1 call made to them.

  repDetail
    .append('h2')
    .attr('class', 'detail_title')
    .html(`Most called issues for ${repData.repInfo.name}, ${duration}`);
  repDetail
    .append('div')
    .attr('class', 'description')
    .html(() => {
      let text = ''; //`The most-called issues for ${repData.repInfo.name} ${duration} from 5 Calls.`;
      if (inBeeswarmRange(repData.total)) {
        text += ' Select a call count to see it highlighted below.';
      }
      return text;
    });
  repDetail.append('ol').attr('id', `${repData.id}_top`);
  const topFiveHolderSelector = `ol#${repData.id}_top`;
  drawTopFiveIssues(
    topFiveHolderSelector,
    repData.topIssues,
    repData.id,
    `${repData.repInfo.name}'s`,
    `to ${repData.repInfo.name}`,
    duration,
    issueColor,
    repData.total,
    inBeeswarmRange(repData.total)
  );

  const pieSize = 80;
  const size = 60;
  const reachability = leftSide.append('div').attr('class', 'reachability');
  reachability.append('h2').attr('class', 'detail_title').html('Reachability');
  reachability
    .append('div')
    .attr('class', 'description')
    .style('margin-bottom', '10px')
    .html(`${repData.repInfo.name}'s availability, ${duration}.`);
  const callResultsGroup = reachability
    .append('svg')
    .attr('width', pieSize)
    .attr('height', pieSize)
    .attr('aria-hidden', true) // Empty alt text because this graphic is redundant with the percentages.
    .style('float', 'left')
    .style('align-content', 'center')
    .style('margin-right', '16px')
    .append('g')
    .attr('transform', `translate(${pieSize / 2}, ${pieSize / 2})`);
  callResultsGroup
    .append('path')
    .attr('fill', '#807dba')
    .attr('stroke', '#fff')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(`${size / 2}`)
        .outerRadius(`${pieSize / 2}`)
        .startAngle(0)
        .endAngle(2 * Math.PI * repData.percentContact)
    );
  callResultsGroup
    .append('path')
    .attr('fill', '#6a51a3')
    .attr('stroke', '#fff')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(`${size / 2}`)
        .outerRadius(`${pieSize / 2}`)
        .startAngle(2 * Math.PI * repData.percentContact)
        .endAngle(2 * Math.PI * (repData.percentVM + repData.percentContact))
    );
  callResultsGroup
    .append('path')
    .attr('fill', '#4a1486')
    .attr('stroke', '#fff')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(`${size / 2}`)
        .outerRadius(`${pieSize / 2}`)
        .startAngle(2 * Math.PI * (repData.percentVM + repData.percentContact))
        .endAngle(2 * Math.PI)
    );
  const resultsTextHolder = reachability
    .append('div')
    .attr('class', 'reachability_stats');
  resultsTextHolder
    .append('div')
    .html(
      `<span class="results_contact">${(repData.percentContact * 100).toFixed(0)}%</span> answered`
    );
  resultsTextHolder
    .append('div')
    .html(
      `<span class="results_vm">${(repData.percentVM * 100).toFixed(0)}%</span> voicemail`
    );
  resultsTextHolder
    .append('div')
    .html(
      `<span class="results_unavailable">${(repData.percentUnavailable * 100).toFixed(0)}%</span> unavailable`
    );

  // Draw beeswarm async so that it doesn't block rendering.
  window.setTimeout(() => {
    if (inBeeswarmRange(repData.total)) {
      repData.beeswarm = beeswarmForce()
        .y(300)
        .x((e: BeeswarmCallCount) => beeswarmScale(new Date(e.time * 1000))) // seconds since epoch --> ms
        .r(
          repData.total > 500
            ? 3
            : repData.total > 300
              ? 4
              : repData.total > 100
                ? 5
                : repData.total > 50
                  ? 6
                  : 10
        )(repData.callResults);
    }
    drawBeeswarm(
      repCard.append('div'),
      repData,
      beeswarmScale,
      issueIdToName,
      issueColor,
      duration
    );

    const onIssueSelected = function (event: Event, d: IssueCountData) {
      if (event instanceof KeyboardEvent) {
        if (
          (event.key === ' ' || event.key === 'Enter') &&
          event.target === this
        ) {
          event.preventDefault();
        } else {
          return;
        }
      } else if (event.target === this) {
        event.stopPropagation();
      }
      if (selectedIssueId === d.issue_id) {
        repData.beeswarm.forEach((b) => (b.data.selected = false));
        // deselect
        selectedIssueId = null;
        d3.select(this)
          .classed('selected', false)
          .style('background-color', null)
          .style('color', issueColor(d.issue_id))
          .attr('aria-pressed', false);
        d3.select(`svg#beeswarm_svg_${repData.id}`)
          .selectAll('circle')
          .data(
            repData.beeswarm,
            (b: BeeswarmNode<BeeswarmCallCount>) => b.data.id
          )
          .transition()
          .delay(0)
          .style('fill', (d: BeeswarmNode<BeeswarmCallCount>) =>
            d.data.selected ? issueColor(d.data.issue_id) : defaultColor
          );
        d3.select(`div#dot_key_${repData.id}`).style('display', 'none');
      } else {
        // select
        selectedIssueId = d.issue_id;
        repData.beeswarm.forEach(
          (b) => (b.data.selected = b.data.issue_id === selectedIssueId)
        );
        // Ensure everything else is deselected visually.
        d3.select(topFiveHolderSelector)
          .selectAll('button.stat')
          .classed('selected', false)
          .style('background-color', null)
          .style('color', (i) => issueColor(i.issue_id))
          .attr('aria-pressed', false);
        // Select just this one visually.
        d3.select(this)
          .classed('selected', true)
          .style('background-color', issueColor(d.issue_id))
          .style('color', null)
          .attr('aria-pressed', true);
        d3.select(`svg#beeswarm_svg_${repData.id}`)
          .selectAll('circle')
          .data(
            repData.beeswarm,
            (b: BeeswarmNode<BeeswarmCallCount>) => b.data.id
          )
          .transition()
          .delay(0)
          .style('fill', (d: BeeswarmNode<BeeswarmCallCount>) =>
            d.data.selected ? issueColor(d.data.issue_id) : defaultColor
          );
        d3.select(`div#dot_key_${repData.id}`)
          .style('display', null)
          .style('--dot-color', issueColor(d.issue_id))
          .html(
            `A call for <i>${repData.topIssues.find((i) => i.issue_id === d.issue_id)?.name}</i>`
          );
      }
    };

    // Only show beeswarm if there's enough calls.
    let selectedIssueId: number | null = repData.topIssues[0].issue_id;
    const showCallsBtns = d3
      .select(topFiveHolderSelector)
      .selectAll('button.stat');
    showCallsBtns
      .on('pointerover', function (_: Event, d: IssueCountData) {
        if (selectedIssueId !== d.issue_id) {
          repData.beeswarm.forEach(
            (b) =>
              (b.data.selected =
                b.data.issue_id === selectedIssueId ||
                b.data.issue_id === d.issue_id)
          );
          d3.select(this)
            .classed('selected', true)
            .style('background-color', issueColor(d.issue_id))
            .style('color', null)
            .attr('aria-pressed', true);
          d3.select(`svg#beeswarm_svg_${repData.id}`)
            .selectAll('circle')
            .data(
              repData.beeswarm,
              (b: BeeswarmNode<BeeswarmCallCount>) => b.data.id
            )
            .transition()
            .delay(0)
            .style('fill', (d: BeeswarmNode<BeeswarmCallCount>) =>
              d.data.selected ? issueColor(d.data.issue_id) : defaultColor
            );
        }
      })
      .on('click', onIssueSelected)
      .on('keydown', onIssueSelected)
      .on('pointerout', function (_, d: IssueCountData) {
        if (selectedIssueId !== d.issue_id) {
          repData.beeswarm.forEach(
            (b) => (b.data.selected = b.data.issue_id === selectedIssueId)
          );
          d3.select(this)
            .classed('selected', false)
            .style('background-color', null)
            .style('color', issueColor(d.issue_id))
            .attr('aria-pressed', false);
          d3.select(`svg#beeswarm_svg_${repData.id}`)
            .selectAll('circle')
            .data(
              repData.beeswarm,
              (b: BeeswarmNode<BeeswarmCallCount>) => b.data.id
            )
            .transition()
            .delay(0)
            .style('fill', (d: BeeswarmNode<BeeswarmCallCount>) =>
              d.data.selected ? issueColor(d.data.issue_id) : defaultColor
            );
        }
      });

    // Perform the initial selection.
    showCallsBtns
      .classed(
        'selected',
        (d: IssueCountData) => d.issue_id === selectedIssueId
      )
      .style('background-color', (d: IssueCountData) =>
        d.issue_id === selectedIssueId ? issueColor(d.issue_id) : null
      )
      .style('color', (d: IssueCountData) =>
        d.issue_id === selectedIssueId ? null : issueColor(d.issue_id)
      )
      .attr(
        'aria-pressed',
        (d: IssueCountData) => d.issue_id === selectedIssueId
      );
  }, 0);
};

/* ---- Beeswarm methods ---- */

const drawBeeswarm = (
  parentDiv: d3.Selection,
  repData: ExpandedRepData,
  beeswarmScale: d3.ScaleTime<number, number>,
  issueIdToName: { [x: string]: any; [x: number]: string },
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  parentDiv.attr('class', 'graphic_section');
  const description = parentDiv
    .append('div')
    .attr('class', 'description')
    .attr('hidden', !inBeeswarmRange(repData.total) ? true : null);

  description
    .append('h2')
    .html(`Calls to ${repData.repInfo.name}, ${duration}`);

  let renderFrameId: number | null = null;
  let audioContext: AudioContext | null = null;

  const startSonification = function () {
    d3.select(`button#sonify_btn_${repData.id}`)
      .classed('active', true)
      .on('click', stopSonification);
    const startAudioTime = 0;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const animateD3Update = () => {
      const now = audioContext!.currentTime;
      const elapsed = now - startAudioTime;
      const currentProgress = elapsed / SONFICATION_DURATION;
      if (currentProgress >= 1) {
        // Playback is complete.
        d3.select('svg#beeswarm_svg_' + repData.id)
          .selectAll('g#playbackLine')
          .select('line')
          .attr('stroke', 'none');
        d3.selectAll(`button#sonify_btn_${repData.id}`)
          .on('click', startSonification)
          .classed('active', false);
        return;
      }
      d3.select('svg#beeswarm_svg_' + repData.id)
        .selectAll('g#playbackLine')
        .attr(
          'transform',
          `translate(${currentProgress * BEESWARM_TARGET_WIDTH}, 0)`
        );
      renderFrameId = requestAnimationFrame(animateD3Update);
    };
    d3.select('svg#beeswarm_svg_' + repData.id)
      .selectAll('g#playbackLine')
      .select('line')
      .attr('stroke', 'red');
    playData(audioContext, repData.beeswarm, beeswarmScale);
    renderFrameId = requestAnimationFrame(animateD3Update);
  };

  const stopSonification = function () {
    if (renderFrameId) {
      cancelAnimationFrame(renderFrameId);
      renderFrameId = null;
    }
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    d3.select('svg#beeswarm_svg_' + repData.id)
      .selectAll('g#playbackLine')
      .select('line')
      .attr('stroke', 'none');
    d3.selectAll(`button#sonify_btn_${repData.id}`)
      .on('click', startSonification)
      .classed('active', false);
  };

  const paragraph = description.append('div');
  paragraph.append('span').html('Select call count above to highlight');
  if (repData.total <= MAX_FOR_SONIFICATION) {
    // Only add button to listen if there's a reasonable number of calls. Otherwise it's just
    // way too noisy.
    paragraph.append('span').html(' or ');
    paragraph
      .append('button')
      .attr('id', `sonify_btn_${repData.id}`)
      .html('listen')
      .on('click', startSonification);
    paragraph.append('span').html(' to this chart.');
  } else {
    paragraph.append('span').html('.');
  }

  const dotsKey = description.append('div').attr('class', 'dot_key');
  dotsKey
    .append('div')
    .attr('class', 'dot')
    .attr('aria-label', 'grey dot (lower pitch)')
    .html('One call');
  dotsKey
    .append('div')
    .attr('class', 'dot')
    .attr('aria-label', 'colored dot (high pitch)')
    .attr('id', `dot_key_${repData.id}`)
    .style('--dot-color', issueColor(repData.topIssues[0].issue_id))
    .html(`<i>${repData.topIssues[0].name}</i>`);

  const svgBox = parentDiv.append('div').style('position', 'relative');
  svgBox
    .append('div')
    .attr('id', 'dot_label')
    .attr('class', 'overlayBox topLabel absolute')
    .attr('hidden', true)
    .append('div')
    .attr('class', 'issue_long_name');
  // TODO maybe append close button if clicking makes it stay up.

  /**
   * Called when a dot on the beeswarm chart is selected by hover or click.
   * @param _ The event that caused the dot to be selected
   * @param dot The beeswarm node that was selected
   */
  const selectDot = function (_: Event, dot: BeeswarmNode<BeeswarmCallCount>) {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    });

    // Deselect everything else.
    d3.select(this.parentElement).selectAll('circle').attr('stroke', `#fff4`);

    // Bring selected dot to front
    this.parentElement.appendChild(this);
    d3.select(this).attr('stroke', '#333');

    // Bounding box of the dot.
    const boundingBox = this.getBBox();
    const matrix = this.getScreenCTM();
    const point = this.ownerSVGElement.createSVGPoint();
    point.x = boundingBox.x + boundingBox.width / 2;
    point.y = boundingBox.y + boundingBox.height;
    const screenCoords = point.matrixTransform(matrix);
    screenCoords.x -= 28; // Has to do with the tab on the overlay box
    screenCoords.y += 4; // Slightly below

    // Bounding box of the SVG.
    const svgBb = this.parentElement.parentElement.getBoundingClientRect();
    const yCoord = screenCoords.y - svgBb.y;
    const xCoord = screenCoords.x - svgBb.x;

    d3.select(this.parentElement.parentElement.parentElement)
      .select('div#dot_label')
      .attr('hidden', null)
      .style('top', `${yCoord}px`)
      .style('left', `${xCoord}px`)
      .select('div.issue_long_name')
      // Can't append every time! but this does get the :after working.
      .html(
        `${dateFormatter.format(new Date(dot.data.time * 1000))}: ${issueIdToName[dot.data.issue_id]}`
      );
  };

  const svg = svgBox
    .append('svg')
    .style('width', '100%')
    .style('height', 'auto')
    .attr('id', 'beeswarm_svg_' + repData.id)
    .style('margin-bottom', '1.5rem')
    .style('overflow', 'visible');

  if (!inBeeswarmRange(repData.total)) {
    // Skip drawing beeswarm.
    svg.attr('width', 0).attr('height', 0).attr('hidden', true);
    return;
  }

  svg.attr(
    'title',
    `${repData.total} dots representing calls, ordered by time on the x axis.`
  );
  const initialIssueId = repData.topIssues[0].issue_id;
  repData.beeswarm.forEach(
    (b) => (b.data.selected = b.data.issue_id === initialIssueId)
  );
  const group = svg
    .append('g')
    .attr('aria-hidden', true) // Not useful for screen readers
    .attr('id', 'beeswarm_g_' + repData.id);
  const middle = BEESWARM_TARGET_WIDTH / 2;
  group
    .selectAll('circle')
    .data(
      repData.beeswarm,
      // We've added the 'id' field to the call count to allow for transitions.
      (r: BeeswarmNode<BeeswarmCallCount>) => r.data.id
    )
    .enter()
    .append('circle')
    .attr('stroke', `#fff4`)
    .attr('cx', (d: BeeswarmNode<BeeswarmCallCount>) => d.x)
    .attr('cy', (d: BeeswarmNode<BeeswarmCallCount>) => d.y)
    .attr('r', (d: BeeswarmNode<BeeswarmCallCount>) => d.r)
    .style('fill', defaultColor)
    .on('pointerover', selectDot)
    .on('click', selectDot)
    .on('pointerout', function () {
      d3.select(this).attr('stroke', `#fff4`);
      d3.select(this.parentElement.parentElement.parentElement)
        .select('div#dot_label')
        .attr('hidden', true);
    })
    .transition()
    .delay(0)
    .style('fill', (d: BeeswarmNode<BeeswarmCallCount>) =>
      d.data.selected ? issueColor(d.data.issue_id) : defaultColor
    );

  const height = group.node().getBBox().height;
  const axisHeight = 20;
  group.attr('transform', `translate(0, -${middle - height / 2 - 1})`);
  svg
    .append('g')
    .attr('id', 'playbackLine')
    .append('line')
    .attr('stroke', 'none')
    .attr('stroke-width', '2')
    .attr('x0', 0)
    .attr('x1', 0)
    .attr('y0', 0)
    .attr('y1', height);
  svg.attr('viewBox', `0 0 ${BEESWARM_TARGET_WIDTH} ${height + axisHeight}`);

  // Add the axis.
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3
        .axisBottom(beeswarmScale)
        .tickSizeOuter(0)
        .ticks(d3.timeDay)
        .tickFormat(d3.timeFormat('%a %-d'))
    );
};

// `beeswarmForce` is from
// https://observablehq.com/@harrystevens/force-directed-beeswarm.
// ChatGPT helped with the typescript typing.
function beeswarmForce<T>() {
  let x: (d: T) => number = (d) => (d as any)[0];
  let y: (d: T) => number = (d) => (d as any)[1];
  let r: (d: T) => number = (d) => (d as any)[2];
  let ticks = 300;

  function beeswarm(data: T[]) {
    const entries: BeeswarmNode<T>[] = data.map((d) => ({
      x0: typeof x === 'function' ? x(d) : x,
      y0: typeof y === 'function' ? y(d) : y,
      r: typeof r === 'function' ? r(d) : r,
      x: 0,
      y: 0,
      data: d
    }));

    const simulation = d3
      .forceSimulation(entries)
      .force(
        'x',
        d3.forceX<BeeswarmNode<T>>((d: BeeswarmNode<T>) => d.x0)
      )
      .force(
        'y',
        d3.forceY<BeeswarmNode<T>>((d: BeeswarmNode<T>) => d.y0)
      )
      .force(
        'collide',
        d3.forceCollide<BeeswarmNode<T>>((d: BeeswarmNode<T>) => d.r)
      );

    for (let i = 0; i < ticks; i++) simulation.tick();

    return entries;
  }

  beeswarm.x = (f?: (d: T) => number) => (f ? ((x = f), beeswarm) : x);
  beeswarm.y = (f?: (d: T) => number) => (f ? ((y = f), beeswarm) : y);
  beeswarm.r = (f?: (d: T) => number) => (f ? ((r = f), beeswarm) : r);
  beeswarm.ticks = (n?: number) =>
    typeof n === 'number' ? ((ticks = n), beeswarm) : ticks;

  return beeswarm;
}

/* ---- End beeswarm methods ---- */

/* ---- Sonification methods ---- */
// Thanks ChatGPT for the help with sonification.

const playTone = (
  context: AudioContext,
  frequency: number,
  gain: number,
  offsetSeconds: number
) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  gainNode.gain.setValueAtTime(gain, context.currentTime + offsetSeconds);
  oscillator.start(context.currentTime + offsetSeconds);
  oscillator.stop(context.currentTime + offsetSeconds + 0.15);
};

const playBackgroundTone = (context: AudioContext, durationSeconds: number) => {
  const droneOsc = context.createOscillator();
  const droneGain = context.createGain();

  droneOsc.type = 'triangle'; // Some texture
  droneOsc.frequency.setValueAtTime(220, context.currentTime); // Low tone
  droneGain.gain.setValueAtTime(0.05, context.currentTime); // Subtle volume

  droneOsc.connect(droneGain);
  droneGain.connect(context.destination);

  droneOsc.start(context.currentTime);
  droneOsc.stop(context.currentTime + durationSeconds);
};

const playData = (
  context: AudioContext,
  beeswarm: BeeswarmNode<BeeswarmCallCount>[],
  beeswarmScale: d3.ScaleTime<number, number>
) => {
  // We assume data has the oldest element first.
  for (let i = beeswarm.length - 1; i >= 0; i--) {
    const item = beeswarm[i];
    // Skip things rendered too early. TODO: Maybe just start earlier instead.
    if (item.x < 0) {
      continue;
    }
    const timeOffsetSeconds =
      (item.x / BEESWARM_TARGET_WIDTH) * SONFICATION_DURATION; // x0 is the preferred offset, x is where it is rendered.
    const freq = item.data.selected ? 523.25 : 261.63; // Middle C if not, the higher C if so.
    const gain = item.data.selected ? 0.2 : 0.1;
    playTone(context, freq, gain, timeOffsetSeconds);
  }
  beeswarmScale.ticks().forEach((tick: number) => {
    playTone(context, 212, 0.1, beeswarmScale(tick) / 85);
  });
  playBackgroundTone(context, SONFICATION_DURATION);
  return context.currentTime;
};

/* ---- End sonification methods ---- */

class Dashboard extends React.Component<null, State> {
  _defaultUsa: RegionSummaryData = {
    id: 'usa',
    name: 'USA',
    total: 0,
    issueCounts: []
  };
  _defaultUsaSummary: UsaSummaryData = { usa: this._defaultUsa, states: [] };
  state = {
    usaData: this._defaultUsaSummary,
    repsData: [],
    district: '',
    isLoading: true,
    isError: false
  };

  componentDidMount() {
    this.requestDashboardData();

    // Sent by the location page.
    document.addEventListener(Constants.CUSTOM_EVENTS.UPDATE_REPS, () => {
      // This is a bit of a hack; would be better to just pull in new
      // reps data, but first must detangle loading reps data from USA data.
      location.reload();
    });
  }

  getDistrictId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(Constants.LOCAL_STORAGE_KEYS.DISTRICT)) {
      // Override from URL parameter if present.
      const urlDistrict = urlParams.get(Constants.LOCAL_STORAGE_KEYS.DISTRICT);
      // Validate length, although not the actual code.
      if (urlDistrict && (urlDistrict.length == 4 || urlDistrict.length == 5)) {
        return urlDistrict;
      }
    }
    return localStorage.getItem(Constants.LOCAL_STORAGE_KEYS.DISTRICT);
  };

  async requestDashboardData() {
    let districtId = this.getDistrictId();

    let usaSummaryData = null;
    let repsSummaryData = null;

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

    if (usaSummaryData === null) {
      this.setState({
        isLoading: false,
        isError: true
      });
      // USA summary data required to show dashboard.
      return;
    }
    const repsData = processRepsData(repsSummaryData, MAX_FOR_BEESWARM);

    // Set the state, which will cause rendering to happen.
    this.setState({
      usaData: usaSummaryData,
      repsData: repsData,
      district: districtId,
      isLoading: false,
      isError: false
    });
  }

  render(): React.ReactNode {
    if (this.state.isLoading) {
      return (
        <div>
          <h2>Loading the latest data...</h2>
          <div id="loader" aria-label="loading icon" role="status"></div>
        </div>
      );
    }

    const usaData = this.state.usaData;
    if (
      this.state.isError ||
      usaData.states.length == 0 ||
      usaData.usa === null ||
      usaData.usa.total == 0
    ) {
      // Happens if the data isn't populated properly (like after an outage).
      return (
        <div>
          <h2>Error loading the dashboard</h2>
          <p>Please try again later</p>
        </div>
      );
    }

    const district = this.state.district;
    const hasRepsData = this.state.repsData.length > 0;

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
    if (this.state.repsData.length > 0) {
      const repsData: ExpandedRepData[] = this.state.repsData;
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

    const handleTopNavClick = function (_, newTab: TabData) {
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
          const district = localStorage.getItem(
            Constants.LOCAL_STORAGE_KEYS.DISTRICT
          );
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
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          const increment = event.key === 'ArrowLeft' ? -1 : 1;
          // Find the next or prev tab
          const nextIndex =
            (t.index + increment + top_tabs.length) % top_tabs.length;
          const nextTab = top_tabs[nextIndex];
          handleTopNavClick(event, nextTab);
          d3.select(`button#tab_${nextTab.id}`).node().focus();
        }
      });
    topNavButtons.on('click', handleTopNavClick);

    if (this.state.repsData.length) {
      const repsData: ExpandedRepData[] = this.state.repsData;
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
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              const increment = event.key === 'ArrowLeft' ? -1 : 1;
              const nextIndex =
                (t.index + increment + tabs.length) % tabs.length;
              // Find the next or prev tab
              const nextTab = tabs[nextIndex];
              handleRepTabClick(event, nextTab);
              d3.select(`button#tab_${nextTab.id}`).node().focus();
            }
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

    // No message.
    return <span></span>;
  }
}

export default Dashboard;
