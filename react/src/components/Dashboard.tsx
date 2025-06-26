import React from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Feature } from 'geojson';
import {
  AggregatedCallCount,
  ContactSummaryData,
  getLocationSummary,
  getUsaSummary,
  IssueCountData,
  OutcomeSummaryData,
  RegionSummaryData,
  UsaSummaryData
} from '../utils/api';
import { Contact } from '../common/models/contact';
import { LOCAL_STORAGE_KEYS } from '../common/constants';

interface ExpandedRepData {
  id: string;
  repInfo: Contact;
  total: number;
  outcomes: OutcomeSummaryData[];
  topIssues: IssueCountData[];
  callResults: AggregatedCallCount[];
  beeswarm: BeeswarmNode<AggregatedCallCount>[];
  numVoicemail: number;
  percentVM: number;
  percentContact: number;
  percentUnavailable: number;
}

// Dashboard state.
interface State {
  usaData: UsaSummaryData;
  repsData: ExpandedRepData[];
  isLoading: boolean;
}

// TODO: Move hard-coded colors into CSS.
const themeColor = 'rgb(24, 117, 209)';
const purple = '#9467bd';
const themeAccentColor = '#ed3c1d';
const defaultColor = '#ccc';
const defaultDarkColor = '#666';
const hoverColor = `rgba(2, 63, 159, .05)`;
const selectedStateStroke = 'rgba(255, 217, 52)';
const USA_TOPOJSON = 'https://cdn.jsdelivr.net/npm/us-atlas@2/us/10m.json';
const MIN_FOR_BEESWARM = 7;
const MAX_FOR_SONIFICATION = 2000;

const drawStateLabel = (
  parentState: SVGGraphicsElement,
  state_name: string,
  topIssue: IssueCountData | { name: string },
  onClose: { (event: any): void }
) => {
  const labelBox = d3.select('div#state_map_label').attr('hidden', null);
  labelBox.select('div.title').html(state_name);
  labelBox.select('div.issue_name').html(topIssue.name);
  labelBox.select('input#close_label_btn').on('click', function (event: Event) {
    onClose(event);
  });
  updateStateLabelPosition(parentState);
};

const updateStateLabelPosition = (parent: SVGGraphicsElement) => {
  // The state's bounding box.
  const boundingBox = parent.getBBox();

  // Thanks ChatGPT for the matrix conversion math.
  const matrix = parent.getScreenCTM()!;
  const point = parent.ownerSVGElement!.createSVGPoint();
  point.x = boundingBox.x + (3 / 4) * boundingBox.width;
  point.y = boundingBox.y + (3 / 4) * boundingBox.height;
  const screenCoords = point.matrixTransform(matrix);
  screenCoords.y += 24; // Has to do with where the < is on the label.

  // SVG's bounding box.
  const svgBb = parent.parentElement!.parentElement!.getBoundingClientRect();

  // Check it is within the drawing bounds.
  if (
    screenCoords.y > svgBb.height + svgBb.y ||
    screenCoords.y < svgBb.y ||
    screenCoords.x > svgBb.width + svgBb.x ||
    screenCoords.x + 24 < svgBb.x
  ) {
    d3.select('div#state_map_label').attr('hidden', true);
  } else {
    d3.select('div#state_map_label').attr('hidden', null);
  }

  const yCoord = screenCoords.y - svgBb.y;
  const xCoord = screenCoords.x - svgBb.x;
  d3.select('div#state_map_label')
    .style('top', `${yCoord}px`)
    .style('left', `${xCoord}px`);
};

const drawStateResults = (
  allStateResults: RegionSummaryData[],
  state: string | null,
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  d3.select('div#state_detail').attr('hidden', state === null ? true : null);
  const stateResults = allStateResults.find((d) => d.id === state);
  if (!stateResults) {
    d3.select('h3#state_detail_title').html(
      `There were no calls in ${state} recorded with 5 Calls ${duration}`
    );
    d3.select('div#state_total_card').attr('hidden', true);
    return;
  }
  d3.select('h3#state_detail_title')
    .attr('class', 'detail_title')
    .html(`Top 5 calls in ${stateResults.name} ${duration}`);
  d3.selectAll('div#total_state').html(stateResults.total.toLocaleString());
  d3.selectAll('div#state_name_subtitle').html(`From ${stateResults.name}`);
  d3.select('div#state_total_card').attr('hidden', null);
  // TODO: Use D3 to transform rather than clearing and redrawing everything, for better performance
  // and also so animation doesn't always start at 0.
  d3.select('ol#top_five_state_holder').html('');
  drawTopFiveIssues(
    'ol#top_five_state_holder',
    stateResults.issueCounts,
    issueColor,
    stateResults.total
  );
};

const drawUsaPane = (
  usaData: UsaSummaryData,
  state: string | null,
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  const topIssues = usaData.usa.issueCounts.slice(0, 5);
  d3.selectAll('div#total_all').html(usaData.usa.total.toLocaleString());
  drawTopFiveIssues(
    'ol#top_five_all_holder',
    topIssues,
    issueColor,
    usaData.usa.total
  );
  drawStateResults(usaData.states, state, issueColor, duration);
  drawUsaMap(usaData.states, issueColor, state, duration, (new_state) => {
    drawStateResults(usaData.states, new_state, issueColor, duration);
  });
};

const drawTopFiveIssues = (
  holder: string,
  data: IssueCountData[],
  issueColor: d3.ScaleOrdinal<number, string>,
  total: number
) => {
  const rowWidth = 552;
  const topFiveRow = d3
    .select(holder)
    .selectAll('li.top_five')
    .data(data)
    .enter()
    .append('li')
    .attr('class', 'top_five')
    .attr('id', (d: IssueCountData) => `top_five_${d.issue_id}`);
  const rowContent = topFiveRow
    .append('div')
    .attr('class', 'top_five_item_holder')
    .attr(
      'title',
      (d: IssueCountData) =>
        `${((d.count / total) * 100).toFixed(1)}% of calls: ${d.name}`
    );
  const issueSection = rowContent.append('div').attr('class', 'top_five_issue');
  issueSection
    .append('a')
    .attr('class', 'issue_name')
    .attr('href', (d: IssueCountData) => `/issue/${d.slug}`)
    .html((d: IssueCountData) => `&rarr; ${d.name}`);
  issueSection
    .append('div')
    .attr('class', 'stat')
    .style('color', (d: IssueCountData) => issueColor(d.issue_id))
    .html((d: IssueCountData) => `<b>${d.count.toLocaleString()}</b> calls`);

  const issueBarSvg = rowContent
    .append('div')
    .style('line-height', '10px')
    .style('padding-bottom', '4px')
    .append('svg')
    .attr('width', rowWidth)
    .attr('height', 8)
    // This is expressed in the title of the parent element and can be hidden here.
    .attr('aria-hidden', true);
  const issueBar = issueBarSvg.append('g').attr('aria-hidden', true);
  issueBar
    .append('rect')
    .attr('width', 0)
    .attr('height', 8)
    .attr('y', 0)
    .attr('x', 0)
    .attr('fill', (d: IssueCountData) => issueColor(d.issue_id))
    .transition()
    .delay(500)
    .duration(1000)
    .attr('width', (d: IssueCountData) => (d.count / total) * rowWidth);
  issueBar
    .append('rect')
    .attr('width', rowWidth)
    .attr('height', 8)
    .attr('y', 0)
    .attr('x', 0)
    .attr('fill', '#fff0')
    .attr('stroke', '#555');
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

    // TODO: Add geojson or little rects for PR and DC, then add them to the legend.
    // Note that DC is technically in the map, but too small to be useful.
    const filteredStatesResults = statesResults.filter(
      (stateResults) =>
        stateResults.id !== 'DC' && data.find((d) => d.id === stateResults.id)
    );
    const keyData = filteredStatesResults.reduce((agg, row) => {
      if (row.issueCounts.length === 0) {
        return agg;
      }
      const topIssue = row.issueCounts[0];
      let issueInKey = agg.find(
        (i: IssueCountData) => topIssue.issue_id === i.issue_id
      );
      if (issueInKey === undefined) {
        issueInKey = {
          issue_id: topIssue.issue_id,
          name: topIssue.name,
          count: 0,
          slug: ''
        };
        agg.push(issueInKey);
      }
      issueInKey.count++;
      return agg;
    }, [] as IssueCountData[]);
    // Sort by number of states with this top issue.
    keyData.sort((a, b) => b.count - a.count);
    d3.select('ol#state_map_key')
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

    let selectedState: string | null = null;
    const width = 630;
    const height = 400;
    const svg = d3
      .select('div#state_map')
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr(
        'title',
        'Map showing states colored by top issue. Select a state above.'
      );
    const svgWidth = svg.node().getBoundingClientRect().width;

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
          .selectAll(`option#_${selectedState}`)
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
      const state_issues = state_results ? state_results.issueCounts : [];
      const topIssue =
        state_issues.length > 0
          ? state_issues[0]
          : { name: 'No recorded calls' };
      d3.select('div#state_map')
        .select('svg')
        .attr(
          'title',
          `${state}'s top: ${topIssue.name}. Map showing states colored by top issue. Select a state above.`
        );
      drawStateLabel(state_node, state_name, topIssue, deselectState);
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
      .attr(
        'transform',
        `translate(${(svgWidth - width) / 2}, 0) scale(0.66, 0.66)`
      )
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-linecap', 'round')
      .style('cursor', 'pointer')
      .attr('id', (d: Feature) => 'state_' + d.id)
      .attr('fill', defaultColor)
      .attr('d', path)
      // This transition causes issues if the mouse passes over it b/c of the other transition perhaps?
      .transition()
      .delay(500)
      .duration(1000)
      .attr('fill', (d: Feature) => {
        const stateResult = statesResults.find((state) => state.id === d.id);
        const stateTopIssues = stateResult ? stateResult.issueCounts : [];
        if (stateTopIssues.length > 0) {
          return issueColor(stateTopIssues[0].issue_id);
        }
        // Default white for no calls at all.
        return '#fff';
      })
      .on('end', function () {
        if (initialState !== null) {
          selectState(initialState);
        }
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
          .on('click', function (event: Event, d: Feature) {
            selectState(d.id);
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
          [-svgWidth, 0],
          [svgWidth, height]
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

const expandRepResults = (results: AggregatedCallCount[]) => {
  const addedPoints: AggregatedCallCount[] = [];
  // Add a unique ID for the D3 animation later.
  let indexForId = 0;
  results.forEach((r) => {
    // TODO: Would be better to cast to another type rather than adding the ID field.

    // Add an ID for this point, and subsequent IDs for its expanded points.
    r.id = indexForId++;
    for (let i = 1; i < r.count; i++) {
      // Expand the data based on the count to create enough dots.
      addedPoints.push({
        time: r.time,
        issue_id: r.issue_id,
        count: 1,
        id: indexForId++
      });
    }
  });
  results.push(...addedPoints);
};

const drawRepsPane = (
  repData: ExpandedRepData,
  beeswarmScale: d3.ScaleTime<number, number>,
  issueColor: d3.ScaleOrdinal<number, string>,
  issueIdToName: { [key: number]: string },
  duration: string
) => {
  const repCard = d3
    .select('div#reps_section')
    .append('div')
    .attr('id', `card_${repData.id}`)
    .attr('class', 'dashboard_card');

  const leftSide = repCard.append('div');
  const totalCard = leftSide.append('div').attr('class', 'total_card');
  totalCard
    .append('h3')
    .attr('class', 'subtitle_detail')
    .html(`Total calls ${duration}`);
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
    .style('width', '241px');
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
  nameSubtitleSection
    .append('div')
    .attr('class', '')
    .html(
      `${repData.repInfo.party} from ${repData.repInfo.area === 'US House' ? localStorage.district : repData.repInfo.state}`
    );

  const repDetail = repCard.append('div').attr('class', 'detail');
  if (repData.total == 0) {
    repDetail
      .append('div')
      .html(
        `There were no calls to ${repData.repInfo.name} recorded via 5 Calls ${duration}. Make your voice heard: see <a href="/all">all active issues</a>.`
      );
    return;
  }

  // At this point, this rep does have at least 1 call made to them.

  repDetail
    .append('h3')
    .attr('class', 'detail_title')
    .html(`Top 5 Calls ${duration}`);
  repDetail
    .append('div')
    .attr('class', 'description')
    .html(() => {
      let text = `The five most-called issues to ${repData.repInfo.name} ${duration} as recorded with 5 Calls, and call count for each in that time.`;
      if (repData.total >= MIN_FOR_BEESWARM) {
        text += ' Tap an issue to see its calls below.';
      }
      return text;
    });
  repDetail.append('ol').attr('id', `${repData.id}_top`);
  const topFiveHolderSelector = `ol#${repData.id}_top`;
  drawTopFiveIssues(
    topFiveHolderSelector,
    repData.topIssues,
    issueColor,
    repData.total
  );

  const pieSize = 60;
  const size = 40;
  const reachability = leftSide.append('div').attr('class', 'reachability');
  reachability.append('h3').attr('class', 'detail_title').html('Reachability');
  reachability
    .append('div')
    .attr('class', 'description')
    .style('margin-bottom', '10px')
    .html(`${repData.repInfo.name}'s office's availability ${duration}.`);
  const callResultsGroup = reachability
    .append('svg')
    .attr('width', pieSize)
    .attr('height', pieSize)
    .attr('aria-hidden', true) // Empty alt text because this graphic is redundant with the percentages.
    .style('float', 'left')
    .style('align-content', 'center')
    .append('g')
    .attr('transform', `translate(${pieSize / 2}, ${pieSize / 2})`);
  callResultsGroup
    .append('path')
    .attr('fill', purple)
    .attr('stroke', '#fff')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(`${size / 2}`)
        .outerRadius(`${pieSize / 2}`)
        .startAngle(0)
        .endAngle(2 * Math.PI * repData.percentVM)
    );
  callResultsGroup
    .append('path')
    .attr('fill', themeColor)
    .attr('stroke', '#fff')
    .attr(
      'd',
      d3
        .arc()
        .innerRadius(`${size / 2}`)
        .outerRadius(`${pieSize / 2}`)
        .startAngle(2 * Math.PI * repData.percentVM)
        .endAngle(2 * Math.PI * (repData.percentVM + repData.percentContact))
    );
  callResultsGroup
    .append('path')
    .attr('fill', themeAccentColor)
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
    .style('float', 'left')
    .style('align-content', 'center')
    .style('margin-left', '16px');
  resultsTextHolder
    .append('div')
    .html(
      `<span class="results_vm">${(repData.percentVM * 100).toFixed(0)}%</span> of calls went to voicemail`
    );
  resultsTextHolder
    .append('div')
    .html(
      `<span class="results_contact">${(repData.percentContact * 100).toFixed(0)}%</span> of calls were answered`
    );
  resultsTextHolder
    .append('div')
    .html(
      `<span class="results_unavailable">${(repData.percentUnavailable * 100).toFixed(0)}%</span> of calls were unavailable`
    );

  // Draw beeswarm async so that it doesn't block rendering.
  window.setTimeout(() => {
    if (repData.total >= MIN_FOR_BEESWARM) {
      repData.beeswarm = beeswarmForce()
        .y(300)
        .x((e: AggregatedCallCount) => beeswarmScale(new Date(e.time * 1000))) // seconds since epoch --> ms
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
      repDetail.append('div'),
      repData,
      beeswarmScale,
      issueIdToName,
      issueColor,
      duration
    );

    // Only show beeswarm if there's enough calls.
    let selectedIssueId: number | null = repData.topIssues[0].issue_id;
    const topFiveRow = d3
      .select(topFiveHolderSelector)
      .selectAll('li.top_five');
    topFiveRow
      .on('pointerover', function (_: Event, d: IssueCountData) {
        if (selectedIssueId !== d.issue_id) {
          d3.select(this).style('background-color', hoverColor);
          d3.select(this.parentNode.parentNode.parentNode)
            .selectAll('circle')
            .data(
              repData.beeswarm,
              (b: BeeswarmNode<AggregatedCallCount>) => b.data.id
            )
            .transition()
            .delay(0)
            .style('fill', (b: BeeswarmNode<AggregatedCallCount>) =>
              b.data.issue_id === selectedIssueId
                ? issueColor(selectedIssueId)
                : b.data.issue_id === d.issue_id
                  ? `${issueColor(d.issue_id)}`
                  : '#ccc'
            );
        }
      })
      .on('click', function (_, d: IssueCountData) {
        if (selectedIssueId === d.issue_id) {
          // deselect
          selectedIssueId = null;
          d3.select(this).style('background-color', hoverColor);
          d3.select(this.parentNode.parentNode.parentNode)
            .selectAll('circle')
            .data(
              repData.beeswarm,
              (b: BeeswarmNode<AggregatedCallCount>) => b.data.id
            )
            .transition()
            .delay(0)
            .style('fill', '#ccc');
        } else {
          // select
          selectedIssueId = d.issue_id;
          d3.select(topFiveHolderSelector)
            .selectAll('li.top_five')
            .style('background-color', '#fff');
          d3.select(this).style('background-color', hoverColor);
          d3.select(this.parentNode.parentNode.parentNode)
            .selectAll('circle')
            .data(
              repData.beeswarm,
              (b: BeeswarmNode<AggregatedCallCount>) => b.data.id
            )
            .transition()
            .delay(0)
            .style('fill', (b: BeeswarmNode<AggregatedCallCount>) =>
              b.data.issue_id === selectedIssueId
                ? issueColor(selectedIssueId)
                : '#ccc'
            );
        }
      })
      .on('pointerout', function (_, d: IssueCountData) {
        if (selectedIssueId !== d.issue_id) {
          d3.select(this).style('background-color', '#fff');
          d3.select(this.parentNode.parentNode.parentNode)
            .selectAll('circle')
            .data(
              repData.beeswarm,
              (b: BeeswarmNode<AggregatedCallCount>) => b.data.id
            )
            .transition()
            .delay(0)
            .style('fill', (b: BeeswarmNode<AggregatedCallCount>) =>
              b.data.issue_id === selectedIssueId
                ? issueColor(selectedIssueId)
                : '#ccc'
            );
        }
      });

    // Perform the initial selection.
    topFiveRow.style('background-color', (d: IssueCountData) =>
      d.issue_id === selectedIssueId ? hoverColor : '#fff'
    );
  }, 0);
};

/* ---- Beeswarm methods ---- */

const drawBeeswarm = (
  repDetail: d3.Selection,
  repData: ExpandedRepData,
  beeswarmScale: d3.ScaleTime<number, number>,
  issueIdToName: { [x: string]: any; [x: number]: string },
  issueColor: d3.ScaleOrdinal<number, string>,
  duration: string
) => {
  const description = repDetail
    .append('div')
    .attr('class', 'description')
    .attr('hidden', repData.total < MIN_FOR_BEESWARM ? true : null);

  description
    .append('h3')
    .html(`All calls to ${repData.repInfo.name} about this issue ${duration}`);

  let renderFrameId: number | null = null;
  let audioContext: AudioContext | null = null;

  const startSonification = function () {
    d3.selectAll('input#sonify_btn')
      .on('click', stopSonification)
      .style('outline', `1px solid var(--c-red)`);
    const startAudioTime = 0;
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const animateD3Update = () => {
      const now = audioContext!.currentTime;
      const elapsed = now - startAudioTime;
      const expectedTotal = 600 / 85;
      const currentProgress = elapsed / expectedTotal;
      if (currentProgress >= 1) {
        // Playback is complete.
        d3.select('svg#beeswarm_svg_' + repData.id)
          .selectAll('g#playbackLine')
          .select('line')
          .attr('stroke', 'none');
        d3.selectAll('input#sonify_btn')
          .on('click', startSonification)
          .style('outline', '1px solid white');
        return;
      }
      d3.select('svg#beeswarm_svg_' + repData.id)
        .selectAll('g#playbackLine')
        .attr('transform', `translate(${currentProgress * 600}, 0)`);
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
    d3.selectAll('input#sonify_btn')
      .on('click', startSonification)
      .style('outline', '1px solid white');
  };

  const paragraph = description.append('p');
  paragraph
    .append('span')
    .html(
      'One dot represents one call. Tap an issue in the list above to highlight those calls visually'
    );
  if (repData.total <= MAX_FOR_SONIFICATION) {
    // Only add button to listen if there's a reasonable number of calls. Otherwise it's just
    // way too noisy.
    paragraph.append('span').html(', or ');
    paragraph
      .append('input')
      .attr('type', 'button')
      .attr('id', 'sonify_btn')
      .attr('value', 'listen')
      .on('click', startSonification);
    paragraph.append('span').html(' to this chart.');
  } else {
    paragraph.append('span').html('. ');
  }
  paragraph.append('span').html('Your calls make a difference.');

  const svgBox = repDetail.append('div').style('position', 'relative');
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
  const selectDot = function (
    _: Event,
    dot: BeeswarmNode<AggregatedCallCount>
  ) {
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    });

    // Deselect everything else.
    d3.select(this.parentElement).selectAll('circle').attr('stroke', `#fff5`);

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
    .attr('width', 600)
    .attr('id', 'beeswarm_svg_' + repData.id)
    .style('margin-bottom', '1.5rem');

  if (repData.total < MIN_FOR_BEESWARM) {
    // Skip drawing beeswarm.
    svg.attr('width', 0).attr('height', 0).attr('hidden', true);
    return;
  }

  svg.attr(
    'title',
    `${repData.total} dots representing calls, ordered by time on the x axis`
  );
  const initialIssueId = repData.topIssues[0].issue_id;
  const initialIssueColor = issueColor(initialIssueId);
  const group = svg
    .append('g')
    .attr('aria-hidden', true) // Not useful for screen readers
    .attr('id', 'beeswarm_g_' + repData.id);
  const middle = 300;
  group
    .selectAll('circle')
    .data(
      repData.beeswarm,
      // We've added the 'id' field to the call count to allow for transitions.
      (r: BeeswarmNode<AggregatedCallCount>) => r.data.id
    )
    .enter()
    .append('circle')
    .attr('stroke', `#fff5`)
    .attr('cx', (d: BeeswarmNode<AggregatedCallCount>) => d.x)
    .attr('cy', (d: BeeswarmNode<AggregatedCallCount>) => d.y)
    .attr('r', (d: BeeswarmNode<AggregatedCallCount>) => d.r)
    .style('fill', (d: BeeswarmNode<AggregatedCallCount>) =>
      d.data.issue_id === initialIssueId ? initialIssueColor : defaultColor
    )
    .on('pointerover', selectDot)
    .on('click', selectDot)
    .on('pointerout', function () {
      d3.select(this).attr('stroke', `#fff5`);
      d3.select(this.parentElement.parentElement.parentElement)
        .select('div#dot_label')
        .attr('hidden', true);
    });

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
  svg.attr('height', height + axisHeight);

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

interface BeeswarmNode<T> extends d3.SimulationNodeDatum {
  // Target x
  x0: number;
  // Target y
  y0: number;
  r: number;
  // Actual x
  x: number;
  // Actual y
  y: number;
  data: T;
}

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
  offsetSeconds: number
) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, context.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  gainNode.gain.setValueAtTime(0.2, context.currentTime + offsetSeconds);
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
  beeswarm: BeeswarmNode<AggregatedCallCount>[],
  beeswarmScale: d3.ScaleTime<number, number>
) => {
  // We assume data has the oldest element first.
  for (let i = beeswarm.length - 1; i >= 0; i--) {
    const item = beeswarm[i];
    // Skip things rendered too early. TODO: Maybe just start earlier instead.
    if (item.x < 0) {
      continue;
    }
    // 600 width / 85 -> about one second per day
    const timeOffsetSeconds = item.x / 85; // x0 is the preferred offset, x is where it is rendered.
    const freq = 300 + (item.data.issue_id % 25) * 10; // TODO: Better to map based on the whole set of issues.
    // TOD: Change amplitude depending on if issueID is selected (needs knowledge of selection!)
    playTone(context, freq, timeOffsetSeconds);
  }
  beeswarmScale.ticks().forEach((tick: number) => {
    playTone(context, 212, beeswarmScale(tick) / 85);
  });
  playBackgroundTone(context, 600 / 85);
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
    isLoading: true
  };

  componentDidMount() {
    getUsaSummary().then((usaSummaryData) => {
      // TODO: Perhaps do some work after USA summary and get location in parallel.
      getLocationSummary().then((repsSummaryData) => {
        const repsData: ExpandedRepData[] = [];
        // Add each matched contact, whether or not they have calls.
        repsSummaryData?.reps.forEach((r) => {
          const expandedResult: ExpandedRepData = {
            id: r.id,
            repInfo: r,
            total: 0,
            outcomes: [],
            topIssues: [],
            callResults: [],
            beeswarm: [],
            numVoicemail: 0,
            percentVM: 0,
            percentContact: 0,
            percentUnavailable: 0
          };
          // Add the call data, if it exists.
          const contactSummaryData: ContactSummaryData | undefined =
            repsSummaryData.repsData.find((c) => c.id === r.id);
          if (contactSummaryData !== undefined) {
            expandedResult.total = contactSummaryData.total;
            expandedResult.outcomes = contactSummaryData.outcomes;
            expandedResult.topIssues = contactSummaryData.topIssues;
            expandedResult.callResults = contactSummaryData.aggregatedResults;

            // In-place expand to individual calls.
            expandRepResults(expandedResult.callResults);

            // Calculate aggregated reachability stats.
            const vmOutcomes = contactSummaryData.outcomes.find(
              (s) => s.result === 'voicemail'
            );
            const contactOutcomes = contactSummaryData.outcomes.find(
              (s) => s.result === 'contact'
            );
            const unavailableOutcomes = contactSummaryData.outcomes.find(
              (s) => s.result === 'unavailable'
            );
            const numVm = !vmOutcomes ? 0 : vmOutcomes.count;
            const numContact = !contactOutcomes ? 0 : contactOutcomes.count;
            const numUnavailable = !unavailableOutcomes
              ? 0
              : unavailableOutcomes.count;
            expandedResult.percentVM = numVm / contactSummaryData.total;
            expandedResult.percentContact =
              numContact / contactSummaryData.total;
            expandedResult.percentUnavailable =
              numUnavailable / contactSummaryData.total;
          }
          repsData.push(expandedResult);
        });
        // Set the state, which will cause rendering to happen.
        this.setState({
          usaData: usaSummaryData,
          repsData: repsData,
          isLoading: false
        });
      });
    });
  }

  render(): React.ReactNode {
    if (this.state.isLoading) {
      return <span>Loading dashboard...</span>;
    }

    const usaData = this.state.usaData;
    const hasRepsData = this.state.repsData.length > 0;

    const duration = 'this week';
    // IDs of top issues, to be used for coloring.
    const topIssueIds: number[] = usaData.usa.issueCounts.reduce((agg, row) => {
      agg.push(row.issue_id);
      return agg;
    }, [] as number[]);

    // Use consistent coloring throughout the dashboard.
    const issueColor = d3
      .scaleOrdinal<number, string>([
        themeColor,
        themeAccentColor,
        purple, //"#7570b3", // purple
        '#66a61e', // bright green
        '#e7298a', // pink
        '#e6ab02', // yellow
        '#a6761d', // brown
        '#1b9e77', // teal
        defaultDarkColor
        // Now it repeats
      ])
      .domain(topIssueIds);

    const issueIdToName: { [key: number]: string } =
      usaData.usa.issueCounts.reduce(
        (agg, row) => {
          if (!agg[row.issue_id]) {
            agg[row.issue_id] = row.name;
          }
          return agg;
        },
        {} as { [key: number]: string }
      );

    interface TabData {
      name: string;
      id: string;
      selected: boolean;
      drawn: boolean;
    }

    const top_tabs: TabData[] = [];
    top_tabs.push({
      name: 'Your reps',
      id: 'your_reps',
      selected: hasRepsData,
      drawn: false
    });
    top_tabs.push({
      name: 'Nationwide',
      id: 'usa',
      selected: !hasRepsData,
      drawn: false
    });

    const tabs: TabData[] = [];
    if (this.state.repsData.length > 0) {
      const repsData: ExpandedRepData[] = this.state.repsData;
      repsData.forEach((r: ExpandedRepData) =>
        tabs.push({
          name: r.repInfo.name,
          id: r.id,
          selected: false,
          drawn: false
        })
      );
      tabs[0].selected = true;
    }

    const handleTopNavClick = function (_, newTab: TabData) {
      top_tabs.forEach((t) => (t.selected = false));
      newTab.selected = true;
      topNavButtons
        .attr('aria-selected', (t: TabData) => t.selected)
        .attr('class', (t: TabData) => (t.selected ? 'selected' : null));
      d3.selectAll('div.dashboard_card').style('display', 'none');
      if (newTab.id === 'usa') {
        d3.select(`div#card_usa.dashboard_card`).style('display', 'flex');
        if (!top_tabs[1].drawn) {
          // TODO: lookup instead of index for less brittle.
          // Draw it the first time it is needed.
          // TODO: Check with PR, DC that this works as expected.
          let initialState: string | null = null;
          const district = localStorage.getItem(LOCAL_STORAGE_KEYS.DISTRICT);
          if (district) {
            initialState = localStorage.district.split('-')[0];
          }
          drawUsaPane(usaData, initialState, issueColor, duration);
          top_tabs[1].drawn = true;
        }
        d3.select('div#nav')
          .style('visibility', 'hidden')
          .attr('aria-hidden', true);
      } else {
        d3.select('div#nav')
          .style('visibility', 'visible')
          .attr('aria-hidden', null);
        if (hasRepsData) {
          const selectedRepId = tabs.find(
            (t: TabData) => t.selected === true
          )!.id;
          d3.select(`div#card_${selectedRepId}.dashboard_card`).style(
            'display',
            'flex'
          );
        } else {
          document.getElementById('location_picker')!.removeAttribute('hidden');
          // TODO: Show information about how to set a location within 5calls. Handle location clicks.
        }
      }
    };

    // TODO: Refactor button creation to shared helper?
    const topNavButtons = d3
      .select('div#topNav')
      .selectAll('button')
      .data(top_tabs)
      .enter()
      .append('button')
      .attr('role', 'tab')
      .attr('aria-selected', (t: TabData) => t.selected)
      .attr('class', (t: TabData) => (t.selected ? 'selected' : null))
      .html((t: TabData) => t.name);
    topNavButtons.on('click', handleTopNavClick);

    if (this.state.repsData.length) {
      const repsData: ExpandedRepData[] = this.state.repsData;
      const finalDate = Date.now();
      const beeswarmScale = d3
        .scaleTime()
        .domain([finalDate - 7 * 24 * 60 * 60 * 1000, finalDate])
        .range([30, 570])
        .nice();

      const handleRepTabClick = function (_: Event | null, newTab: TabData) {
        tabs.forEach((t) => (t.selected = false));
        newTab.selected = true;
        navButtons
          .attr('aria-selected', (t: TabData) => t.selected)
          .attr('class', (t: TabData) => (t.selected ? 'selected' : null));
        d3.selectAll('div.dashboard_card').style('display', 'none');
        d3.select(`div#card_${newTab.id}.dashboard_card`).style(
          'display',
          'flex'
        );
        // Ensure it's only drawn once.
        if (!newTab.drawn) {
          drawRepsPane(
            repsData.find((r) => r.id === newTab.id)!,
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

    d3.selectAll('h3.subtitle_detail').html(`Total calls ${duration}`);
    handleTopNavClick(null, top_tabs.find((t) => t.selected)!);
    d3.select('div#dashboard-content').style('visibility', 'visible');

    // No message.
    return <span></span>;
  }
}

export default Dashboard;
