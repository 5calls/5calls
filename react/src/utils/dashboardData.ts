import * as d3 from 'd3';
import { Contact } from '../common/models/contact';
import {
  ContactSummaryData,
  RepsSummaryData,
  RegionSummaryData,
  IssueCountData,
  UsaSummaryData
} from './api';
import { Feature } from 'geojson';

//
// Data processing utilities for the Dashboard.
//

// Represents the information and call details about a single representative.
// Used to draw a representative's tab pane in the dashboard.
export interface ExpandedRepData {
  id: string;
  repInfo: Contact;
  total: number;
  outcomes: OutcomeSummaryData[];
  topIssues: IssueCountData[];
  callResults: BeeswarmCallCount[];
  beeswarm: BeeswarmNode<BeeswarmCallCount>[];
  numVoicemail: number;
  percentVM: number;
  percentContact: number;
  percentUnavailable: number;
}

// Represents a single call to a representative, about a particular issue and at a given time.
export interface BeeswarmCallCount {
  issue_id: number;
  count: number;
  time: number;
  id: number;
  selected: boolean;
}

// Describes call outcomes (e.g. 73 calls to voicemail).
export interface OutcomeSummaryData {
  result: string;
  count: number;
}

// Represents an individual point in the beeswarm plot.
export interface BeeswarmNode<T> extends d3.SimulationNodeDatum {
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

/**
 * Processes the summary data for representatives, expanding it for use in the dashboard.
 * @param repsSummaryData The raw summary data from the API.
 * @returns An array of processed representative data.
 */
export function processRepsData(
  repsSummaryData: RepsSummaryData | null
): ExpandedRepData[] {
  if (!repsSummaryData) {
    return [];
  }

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
      expandedResult.callResults =
        contactSummaryData.aggregatedResults as unknown as BeeswarmCallCount[];

      // In-place expand to individual calls.
      expandRepResults(expandedResult.callResults);

      // Calculate aggregated reachability stats.
      if (contactSummaryData.outcomes) {
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

        if (contactSummaryData.total > 0) {
          expandedResult.percentVM = numVm / contactSummaryData.total;
          expandedResult.percentContact = numContact / contactSummaryData.total;
          expandedResult.percentUnavailable =
            numUnavailable / contactSummaryData.total;
        }
      }
    }
    repsData.push(expandedResult);
  });
  return repsData;
}

const expandRepResults = (results: BeeswarmCallCount[]) => {
  const addedPoints: BeeswarmCallCount[] = [];
  // Add a unique ID for the D3 animation later.
  let indexForId = 0;
  results.forEach((r) => {
    // Add an ID for this point, and subsequent IDs for its expanded points.
    r.id = indexForId++;
    r.selected = false;
    for (let i = 1; i < r.count; i++) {
      // Expand the data based on the count to create enough dots.
      addedPoints.push({
        time: r.time,
        issue_id: r.issue_id,
        count: 1,
        selected: false,
        id: indexForId++
      });
    }
  });
  results.push(...addedPoints);
};

export function getUsaMapKeyData(
  statesResults: RegionSummaryData[],
  data: Feature[]
): IssueCountData[] {
  const filteredStatesResults = statesResults.filter((stateResults) =>
    data.find((d) => d.id === stateResults.id)
  );
  const keyData = filteredStatesResults.reduce((agg, row) => {
    if (!row.issueCounts || row.issueCounts.length === 0) {
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
  return keyData;
}

export function getTopIssueData(usaData: UsaSummaryData): {
  topIssueIds: number[];
  issueIdToName: { [key: number]: string };
} {
  const topIssueIds: number[] = usaData.usa.issueCounts.reduce((agg, row) => {
    agg.push(row.issue_id);
    return agg;
  }, [] as number[]);

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
  return { topIssueIds, issueIdToName };
}
