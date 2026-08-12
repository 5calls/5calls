import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Feature } from 'geojson';
import { RegionSummaryData, UsaSummaryData, IssueCountData } from './api';
import {
  BeeswarmCallCount,
  BeeswarmNode,
  ExpandedRepData,
  getPopulation,
  getUsaMapKeyData,
  scaledCallsPerStateString,
  beeswarmForce
} from './dashboardData';
import { playData, SONFICATION_DURATION } from './dashboardSonification';

//
// D3 data visualization methods used by the dashboard.
//

export const BEESWARM_TARGET_WIDTH = 600;

// Colors used by D3.
export const themeColor = 'rgb(24, 117, 209)';
export const purple = '#9467bd';
export const themeAccentColor = '#ed3c1d';
const defaultColor = '#eee';
const beeswarmDefaultColor = '#ccc';
export const defaultDarkColor = '#666';
const selectedStateStroke = 'rgba(255, 217, 52)';

const USA_TOPOJSON = 'https://cdn.jsdelivr.net/npm/us-atlas@2/us/10m.json';
const MIN_FOR_BEESWARM = 7;
const MAX_FOR_SONIFICATION = 2000;
export const MAX_FOR_BEESWARM = 700; // DO NOT SUBMIT
const SCALED_POP_DENOMINATOR = 10000;

const MAP_TABS = {
  TOP_CALLS: 'top_calls',
  SCALED_CALLS: 'scaled_calls',
  TOTAL_CALLS: 'total_calls'
} as const;

export type MapTabMode = (typeof MAP_TABS)[keyof typeof MAP_TABS];

const drawStateLabel = (
  parentState: SVGGraphicsElement,
  stateName: string,
  contents: string,
  onClose: (event: Event | null) => void
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

const updateStateLabelPosition = (parent: SVGGraphicsElement | null) => {
  if (!parent) return;
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
    screenCoords.x > svgBb.width - 24 ||
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

export const drawUsaPane = (
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
    if (!isValidActivation(event)) {
      return;
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
    if (!isValidActivation(event)) {
      return;
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
): d3.ScaleLinear<string, string> => {
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
  d3.json(USA_TOPOJSON).then((usa: { objects: { states: any } } | any) => {
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
      },
      {
        type: 'Feature',
        id: 'MP',
        properties: { name: 'Northern Mariana Islands' },
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
    // It should be a multiple of 10.
    if (maxScaledTotal != 0) {
      while (maxScaledTotal < 10) {
        scaledPopDenominator *= 10;
        maxScaledTotal *= 10;
      }
    }
    // The maximum color on the scale is a round number: multiple of 5.
    maxScaledTotal = Math.ceil(maxScaledTotal / 5) * 5;
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

    let activeMapTab: MapTabMode = MAP_TABS.TOP_CALLS;

    const mapTabClicked = (mode: MapTabMode) => {
      activeMapTab = mode;

      Object.values(MAP_TABS).forEach((id) => {
        d3.select(`button#tab_${id}`)
          .attr('tabindex', id === mode ? 0 : -1)
          .classed('selected', id === mode)
          .attr('aria-selected', id === mode);
      });

      d3.select('#state_footnote_scaled').attr(
        'hidden',
        mode === MAP_TABS.SCALED_CALLS ? null : true
      );

      const mapSection = d3.select('div#state_map_section');
      switch (mode) {
        case MAP_TABS.TOTAL_CALLS:
          mapSection
            .select('div#state_map')
            .select('svg')
            .selectAll<SVGPathElement, Feature>('path')
            .attr('fill', (d: Feature) => {
              const stateResult = statesResults.find(
                (state) => state.id === d.id
              );
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
          d3.select('div#state_map_key')
            .select('svg#total')
            .style('display', null);
          d3.select('div#state_map_key')
            .select('svg#scaled')
            .style('display', 'none');
          d3.select('div#state_map_key').select('ol').style('display', 'none');
          break;

        case MAP_TABS.TOP_CALLS:
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

          mapSection
            .select('div#state_map')
            .select('svg')
            .selectAll<SVGPathElement, Feature>('path')
            .attr('fill', (d: Feature) => {
              const stateResult = statesResults.find(
                (state) => state.id === d.id
              );
              const stateTopIssues = stateResult ? stateResult.issueCounts : [];
              if (stateTopIssues && stateTopIssues.length > 0) {
                return issueColor(stateTopIssues[0].issue_id);
              }
              return beeswarmDefaultColor;
            });
          mapSection
            .select('h2.detail_title')
            .html(`Top issue per state, ${duration}`);
          mapSection
            .select('div.description')
            .html(
              'The most-called issue by state. Select a state in the dropdown for more details below.'
            );
          break;

        case MAP_TABS.SCALED_CALLS:
          mapSection
            .select('div#state_map')
            .select('svg')
            .selectAll<SVGPathElement, Feature>('path')
            .attr('fill', (d: Feature) => {
              const stateResult = statesResults.find(
                (state) => state.id === d.id
              );
              const stateTotal = stateResult ? stateResult.total : 0;
              return scaledColorScale(
                (stateTotal / getPopulation(d.id!)) * scaledPopDenominator
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
          break;

        default:
          console.error(`Unhandled map tab mode: ${mode}`);
          break;
      }

      if (selectedState) {
        const state_node = mapSection
          .select(`path#state_${selectedState}`)
          .node() as SVGGraphicsElement;
        const state_feature = data.find((s) => s.id === selectedState);
        const state_name = state_feature
          ? state_feature.properties!.name
          : 'Unknown';
        const state_results = statesResults.find((s) => s.id === selectedState);
        const total_calls = state_results ? state_results.total : 0;
        const state_issues = state_results ? state_results.issueCounts : [];

        let labelText = '';
        switch (mode) {
          case MAP_TABS.TOTAL_CALLS:
            labelText = `${total_calls.toLocaleString()} call${total_calls == 1 ? '' : 's'}`;
            break;
          case MAP_TABS.TOP_CALLS: {
            const topIssue =
              state_issues && state_issues.length > 0
                ? state_issues[0]
                : { name: 'No recorded calls' };
            labelText = topIssue.name;
            break;
          }
          case MAP_TABS.SCALED_CALLS:
            labelText = scaledCallsPerStateString(
              total_calls,
              selectedState,
              scaledPopDenominator
            );
            break;
          default:
            console.error(`Unhandled map tab mode: ${mode}`);
            break;
        }
        drawStateLabel(state_node, state_name, labelText, deselectState);
      }
    };

    // Toggles between the three map tabs on arrow events.
    const map_tabs = [
      {
        id: MAP_TABS.TOP_CALLS,
        clickFn: () => mapTabClicked(MAP_TABS.TOP_CALLS)
      },
      {
        id: MAP_TABS.SCALED_CALLS,
        clickFn: () => mapTabClicked(MAP_TABS.SCALED_CALLS)
      },
      {
        id: MAP_TABS.TOTAL_CALLS,
        clickFn: () => mapTabClicked(MAP_TABS.TOTAL_CALLS)
      }
    ];

    const handleMapTabEvent = (event: KeyboardEvent) => {
      const targetId = (event.currentTarget as HTMLElement).id;
      const currentIndex = map_tabs.findIndex(
        (t) => `tab_${t.id}` === targetId
      );
      if (currentIndex !== -1) {
        handleTabKeydown(event, map_tabs, currentIndex, (e, tab) =>
          tab.clickFn()
        );
      }
    };

    let selectedState: string | null = null;
    let initialSelected = false;
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
      )
      .on('pointerleave', () => {
        group.selectAll('.state-highlight-clone').remove();
      });

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
      group.selectAll('.state-highlight-clone').remove();
      const state_path = group.select(`path#state_${selectedState}`);
      const state_node = state_path.node() as SVGGraphicsElement;
      if (state_node) {
        // Bring to front.
        state_node.parentNode!.appendChild(state_node);
      }
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
      let labelText = '';
      switch (activeMapTab) {
        case MAP_TABS.TOP_CALLS:
          labelText = topIssue.name;
          break;
        case MAP_TABS.SCALED_CALLS:
          labelText = scaledCallsPerStateString(
            total_calls,
            state,
            scaledPopDenominator
          );
          break;
        case MAP_TABS.TOTAL_CALLS:
          labelText = `${total_calls.toLocaleString()} calls`;
          break;
        default:
          console.error(`Unhandled map tab: ${activeMapTab}`);
          break;
      }
      if (state_node) {
        drawStateLabel(state_node, state_name, labelText, deselectState);
        state_path
          .transition()
          .attr('stroke', selectedStateStroke)
          .attr('stroke-width', 3);
      }
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
      .attr('fill', beeswarmDefaultColor)
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
        return beeswarmDefaultColor;
      })
      .on('end', function (this: any) {
        // After animation ends, can set interaction listeners. If they go off in the
        // middle of the animation it won't complete.
        d3.select('button#tab_top_calls')
          .on('click', () => mapTabClicked(MAP_TABS.TOP_CALLS))
          .on('keydown', handleMapTabEvent);
        d3.select('button#tab_total_calls')
          .on('click', () => mapTabClicked(MAP_TABS.TOTAL_CALLS))
          .on('keydown', handleMapTabEvent);
        d3.select('button#tab_scaled_calls')
          .on('click', () => mapTabClicked(MAP_TABS.SCALED_CALLS))
          .on('keydown', handleMapTabEvent);

        if (initialState !== null && !initialSelected) {
          initialSelected = true;
          selectState(initialState);
        }
        // Track the state over which the pointer went down. If the pointer
        // goes up on the same state it went down on, that's a click.
        let pointerDownState: string = '';
        d3.select(this)
          .on(
            'pointerover',
            function (this: SVGPathElement, event: Event, d: Feature) {
              if (selectedState === d.id) {
                return;
              }
              if (this.parentNode) {
                const parent = d3.select(this.parentNode);
                parent.selectAll(`.clone-${d.id}`).remove();

                const clone = d3
                  .select(this)
                  .clone(false)
                  .attr('class', `state-highlight-clone clone-${d.id}`)
                  .style('pointer-events', 'none')
                  .attr('stroke', '#fff')
                  .attr('stroke-width', 1);

                this.parentNode.appendChild(clone.node()!);

                clone.transition().attr('stroke-width', 2);

                if (selectedState !== null) {
                  const selectedStateNode = group
                    .select(`path#state_${selectedState}`)
                    .node() as SVGGraphicsElement | null;
                  if (selectedStateNode) {
                    this.parentNode.appendChild(selectedStateNode);
                  }
                }
              }
            }
          )
          .on(
            'pointerdown',
            function (this: SVGPathElement, event: Event, d: Feature) {
              pointerDownState = d.id!;
            }
          )
          .on(
            'pointerup',
            function (this: SVGPathElement, event: Event, d: Feature) {
              if (pointerDownState === d.id) {
                selectState(d.id);
              }
              pointerDownState = '';
            }
          )
          .on(
            'pointerout',
            function (this: SVGPathElement, event: Event, d: Feature) {
              if (this.parentNode) {
                d3.select(this.parentNode)
                  .selectAll(`.clone-${d.id}`)
                  .transition()
                  .attr('stroke-width', 1)
                  .remove();
              }
            }
          );
      });

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .extent([
        [0, 0],
        [width, height]
      ])
      .translateExtent([
        [-width / 2, 0],
        [width * 2, height]
      ])
      .scaleExtent([1, 4])
      .on('zoom', zoomed);

    svg.call(zoom);

    function zoomed(event: d3.D3ZoomEvent<SVGSVGElement, unknown>) {
      group.attr('transform', event.transform.toString());
      if (selectedState !== null) {
        updateStateLabelPosition(
          group
            .select(`path#state_${selectedState}`)
            .node() as SVGGraphicsElement | null
        );
      }
    }
  });
};

const inBeeswarmRange = (count: number): boolean => {
  return count >= MIN_FOR_BEESWARM && count <= MAX_FOR_BEESWARM;
};

const inBarRange = (count: number): boolean => {
  return count > MAX_FOR_BEESWARM;
};

export const drawRepsPane = (
  repData: ExpandedRepData,
  finalDate: number,
  district: string,
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
    .node() as HTMLElement;
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
      if (inBeeswarmRange(repData.total) || inBarRange(repData.total)) {
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
    inBeeswarmRange(repData.total) || inBarRange(repData.total)
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
      d3.arc()({
        innerRadius: size / 2,
        outerRadius: pieSize / 2,
        startAngle: 0,
        endAngle: 2 * Math.PI * repData.percentContact
      })
    );
  callResultsGroup
    .append('path')
    .attr('fill', '#6a51a3')
    .attr('stroke', '#fff')
    .attr(
      'd',
      d3.arc()({
        innerRadius: size / 2,
        outerRadius: pieSize / 2,
        startAngle: 2 * Math.PI * repData.percentContact,
        endAngle: 2 * Math.PI * (repData.percentVM + repData.percentContact)
      })
    );
  callResultsGroup
    .append('path')
    .attr('fill', '#4a1486')
    .attr('stroke', '#fff')
    .attr(
      'd',
      d3.arc()({
        innerRadius: size / 2,
        outerRadius: pieSize / 2,
        startAngle: 2 * Math.PI * (repData.percentVM + repData.percentContact),
        endAngle: 2 * Math.PI
      })
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
      const beeswarmScale = d3
        .scaleTime()
        .domain([finalDate - 7 * 24 * 60 * 60 * 1000, finalDate])
        .range([25, BEESWARM_TARGET_WIDTH - 25])
        .nice();

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
      drawBeeswarm(
        repCard.append('div'),
        repData,
        beeswarmScale,
        issueIdToName,
        issueColor,
        duration
      );
    } else if (inBarRange(repData.total)) {
      // Today
      const finalDateAsDate = new Date(finalDate);
      finalDateAsDate.setHours(0, 0, 0, 0);
      const earliestDate = finalDateAsDate.getTime() - 6 * 24 * 60 * 60 * 1000;
      const barChartScale = d3
        .scaleTime()
        .domain([earliestDate, finalDateAsDate.getTime()])
        .range([40, BEESWARM_TARGET_WIDTH - 45])
        .nice();
      drawBarChart(
        repCard.append('div'),
        repData,
        barChartScale,
        issueIdToName,
        issueColor,
        duration
      );
    }

    const onIssueSelected = function (
      this: HTMLButtonElement,
      event: Event,
      d: IssueCountData
    ) {
      if (!isValidActivation(event)) {
        return;
      }
      if (
        !(event instanceof KeyboardEvent) &&
        event.target === event.currentTarget
      ) {
        event.stopPropagation();
      }
      if (selectedIssueId === d.issue_id) {
        // deselect
        const repTopIssues: Set<number> = new Set(
          repData.topIssues.map((issue) => issue.issue_id)
        );
        selectedIssueId = null;
        d3.select(this)
          .classed('selected', false)
          .style('background-color', null)
          .style('color', issueColor(d.issue_id))
          .attr('aria-pressed', false);
        d3.select(`svg#beeswarm_svg_${repData.id}`)
          .selectAll('circle')
          .transition()
          .delay(0)
          .style('fill', beeswarmDefaultColor);
        d3.select(`svg#bar_svg_${repData.id}`)
          .select('g#bar_group')
          .selectAll('rect')
          .transition()
          .delay(0)
          .style('fill', (b) =>
            repTopIssues.has(b.key) ? issueColor(b.key) : defaultColor
          )
          .style('stroke', (b) =>
            repTopIssues.has(b.key) ? issueColor(b.key) : defaultColor
          );
        d3.select(`div#dot_key_${repData.id}`).style('display', 'none');
      } else {
        // select
        selectedIssueId = d.issue_id;
        // Ensure everything else is deselected visually.
        d3.select(topFiveHolderSelector)
          .selectAll<HTMLButtonElement, IssueCountData>('button.stat')
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
          .transition()
          .delay(0)
          .style('fill', (d: BeeswarmNode<BeeswarmCallCount>) =>
            d.data.issue_id === selectedIssueId
              ? issueColor(d.data.issue_id)
              : beeswarmDefaultColor
          );
        d3.select(`svg#bar_svg_${repData.id}`)
          .select('g#bar_group')
          .selectAll('rect')
          .transition()
          .delay(0)
          .style('fill', (d) =>
            d.key === selectedIssueId ? issueColor(d.key) : defaultColor
          )
          .style('stroke', (d) =>
            d.key === selectedIssueId ? issueColor(d.key) : defaultColor
          );
        d3.select(`div#dot_key_${repData.id}`)
          .style('display', null)
          .style('--dot-color', issueColor(d.issue_id))
          .html(
            `${!inBarRange(repData.total) ? 'A call for' : 'Calls about'} <i>${repData.topIssues.find((i) => i.issue_id === d.issue_id)?.name}</i>`
          );
      }
    };

    // Only show beeswarm if there's enough calls, but not if there's so many we will show the bar chart.
    let selectedIssueId: number | null = !inBarRange(repData.total)
      ? repData.topIssues[0].issue_id
      : null;
    const showCallsBtns = d3
      .select(topFiveHolderSelector)
      .selectAll<HTMLButtonElement, IssueCountData>('button.stat');
    showCallsBtns
      .on(
        'pointerover',
        function (this: HTMLButtonElement, _: Event, d: IssueCountData) {
          if (selectedIssueId !== d.issue_id) {
            d3.select(this)
              .classed('selected', true)
              .style('background-color', issueColor(d.issue_id))
              .style('color', null)
              .attr('aria-pressed', true);
            d3.select(`svg#beeswarm_svg_${repData.id}`)
              .selectAll<SVGCircleElement, BeeswarmNode<BeeswarmCallCount>>(
                'circle'
              )
              .transition()
              .delay(0)
              .style('fill', (b) =>
                b.data.issue_id === selectedIssueId ||
                b.data.issue_id === d.issue_id
                  ? issueColor(b.data.issue_id)
                  : beeswarmDefaultColor
              );
            d3.select(`svg#bar_svg_${repData.id}`)
              .select('g#bar_group')
              .selectAll('rect')
              .transition()
              .delay(0)
              .style('fill', (b) =>
                b.key === selectedIssueId || b.key === d.issue_id
                  ? issueColor(b.key)
                  : defaultColor
              )
              .style('stroke', (b) =>
                b.key === selectedIssueId || b.key === d.issue_id
                  ? issueColor(b.key)
                  : defaultColor
              );
          }
        }
      )
      .on('click', onIssueSelected)
      .on('keydown', onIssueSelected)
      .on(
        'pointerout',
        function (this: HTMLButtonElement, _, d: IssueCountData) {
          if (selectedIssueId !== d.issue_id) {
            d3.select(this)
              .classed('selected', false)
              .style('background-color', null)
              .style('color', issueColor(d.issue_id))
              .attr('aria-pressed', false);
            d3.select(`svg#beeswarm_svg_${repData.id}`)
              .selectAll<SVGCircleElement, BeeswarmNode<BeeswarmCallCount>>(
                'circle'
              )
              .transition()
              .delay(0)
              .style('fill', (d) =>
                d.data.issue_id === selectedIssueId
                  ? issueColor(d.data.issue_id)
                  : beeswarmDefaultColor
              );
            if (selectedIssueId === null) {
              // Nothing is selected, reset to all colors on pointerout.
              const repTopIssues: Set<number> = new Set(
                repData.topIssues.map((issue) => issue.issue_id)
              );
              d3.select(`svg#bar_svg_${repData.id}`)
                .select('g#bar_group')
                .selectAll('rect')
                .transition()
                .delay(0)
                .style('fill', (b) =>
                  repTopIssues.has(b.key) ? issueColor(b.key) : defaultColor
                )
                .style('stroke', (b) =>
                  repTopIssues.has(b.key) ? issueColor(b.key) : defaultColor
                );
            } else {
              d3.select(`svg#bar_svg_${repData.id}`)
                .select('g#bar_group')
                .selectAll('rect')
                .transition()
                .delay(0)
                .style('fill', (b) =>
                  b.key === selectedIssueId ? issueColor(b.key) : defaultColor
                )
                .style('stroke', (b) =>
                  b.key === selectedIssueId ? issueColor(b.key) : defaultColor
                );
            }
          }
        }
      );

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

const appendGraphicsSection = (
  parentDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  repData: ExpandedRepData,
  duration: string
): d3.Selection<HTMLDivElement, unknown, null, undefined> => {
  parentDiv.attr('class', 'graphic_section');
  const description = parentDiv.append('div').attr('class', 'description');

  description
    .append('h2')
    .html(`Calls to ${repData.repInfo.name}, ${duration}`);
  return description;
};

const drawBarChart = (
  parentDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  repData: ExpandedRepData,
  barChartScale: d3.ScaleTime<number, number>,
  issueIdToName: { [key: number]: string },
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  const description = appendGraphicsSection(parentDiv, repData, duration);

  const paragraph = description.append('div');
  paragraph
    .append('span')
    .html(
      "Select call count above to highlight. Today's calls are still coming in!"
    ); // TODO: Add sonification of bars.

  const dotsKey = description.append('div').attr('class', 'dot_key');
  dotsKey.append('div').attr('class', 'dot').html('Calls about other issues');
  dotsKey
    .append('div')
    .attr('class', 'dot')
    .attr('id', `dot_key_${repData.id}`)
    .style('--dot-color', issueColor(repData.topIssues[0].issue_id))
    .style('display', 'none'); // No issue selected at first.

  const svgBox = parentDiv.append('div').style('position', 'relative');
  svgBox
    .append('div')
    .attr('id', 'dot_label')
    .attr('class', 'overlayBox topLabel absolute')
    .attr('hidden', true)
    .append('div')
    .attr('class', 'issue_long_name');

  const svg = svgBox
    .append('svg')
    .style('width', '100%')
    .style('height', 'auto')
    .attr('id', 'bar_svg_' + repData.id)
    .style('margin-bottom', '1.5rem')
    .style('overflow', 'hidden')
    .on('pointerleave', () => {
      group.selectAll('.bar-highlight-clone').remove();
      parentDiv.select('div#dot_label').attr('hidden', true);
    });

  svg.attr(
    'title',
    `Bars representing ${repData.total} calls, colored by issue, ordered by time on the x axis.`
  );

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const strokeColor = '#fff0';
  const fillColor = defaultColor;
  const repTopIssues: Set<number> = new Set(
    repData.topIssues.map((issue) => issue.issue_id)
  );
  const dayTotals = (
    repData.barSeries.length > 0 ? repData.barSeries[0] : []
  ).map((d) => ({
    time: d.data[0],
    total: Array.from(d.data[1].values()).reduce(
      (sum: number, item: any) => sum + item.count,
      0
    )
  }));

  const selectBar = function (this: SVGRectElement, _: Event, bar) {
    // Bounding box of the rect.
    const boundingBox = this.getBBox();
    const matrix = this.getScreenCTM()!;
    const point = this.ownerSVGElement!.createSVGPoint();
    point.x = boundingBox.x + (boundingBox.width * 2) / 3;
    point.y = boundingBox.y + boundingBox.height / 2;
    const screenCoords = point.matrixTransform(matrix);
    screenCoords.y += 4; // Slightly below

    // Bounding box of the SVG.
    const svgBb = this.parentElement!.parentElement!.getBoundingClientRect();
    const yCoord = screenCoords.y - svgBb.y;
    const xCoord = screenCoords.x - svgBb.x;

    const parentGroup = d3.select(this.parentElement!.parentElement!);
    parentGroup.selectAll('.bar-highlight-clone').remove();

    const clone = d3
      .select(this)
      .clone(false)
      .attr('class', 'bar-highlight-clone')
      .style('pointer-events', 'none')
      .style('stroke', '#333');
    parentGroup.node()!.appendChild(clone.node()!);

    const count = bar.data[1].get(bar.key).count;
    const total = dayTotals.find((d) => d.time === bar.data[0])?.total;

    parentDiv
      .select('div#dot_label')
      .attr('hidden', null)
      .style('top', `${yCoord}px`)
      .style('left', `${xCoord}px`)
      .select('div.issue_long_name')
      .html(
        `${dateFormatter.format(new Date(bar.data[0] * 1000))}: ${total} calls.<br/>${count} for ${issueIdToName[bar.key]}`
      );
  };

  const width = BEESWARM_TARGET_WIDTH;
  const barWidth = width / 20;

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(repData.barSeries, (d) => d3.max(d, (d) => d[1]))])
    .rangeRound([BEESWARM_TARGET_WIDTH / 2, 0]); // Target height

  svg
    .append('g')
    .attr('transform', `translate(${20}, 0)`)
    .call(
      d3
        .axisLeft(y)
        .ticks(6, 's')
        .tickSize(-BEESWARM_TARGET_WIDTH + 25)
    )
    .call((g) => {
      g.selectAll('.domain').remove();
      g.selectAll('.tick line').attr('stroke', '#e6e6e6');
    });

  // Add outlines on the background.
  svg
    .append('g')
    .selectAll('rect')
    .data(dayTotals)
    .enter()
    .append('rect')
    .attr('x', (d) => barChartScale(d.time * 1000) - barWidth / 2)
    .attr('width', barWidth)
    .attr('y', (d) => y(d.total))
    .attr('height', (d) => y(0) - y(d.total) - 1)
    .attr('fill', 'none')
    .attr('stroke', '#555')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', (d) =>
      new Date(d.time * 1000).getDate() === new Date().getDate()
        ? '2 2'
        : 'none'
    );

  const group = svg.append('g').attr('id', 'bar_group');
  group
    .selectAll()
    .data(repData.barSeries)
    .enter()
    .append('g')
    .selectAll('rect')
    .data(
      (D) => D.map((d) => ((d.key = D.key), d)),
      (d) => d.key + d.time
    )
    .enter()
    .append('rect')
    .attr('x', (d) => barChartScale(d.data[0] * 1000) - barWidth / 2)
    .attr('y', (d) => y(d[1]))
    .attr('height', (d) => y(d[0]) - y(d[1]))
    .attr('width', barWidth)
    .on('pointerover', selectBar)
    .on('click', selectBar)
    .on('pointerout', function (this: SVGRectElement) {
      if (this.parentElement && this.parentElement.parentElement) {
        d3.select(this.parentElement.parentElement)
          .selectAll('.bar-highlight-clone')
          .remove();
      }
      parentDiv.select('div#dot_label').attr('hidden', true);
    })
    .transition()
    .delay(0)
    .attr('stroke', (d) =>
      repTopIssues.has(d.key) ? issueColor(d.key) : fillColor
    )
    .attr('fill', (d) =>
      repTopIssues.has(d.key) ? issueColor(d.key) : fillColor
    );

  const height = group.node().getBBox().height;
  const axisHeight = 20;
  svg.attr('viewBox', `0 -1 ${width} ${height + axisHeight}`);

  // Add the axis.
  svg
    .append('g')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3
        .axisBottom(barChartScale)
        .tickSizeOuter(0)
        .ticks(d3.timeDay)
        .tickFormat(d3.timeFormat('%a %-d'))
    );
};

const drawBeeswarm = (
  parentDiv: d3.Selection<HTMLDivElement, unknown, null, undefined>,
  repData: ExpandedRepData,
  beeswarmScale: d3.ScaleTime<number, number>,
  issueIdToName: { [key: number]: string },
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  const description = appendGraphicsSection(parentDiv, repData, duration);

  let renderFrameId: number | null = null;
  let audioContext: AudioContext | null = null;

  const startSonification = function () {
    d3.select(`button#sonify_btn_${repData.id}`)
      .classed('active', true)
      .on('click', stopSonification);
    const startAudioTime = 0;
    audioContext = new (window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext)();
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
    playData(
      audioContext,
      repData.beeswarm,
      beeswarmScale,
      BEESWARM_TARGET_WIDTH
    );
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

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  });

  /**
   * Called when a dot on the beeswarm chart is selected by hover or click.
   * @param _ The event that caused the dot to be selected
   * @param dot The beeswarm node that was selected
   */
  const selectDot = function (
    this: SVGCircleElement,
    _: Event,
    dot: BeeswarmNode<BeeswarmCallCount>
  ) {
    const parent = d3.select(this.parentElement!);
    parent.selectAll('.dot-highlight-clone').remove();

    const clone = d3
      .select(this)
      .clone(false)
      .attr('class', 'dot-highlight-clone')
      .style('pointer-events', 'none')
      .attr('stroke', '#333');
    parent.node()!.appendChild(clone.node()!);

    // Bounding box of the dot.
    const boundingBox = this.getBBox();
    const matrix = this.getScreenCTM()!;
    const point = this.ownerSVGElement!.createSVGPoint();
    point.x = boundingBox.x + boundingBox.width / 2;
    point.y = boundingBox.y + boundingBox.height;
    const screenCoords = point.matrixTransform(matrix);
    screenCoords.x -= 28; // Has to do with the tab on the overlay box
    screenCoords.y += 4; // Slightly below

    // Bounding box of the SVG.
    const svgBb = this.parentElement!.parentElement!.getBoundingClientRect();
    const yCoord = screenCoords.y - svgBb.y;
    const xCoord = screenCoords.x - svgBb.x;

    parentDiv
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
    .style('overflow', 'visible')
    .on('pointerleave', () => {
      group.selectAll('.dot-highlight-clone').remove();
      parentDiv.select('div#dot_label').attr('hidden', true);
    });

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
    .style('fill', beeswarmDefaultColor)
    .on('pointerover', selectDot)
    .on('click', selectDot)
    .on('pointerout', function (this: SVGCircleElement) {
      if (this.parentElement) {
        d3.select(this.parentElement)
          .selectAll('.dot-highlight-clone')
          .remove();
      }
      parentDiv.select('div#dot_label').attr('hidden', true);
    })
    .transition()
    .delay(0)
    .style('fill', (d: BeeswarmNode<BeeswarmCallCount>) =>
      initialIssueId === d.data.issue_id
        ? issueColor(d.data.issue_id)
        : beeswarmDefaultColor
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

const isValidActivation = (event: Event): boolean => {
  if (event instanceof KeyboardEvent) {
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      event.target === event.currentTarget
    ) {
      event.preventDefault();
      return true;
    }
    return false;
  }
  // True for all non-keyboard events (mouse events).
  return true;
};

export interface TabItem {
  id: string;
}

export const handleTabKeydown = <T extends TabItem>(
  event: KeyboardEvent,
  tabs: T[],
  currentIndex: number,
  onSelect: (event: KeyboardEvent, tab: T) => void
) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    // Find the next or previous tab
    const increment = event.key === 'ArrowLeft' ? -1 : 1;
    const nextIndex = (currentIndex + increment + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    onSelect(event, nextTab);

    // Focus the new tab
    const buttonNode = d3
      .select(`button#tab_${nextTab.id}`)
      .node() as HTMLElement | null;
    buttonNode?.focus();
  }
};
