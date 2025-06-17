import React from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { Feature, Geometry, GeoJsonProperties } from 'geojson';
import { getUsaSummary, IssueCountData, RegionSummaryData, UsaSummaryData } from '../utils/api';

// Dashboard state, not State as a region
interface State {
  usaData: UsaSummaryData;
  isLoading: boolean
}

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

  // const translateX = boundingBox.x + 3 / 4 * boundingBox.width;// - svgBb.x + groupBb.x;
  // const translateY = boundingBox.y + 3 / 4 * boundingBox.height;// - svgBb.y + groupBb.y + 24;
  d3.select('div#state_map_label')
    .style('top', `${yCoord}px`)
    .style('left', `${xCoord}px`);
};

const drawStateResults = (allStateResults: RegionSummaryData[], state: string, issueColor: d3.ScaleOrdinal<number, string>, duration: string) => {
  const stateResults = allStateResults.find(d => d.id === state);
  if (!stateResults) {
    // TODO: Handle this more gracefully.
    return;
  }
  d3.select("h3#state_detail_title").attr('class', 'detail_title').html(`Top 5 Calls in ${stateResults.name} ${duration}`);
  d3.selectAll('div#total_state')
    .html(stateResults.total.toLocaleString());
  d3.selectAll('div#state_name_subtitle').html(stateResults.name);
  // TODO: Use D3 to transform rather than clearing and redrawing everything.
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
    .attr('href', (d: IssueCountData) => `https://5calls.org/issue/${d.slug}`)
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

  // TODO make a helper for the select/deselect repeated code.

  // Only show beeswarm if there's enough calls.
  if (beeswarmData !== null && beeswarmData.length >= MIN_FOR_BEESWARM) {
    let selectedIssueId: number | null = data[0].issue_id;
    topFiveRow.on('pointerover', function (_, d: IssueCountData) {
      if (selectedIssueId !== d.issue_id) {
        d3.select(this).style('background-color', hoverColor);
        d3.select(this.parentNode.parentNode.parentNode).selectAll('circle')
          .data(beeswarmData, b => b.data.id)
          .transition().delay(0)
          .attr('fill', b => b.data.issue_id === selectedIssueId ? issueColor(selectedIssueId) :
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
            .attr('fill', '#ccc');
        } else {
          // select
          selectedIssueId = d.issue_id;
          d3.select(holder).selectAll('li.top_five').style('background-color', '#fff');
          d3.select(this).style('background-color', hoverColor);
          d3.select(this.parentNode.parentNode.parentNode).selectAll('circle')
            .data(beeswarmData, b => b.data.id)
            .transition().delay(0)
            .attr('fill', b => b.data.issue_id === selectedIssueId ? issueColor(selectedIssueId) : '#ccc');
        }
      })
      .on('pointerout', function (_, d: IssueCountData) {
        if (selectedIssueId !== d.issue_id) {
          d3.select(this).style('background-color', '#fff');
          d3.select(this.parentNode.parentNode.parentNode).selectAll('circle')
            .data(beeswarmData, b => b.data.id)
            .transition().delay(0)
            .attr('fill', b => b.data.issue_id === selectedIssueId ? issueColor(selectedIssueId) : '#ccc');
        }
      });

    // Perform the initial selection.
    topFiveRow.style('background-color', d => d.issue_id === selectedIssueId ? hoverColor : '#fff');
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
      .html((d: IssueCountData) => `<b>${d.count} states</b>: ${d.name}`);

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
      .on('input', (event: Event, d) => {
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
      .attr('selected', d => d.id === initialState ? 'true' : null)
      .attr('id', d => d.id)
      .html(d => d.properties.name);

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
          .on('click', function (event: Event, d) {
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
    isLoading: true,
  };

  componentDidMount() {
    getUsaSummary().then((usaSummaryData) => {
      this.setState({ usaData: usaSummaryData, isLoading: false });
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


    const issueIdToName: { [key: number]: string } = usaData.usa.issueCounts.reduce((agg, row) => {
      if (!agg[row.issue_id]) {
        agg[row.issue_id] = row.name;
      };
      return agg;
    }, {} as { [key: number]: string });

    d3.selectAll('div.subtitle_detail').html(`Total calls ${duration}`)
    drawUsaPane(usaData, localStorage.district.split('-')[0], issueColor, duration);

    d3.select('div#dashboard-content').attr('hidden', null);
    // No message.
    return (
      <span></span>
    );

  }
}

export default Dashboard;
