import React from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';
import { getLocationSummary, getUsaSummary, IssueCountData, RegionSummaryData, RepsSummaryData, UsaSummaryData } from '../utils/api';

// Dashboard state, not State as a region
interface State {
  usaData: UsaSummaryData;
  repsData: RepsSummaryData | null;
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
const USA_TOPOJSON = "https://cdn.jsdelivr.net/npm/us-atlas@2/us/10m.json";
const MIN_FOR_BEESWARM = 7;

const drawStateLabel = (parentState: SVGGraphicsElement, state_name: string, topIssue: IssueCountData | { name: string; }, onClose: { (event: any): void; }) => {
  const labelBox = d3.select('div#state_map_label')
    .attr('hidden', null);
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
  point.x = boundingBox.x + 3 / 4 * boundingBox.width;
  point.y = boundingBox.y + 3 / 4 * boundingBox.height;
  const screenCoords = point.matrixTransform(matrix);
  screenCoords.y += 24; // Has to do with where the < is on the label.

  // SVG's bounding box.
  const svgBb = parent.parentElement!.parentElement!.getBoundingClientRect();

  // Check it is within the drawing bounds.
  if (screenCoords.y > svgBb.height + svgBb.y || screenCoords.y < svgBb.y ||
    screenCoords.x > svgBb.width + svgBb.x || (screenCoords.x + 24) < svgBb.x) {
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

const drawStateResults = (allStateResults: RegionSummaryData[], state: string, issueColor: d3.ScaleOrdinal<number, string>, duration: string) => {
  const stateResults = allStateResults.find(d => d.id === state);
  if (!stateResults) {
    // TODO: Handle this more gracefully with some sort of user message that there were no
    // calls during the time period for this state.
    return;
  }
  d3.select("h3#state_detail_title").attr('class', 'detail_title').html(`Top 5 calls in ${stateResults.name} ${duration}`);
  d3.selectAll('div#total_state')
    .html(stateResults.total.toLocaleString());
  d3.selectAll('div#state_name_subtitle').html(`From ${stateResults.name}`);
  // TODO: Use D3 to transform rather than clearing and redrawing everything, for better performance
  // and also so animation doesn't always start at 0.
  document.getElementById('top_five_state_holder')!.innerHTML = '';
  drawTopFiveIssues('ol#top_five_state_holder', stateResults.issueCounts, issueColor, stateResults.total);
};

const drawUsaPane = (usaData: UsaSummaryData, state: string, issueColor: d3.ScaleOrdinal<number, string>, duration: string) => {
  const topIssues = usaData.usa.issueCounts.slice(0, 5);
  d3.selectAll('div#total_all')
    .html(usaData.usa.total.toLocaleString());
  drawTopFiveIssues('ol#top_five_all_holder', topIssues, issueColor, usaData.usa.total);
  drawStateResults(usaData.states, state, issueColor, duration);
  drawUsaMap(usaData.states, issueColor, state, duration,
    (new_state) => {
      drawStateResults(usaData.states, new_state, issueColor, duration);
    });
};

const drawTopFiveIssues = (holder: string, data: IssueCountData[], issueColor: d3.ScaleOrdinal<number, string>, total: number, beeswarmData = null) => {
  const rowWidth = 552;
  const topFiveRow = d3.select(holder).selectAll('li.top_five')
    .data(data)
    .enter()
    .append('li')
    .attr('class', 'top_five')
    .attr('id', (d: IssueCountData) => `top_five_${d.issue_id}`);
  const rowContent = topFiveRow.append('div')
    .attr('class', 'top_five_item_holder')
    .attr('title', (d: IssueCountData) => 
        `${(d.count / total * 100).toFixed(1)}% of calls: ${d.name}`);
  const issueSection = rowContent.append('div').attr('class', 'top_five_issue');
  issueSection.append('a')
    .attr('class', 'issue_name')
    .attr('href', (d: IssueCountData) => `/issue/${d.slug}`)
    .html((d: IssueCountData) => `&rarr; ${d.name}`);
  const linkStatSection = issueSection.append('div')
    .attr('class', 'stat')
    .style('color', (d: IssueCountData) => issueColor(d.issue_id))
    .html((d: IssueCountData) => `<b>${d.count.toLocaleString()}</b> calls`);

  const issueBarSvg = rowContent.append('div')
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
    .transition().delay(500).duration(1000)
    .attr('width', (d: IssueCountData) => d.count / total * rowWidth)
  issueBar
    .append('rect')
    .attr('width', rowWidth)
    .attr('height', 8)
    .attr('y', 0)
    .attr('x', 0)
    .attr('fill', '#fff0')
    .attr('stroke', '#555');

  // TODO: make a helper for the select/deselect repeated code.

  // Only show beeswarm if there's enough calls.
  if (beeswarmData !== null && beeswarmData.length >= MIN_FOR_BEESWARM) {
    let selectedIssueId: number | null = data[0].issue_id;
    topFiveRow.on('pointerover', function (_, d: IssueCountData) {
      if (selectedIssueId !== d.issue_id) {
        d3.select(this).style('background-color', hoverColor);
        d3.select(this.parentNode.parentNode.parentNode).selectAll('circle')
          .data(beeswarmData, b => b.data.id)
          .transition().delay(0)
          .style('fill', b => b.data.issue_id === selectedIssueId ? issueColor(selectedIssueId) :
            (b.data.issue_id === d.issue_id ? `${issueColor(d.issue_id)}` : '#ccc'));
      }
    })
      .on('click', function (_, d: IssueCountData) {
        if (selectedIssueId === d.issue_id) {
          // deselect
          selectedIssueId = null;
          d3.select(this).style('background-color', hoverColor);
          d3.select(this.parentNode.parentNode.parentNode).selectAll('circle')
            .data(beeswarmData, b => b.data.id)
            .transition().delay(0)
            .style('fill', '#ccc');
        } else {
          // select
          selectedIssueId = d.issue_id;
          d3.select(holder).selectAll('li.top_five').style('background-color', '#fff');
          d3.select(this).style('background-color', hoverColor);
          d3.select(this.parentNode.parentNode.parentNode).selectAll('circle')
            .data(beeswarmData, b => b.data.id)
            .transition().delay(0)
            .style('fill', 
                b => b.data.issue_id === selectedIssueId ? issueColor(selectedIssueId) : '#ccc');
        }
      })
      .on('pointerout', function (_, d: IssueCountData) {
        if (selectedIssueId !== d.issue_id) {
          d3.select(this).style('background-color', '#fff');
          d3.select(this.parentNode.parentNode.parentNode).selectAll('circle')
            .data(beeswarmData, b => b.data.id)
            .transition().delay(0)
            .style('fill', 
                b => b.data.issue_id === selectedIssueId ? issueColor(selectedIssueId) : '#ccc');
        }
      });

    // Perform the initial selection.
    topFiveRow.style('background-color',
      (d: IssueCountData) => d.issue_id === selectedIssueId ? hoverColor : '#fff');
  }
};

const drawUsaMap = (statesResults: RegionSummaryData[], issueColor: d3.ScaleOrdinal<number, string>, initialState: string, duration: string, redrawStateResults: { (new_state: string): void; }) => {
  // Draw USA map
  d3.json(USA_TOPOJSON).then((usa: { objects: { states: any; }; }) => {
    // The data is the states loaded from the topojson file.
    const data: Feature[] = topojson.feature(usa, usa.objects.states).features;
    // Alphabetize the states
    data.sort((a, b) => a.properties!.name.localeCompare(b.properties!.name));
    data.forEach(d => {
      const stateResult = statesResults.find(s => s.name === d.properties!.name);
      if (stateResult) {
        d.id = stateResult.id
      }
    });

    // TODO: Add geojson or little rects for PR and DC, then add them to the legend.
    // Note that DC is technically in the map, but too small to be useful.
    const filteredStatesResults = statesResults.filter(
      stateResults => stateResults.id !== 'DC' &&
        data.find(d => d.id === stateResults.id));
    const keyData = filteredStatesResults.reduce((agg, row) => {
      if (row.issueCounts.length === 0) {
        return agg;
      }
      const topIssue = row.issueCounts[0];
      let issueInKey = agg.find((i: IssueCountData) => topIssue.issue_id === i.issue_id);
      if (issueInKey === undefined) {
        issueInKey = { issue_id: topIssue.issue_id, name: topIssue.name, count: 0, slug: '' };
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
      .html((d: IssueCountData) => `<b>${d.count} state${d.count == 1 ? '' : 's'}</b>: ${d.name}`);

    let selectedState: string | null = null;
    const width = 630;
    const height = 400;
    const svg = d3.select('div#state_map')
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('title', 'Map showing states colored by top issue. Select a state above.');
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
      .on('input', (event: Event, d: Feature) => {
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
      .attr('selected', (d: Feature) => d.id === initialState ? 'true' : null)
      .attr('id', (d: Feature) => d.id)
      .html((d: Feature) => d.properties!.name);

    const deselectState = (event: Event | null = null) => {
      d3.select('div#state_map_label')
        .attr('hidden', true);
      if (selectedState !== null) {
        d3.select('select#state_select').selectAll(`option#${selectedState}`).attr('selected', null);
        group.select(`path#state_${selectedState}`).transition()
          .attr('stroke', '#fff').attr('stroke-width', 1);
        selectedState = null;
        if (event) {
          event.stopPropagation();
        }
      }
    }

    const selectState = (state: string, event: Event | null = null) => {
      if (selectedState === state) {
        // In this case should we keep the highlight?
        // Maybe just ditch the whole popup?
        deselectState(event);
        return;
      }
      if (selectedState !== null) {
        deselectState(event);
      }
      d3.select('select#state_select').selectAll(`option#${state}`).attr('selected', true);
      selectedState = state;
      let state_path = group.select(`path#state_${selectedState}`);
      let state_node = state_path.node();
      // Bring to front.
      state_node.parentNode.appendChild(state_node);
      const state_feature = data.find(s => s.id === selectedState);
      const state_name = state_feature ? state_feature.properties!.name : 'Unknown';
      const state_results = statesResults.find(s => s.id === state);
      const state_issues = state_results ? state_results.issueCounts : [];
      const topIssue = state_issues.length > 0 ? state_issues[0] : { name: 'No recorded calls' };
      d3.select('div#state_map').select('svg').attr('title', `${state}'s top: ${topIssue.name}. Map showing states colored by top issue. Select a state above.`);
      drawStateLabel(state_node, state_name, topIssue, deselectState);
      state_path.transition()
        .attr('stroke', selectedStateStroke).attr('stroke-width', 3);
      redrawStateResults(state);
    }

    // Draw the states
    group.selectAll('path')
      .data(data)
      .enter()
      .append('path')
      .attr('transform', `translate(${(svgWidth - width) / 2}, 0) scale(0.66, 0.66)`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-linecap', 'round')
      .style('cursor', 'pointer')
      // .attr('aria-label', d => {
      //   const topIssueId = summaryResults.find(state => state.state_geo_id === d.id).top_issue_id;
      //   return d.properties.name + ': ' + issues.get(topIssueId).name;
      // })
      .attr('id', (d: Feature) => 'state_' + d.id)
      .attr('fill', defaultColor)
      .attr('d', path)
      // This transition causes issues if the mouse passes over it b/c of the other transition perhaps?
      .transition().delay(500).duration(1000)
      .attr('fill', (d: Feature) => {
        const stateResult = statesResults.find(state => state.id === d.id);
        const stateTopIssues = stateResult ? stateResult.issueCounts : [];
        if (stateTopIssues.length > 0) {
          return issueColor(stateTopIssues[0].issue_id);
        }
        // Default white for no calls at all.
        return '#fff';
      })
      .on('end', function () {
        selectState(initialState);
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
              this.parentNode.appendChild(group.select(`path#state_${selectedState}`).node());
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
              this.parentNode.appendChild(group.select(`path#state_${selectedState}`).node());
            }
          });
      });

    svg.call(d3.zoom()
      .extent([[0, 0], [width, height]])
      .translateExtent([[-svgWidth, 0], [svgWidth, height]])
      .scaleExtent([1, 4])
      .on("zoom", zoomed));

    function zoomed({ transform }) {
      group.attr("transform", transform);
      if (selectedState !== null) {
        updateStateLabelPosition(group.select(`path#state_${selectedState}`).node());
      }
    }
  });
};

const expandRepResults = (results) => {
  const addedPoints = [];
  // Add a unique ID for the D3 animation later.
  let indexForId = 0;
  results.forEach(r => {
    r.id = indexForId++;
    for (let i = 1; i < r.count; i++) {
      // Expand the data based on the count to create enough dots.
      addedPoints.push({time: r.time, issue_id: r.issue_id, count: 1, id: indexForId++});
    }
  });
  results.push(...addedPoints);
};

const drawRepsPane = (repsData, finalDate, issueColor, issueIdToName, duration) => {
  const beeswarmScale = d3.scaleTime()
    .domain([finalDate - 7 * 24 * 60 * 60 * 1000, finalDate])
    .range([30, 570])
    .nice();

  repsData.repsData.forEach(d => {
    d.beeswarm = beeswarmForce()
      .y(300)
      .x(e => beeswarmScale(new Date(e.time * 1000))) // seconds since epoch --> ms
      .r(d.total > 500 ? 3 : d.total > 300 ? 4 : d.total > 100 ? 5 : d.total > 50 ? 6 : 10)(d.aggregatedResults)
  });

  const repCard = d3.select('div#reps_section').selectAll('.dashboard_card')
      .data(repsData.repsData)
      .enter()
      .append('div')
        .attr('id', d => `card_${d.id}`)
        .attr('class', 'dashboard_card');
        
  const leftSide = repCard.append('div');
  const totalCard = leftSide.append('div').attr('class', 'total_card');
  totalCard.append('h3').attr('class', 'subtitle_detail').html(`Total calls ${duration}`);
  totalCard.append('div').attr('class', 'highlight').html(d => d.total.toLocaleString());
  const totalSubtitle = totalCard.append('div').attr('class', 'subtitle');
  totalSubtitle.append('img')
      .attr('src', d => d.repInfo.photoURL)
      .style('float', 'left')
      .attr('alt', '');
  const nameSubtitleSection = totalSubtitle.append('div');
  nameSubtitleSection.append('div').attr('class', 'subtitle_main').html(d => {
    return `${d.repInfo.name}`
  });
  nameSubtitleSection.append('div').attr('class', '').html(d => {
    const district = d.repInfo.area === 'US House' ? localStorage.district : d.repInfo.state;
    return `${d.repInfo.party} from ${district}`;
  });

  const reachability = leftSide.append('div').attr('class', 'reachability');
  
  const repDetail = repCard.append('div')
      .attr('class', 'detail');
  repDetail.append('h3').attr('class','detail_title').html(`Top 5 Calls ${duration}`);
  repDetail.append('div')
      .attr('class', 'description')
      .html(d => {
        let text = `The five most-called issues to ${d.repInfo.name} ${duration} as recorded with 5 Calls, and call count for each in that time.`;
        if (d.total >= MIN_FOR_BEESWARM) {
          text += ' Tap an issue to see its calls below.';
        }
        return text;
      });
  const repTopCalls = repDetail
      .append('ol')
      .attr('id', d => `${d.id}_top`);
  repsData.repsData.forEach(d => {
    drawTopFiveIssues(`ol#${d.id}_top`, d.topIssues, issueColor, d.total, d.beeswarm);
  });
    
  drawBeeswarms(repDetail.append('div').style('position', 'relative'), beeswarmScale, issueIdToName, issueColor, duration);

  const pieSize = 60;
  const size = 40;
  reachability.append('h3').attr('class','detail_title').html('Reachability')
  reachability.append('div')
    .attr('class', 'description')
    .style('margin-bottom', '10px')
    .html(d => `${d.repInfo.name}'s office's availability ${duration}.`);
  const callResultsGroup = reachability.append('svg')
    .attr('width', pieSize)
    .attr('height', pieSize)
    .attr('aria-hidden', true)    // Empty alt text because this graphic is redundant with the percentages.
    .style('float', 'left')
    .style('align-content', 'center')
    .append('g')
    .attr('transform', `translate(${pieSize / 2}, ${pieSize / 2})`);
  callResultsGroup
    .append('path')
    .attr('fill', purple)
    .attr('stroke', '#fff')
    .attr('d', d3.arc()
      .innerRadius(`${size / 2}`)
      .outerRadius(`${pieSize / 2}`)
      .startAngle(0)
      .endAngle(d => 2 * Math.PI * d.percentVM));
  callResultsGroup
    .append('path')
    .attr('fill', themeColor)
    .attr('stroke', '#fff')
    .attr('d', d3.arc()
      .innerRadius(`${size / 2}`)
      .outerRadius(`${pieSize / 2}`)
      .startAngle(d => 2 * Math.PI * d.percentVM)
      .endAngle(d => 2 * Math.PI * (d.percentVM + d.percentContact)));
  callResultsGroup
    .append('path')
    .attr('fill', themeAccentColor)
    .attr('stroke', '#fff')
    .attr('d', d3.arc()
      .innerRadius(`${size / 2}`)
      .outerRadius(`${pieSize / 2}`)
      .startAngle(d => 2 * Math.PI * (d.percentVM + d.percentContact))
      .endAngle(2 * Math.PI));
  const resultsTextHolder = reachability.append('div')
    .style('float', 'left')
    .style('align-content', 'center')
    .style('margin-left', '16px');
  resultsTextHolder.append('div')
    .html(d => `<span class="results_vm">${(d.percentVM * 100).toFixed(0)}%</span> of calls went to voicemail`);
  resultsTextHolder.append('div')
    .html(d => `<span class="results_contact">${(d.percentContact * 100).toFixed(0)}%</span> of calls were answered`);  
  resultsTextHolder.append('div')
    .html(d => `<span class="results_unavailable">${(d.percentUnavailable * 100).toFixed(0)}%</span> of calls were unavailable`);
};

const drawBeeswarms = (repDetail, beeswarmScale, issueIdToName, issueColor, duration) => {
  repDetail.append('div')
    .attr('class', 'description')
    .attr('hidden', d => d.total < MIN_FOR_BEESWARM ? true : null)
    .html(d => `<h3>All calls to ${d.repInfo.name} about this issue ${duration}</h3><p>One dot represents one call. Tap an issue in the list above to highlight those calls. Your calls make a difference.</p>`);
  repDetail.append('div')
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

  const selectDot = function(event, dot) {
    // Bring to front
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
    screenCoords.y += 86; // height of the description stuff above.

    // Bounding box of the SVG.
    const svgBb = this.parentElement.parentElement.getBoundingClientRect();
    const yCoord = screenCoords.y - svgBb.y;
    const xCoord = screenCoords.x - svgBb.x;

    d3.select(this.parentElement.parentElement.parentElement).select('div#dot_label')
      .attr('hidden', null)
      .style('top', `${yCoord}px`)
      .style('left', `${xCoord}px`)
      .select('div.issue_long_name')
      // Can't append every time! but this does get the :after working.
      .html(`${dateFormatter.format(new Date(dot.data.time * 1000))}: ${issueIdToName[dot.data.issue_id]}`);
  };

  repDetail.append('svg')
    .attr('width', 600)
    .attr('id', d => 'beeswarm_svg_' + d.id)
    .style('margin-bottom', '48px')
    .each(function(data) {
      // For each rep's data
      const svg = d3.select(this);
      if (data.total < MIN_FOR_BEESWARM) {
        svg.attr('width', 0).attr('height', 0).attr('hidden', true);
        return;
      }
      svg.attr('title', `${data.total} dots representing calls, ordered by time on the x axis`)
      const initialIssueId = data.topIssues[0].issue_id;
      const initialIssueColor = issueColor(initialIssueId);
      const group = svg.append('g')
        .attr('aria-hidden', true) // Not useful for screen readers
        .attr('id', d => 'beeswarm_g_' + d.id);
      const middle = 300;
      group.selectAll('circle')
        .data(d => d.beeswarm, r => r.data.id)
        .enter()
        .append('circle')
        .attr('stroke', `#fff5`)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => d.r)
        .style('fill', d => d.data.issue_id === initialIssueId ? initialIssueColor : defaultColor)
        .on('pointerover', selectDot)
        .on('click', selectDot)
        .on('pointerout', function(event, d) {
          d3.select(this).attr('stroke', `#fff5`);
          d3.select(this.parentElement.parentElement.parentElement).select('div#dot_label')
            .attr('hidden', true);
        });

      const g = document.getElementById('beeswarm_g_' + data.id);
      const height = g.getBBox().height;
      const axisHeight = 20;
      g.setAttribute('transform', `translate(0, -${middle - height / 2 - 1})`);
      svg.append('g').attr('id', 'playbackLine').append('line')
        .attr('stroke', 'red')
        .attr('stroke-width', '2')
        .attr('x0', 0)
        .attr('x1', 0)
        .attr('y0', 0)
        .attr('y1', height);
      document.getElementById('beeswarm_svg_' + data.id).setAttribute('height', height + axisHeight);
      d3.select(g).on('click', function(event, d) {
        
        // Thanks ChatGPT for the help with sonification.
        let startAudioTime;
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const playTone = (frequency, offsetSeconds) => {
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
    
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(frequency, context.currentTime);
    
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
    
          gainNode.gain.setValueAtTime(0.2, context.currentTime + offsetSeconds);
          oscillator.start(context.currentTime + offsetSeconds);
          oscillator.stop(context.currentTime + offsetSeconds + 0.15);
        }
        const playBackgroundTone = (durationSeconds) => {
          const droneOsc = context.createOscillator();
          const droneGain = context.createGain();
        
          droneOsc.type = "triangle"; // Some texture
          droneOsc.frequency.setValueAtTime(220, context.currentTime); // Low tone
          droneGain.gain.setValueAtTime(0.05, context.currentTime); // Subtle volume
        
          droneOsc.connect(droneGain);
          droneGain.connect(context.destination);
        
          droneOsc.start(context.currentTime);
          droneOsc.stop(context.currentTime + durationSeconds);
        }
        const playData = (beeswarm) => {
          // We assume data has the oldest element first.
          for (let i = beeswarm.length - 1; i >= 0; i--) {
            const item = beeswarm[i];
            // 600 width / 85 -> about one second per day
            const timeOffsetSeconds = item.x / 85; // x0 is the preferred offset, x is where it is rendered.
            const baseFreq = 300 + (item.data.issue_id % 25) * 10; // TODO: Better to map based on the whole set of issues.
            playTone(baseFreq, timeOffsetSeconds);
          }
          beeswarmScale.ticks().forEach(t => {
            playTone(212, beeswarmScale(t) / 85);
          });
          playBackgroundTone(600 / 85);
          startAudioTime = context.currentTime;
        }
        const animateD3Update = () => {
          const now = context.currentTime;
          const elapsed = now - startAudioTime;
          const expectedTotal = 600 / 85;
          const currentProgress = elapsed / expectedTotal;
          if (currentProgress >= 1) {
            return;
          }
          d3.select('svg#beeswarm_svg_' + d.id).selectAll('g#playbackLine')
            .attr('transform', `translate(${currentProgress * 600}, 0)`)
          requestAnimationFrame(animateD3Update);
        }
        playData(d.beeswarm);
        requestAnimationFrame(animateD3Update);
      });

      // Add the axis.
      d3.select(g.parentElement).append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(beeswarmScale).tickSizeOuter(0).ticks(d3.timeDay))
    });
};

// `beeswarmForce` is from
// https://observablehq.com/@harrystevens/force-directed-beeswarm
const beeswarmForce = () => {
  let x = d => d[0];
  let y = d => d[1];
  let r = d => d[2];
  let ticks = 300;
  
  function beeswarm(data){
    const entries = data.map(d => {
      return {
        x0: typeof x === "function" ? x(d) : x,
        y0: typeof y === "function" ? y(d) : y,
        r: typeof r === "function" ? r(d) : r,
        data: d
      }
    });
    
    const simulation = d3.forceSimulation(entries)
        .force("x", d3.forceX(d => d.x0))
        .force("y", d3.forceY(d => d.y0))
        .force("collide", d3.forceCollide(d => d.r));
    
    for (let i = 0; i < ticks; i++) simulation.tick();
    
    return entries;
  }
  
  beeswarm.x = f => f ? (x = f, beeswarm) : x;
  beeswarm.y = f => f ? (y = f, beeswarm) : y;
  beeswarm.r = f => f ? (r = f, beeswarm) : r;
  beeswarm.ticks = n => n ? (ticks = n, beeswarm) : ticks;
  
  return beeswarm;
};

class Dashboard extends React.Component<null, State> {
  _defaultUsa: RegionSummaryData = {
    id: 'usa',
    name: 'USA',
    total: 0,
    issueCounts: [],
  }
  _defaultUsaSummary: UsaSummaryData = { usa: this._defaultUsa, states: [] };
  state = {
    usaData: this._defaultUsaSummary,
    repsData: null,
    isLoading: true,
  };

  componentDidMount() {
    getUsaSummary().then((usaSummaryData) => {
      getLocationSummary().then((repsSummaryData) => {
        this.setState({ usaData: usaSummaryData, repsData: repsSummaryData, isLoading: false });
      });
    });
  }

  render(): React.ReactNode {
    if (this.state.isLoading) {
      return (
        <span>
          Loading dashboard...
        </span>
      );
    }

    const usaData = this.state.usaData;
    const repsData = this.state.repsData;

    // TODO: Handle null repsData (no location set)

    const duration = 'this week';
    // IDs of top issues, to be used for coloring.
    const topIssueIds: number[] = usaData.usa.issueCounts.reduce((agg, row) => {
      agg.push(row.issue_id);
      return agg;
    }, [] as number[]);

    // Use consistent coloring throughout the dashboard.
    const issueColor = d3.scaleOrdinal<number, string>([
      themeColor,
      themeAccentColor,
      purple, //"#7570b3", // purple
      "#66a61e", // bright green
      "#e7298a", // pink
      "#e6ab02", // yellow
      "#a6761d", // brown
      "#1b9e77", // teal
      defaultDarkColor,
      // Now it repeats
    ]).domain(topIssueIds);

    const top_tabs = [];
    top_tabs.push({
      name: 'Your reps',
      id: 'your_reps',
      selected: repsData && repsData.reps.length > 0,
    });
    top_tabs.push({
      name: 'Nationwide',
      id: 'usa',
      selected: !repsData || repsData.reps.length == 0,
    });
    
    const tabs = [];
    if (repsData) {
    repsData.reps.forEach(r => tabs.push({
      name: r.name, 
      id: r.id,
      selected: false}));  // would take their reps directly so can show 0?
    tabs[0].selected = true;
    }

  let usaPaneDrawn = false;

    const handleTopNavClick = function(event, newTab) {
      top_tabs.forEach(t => t.selected = false);
      newTab.selected = true;
      topNavButtons.attr('aria-selected', t => t.selected)
          .attr('class', t => t.selected ? 'selected' : null)
      d3.selectAll('div.dashboard_card').style('display', 'none');
      if (newTab.id === 'usa') {
        d3.select(`div#card_usa.dashboard_card`).style('display', 'flex');
        if (!usaPaneDrawn) {
          // Draw it the first time it is needed.
          // TODO: Use something other than repsData if no repsData to get state.
          drawUsaPane(usaData, localStorage.district.split('-')[0], issueColor, duration);
          usaPaneDrawn = true;
        }
        d3.select('div#nav').style('visibility', 'hidden').attr('aria-hidden', true);
      } else {
        d3.select('div#nav').style('visibility', 'visible').attr('aria-hidden', null);
        const selectedRepId = tabs.find(t => t.selected === true).id;
        d3.select(`div#card_${selectedRepId}.dashboard_card`).style('display', 'flex');
      }
    };

    // TODO: Refactor button creation to shared helper?
    const topNavButtons = d3.select('div#topNav').selectAll('button')
      .data(top_tabs)
      .enter()
      .append('button')
      .attr('role', 'tab')
      .attr('aria-selected', t => t.selected)
      .attr('class', t => t.selected ? 'selected' : null)
      .html(t => t.name);
    topNavButtons
      .on('click', handleTopNavClick);

    const navButtons = d3.select('div#nav').selectAll('button')
      .data(tabs)
      .enter()
      .append('button')
      .attr('role', 'tab')
      .attr('aria-selected', t => t.selected)
      .attr('class', t => t.selected ? 'selected' : null)
      .html(t => t.name);
    navButtons
      .on('click', function(event, newTab) {
        tabs.forEach(t => t.selected = false);
        newTab.selected = true;
        navButtons.attr('aria-selected', t => t.selected)
            .attr('class', t => t.selected ? 'selected' : null)
        d3.selectAll('div.dashboard_card').style('display', 'none');
        d3.select(`div#card_${newTab.id}.dashboard_card`).style('display', 'flex');
      });

      if (repsData) {
    repsData.repsData.forEach(r => {
      // In-place expand to individual calls.
      expandRepResults(r.aggregatedResults);
      r.repInfo = repsData.reps.find(s => s.id === r.id);
      const vmOutcomes = r.outcomes.find(s => s.result === 'voicemail');
      const contactOutcomes = r.outcomes.find(s => s.result === 'contact');
      const unavailableOutcomes = r.outcomes.find(s => s.result === 'unavailable');
      const numVm = !vmOutcomes ? 0 : vmOutcomes.count;
      const numContact = !contactOutcomes ? 0 : contactOutcomes.count;
      const numUnavailable = !unavailableOutcomes ? 0 : unavailableOutcomes.count;
      r.percentVM = numVm / r.total;
      r.percentContact = numContact / r.total;
      r.percentUnavailable = numUnavailable / r.total;
    });
  }

    const issueIdToName: { [key: number]: string } = usaData.usa.issueCounts.reduce((agg, row) => {
      if (!agg[row.issue_id]) {
        agg[row.issue_id] = row.name;
      };
      return agg;
    }, {} as { [key: number]: string });

    d3.selectAll('h3.subtitle_detail').html(`Total calls ${duration}`)
    if (repsData) {
    drawRepsPane(repsData, Date.now(), issueColor, issueIdToName, duration, tabs[0].name);
    }
    handleTopNavClick(null, top_tabs.find(t => t.selected));

    d3.select('div#dashboard-content').style('visibility', 'visible');


    // No message.
    return (
      <span></span>
    );

  }
}

export default Dashboard;
