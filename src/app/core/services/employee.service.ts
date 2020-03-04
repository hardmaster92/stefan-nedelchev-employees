import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { NEW_LINE_REGEX, WEEKDAY_COMMA_REGEX } from '../constants';
import { Team, TeamProject, WorkLog } from '../model';
import { calculateOverlappingDays, checkOverlap, hasExistingPair, isTheSamePair } from '../utils';

@Injectable()
export class EmployeeService {
  private workLogList: WorkLog[];
  private teamProjects: TeamProject[];
  private accumulatedTeams: Team[];

  private teamProjectsToShowSubject = new BehaviorSubject<TeamProject[]>([]);
  public teamProjectsToShow = this.teamProjectsToShowSubject.asObservable().pipe(distinctUntilChanged());

  private bestTeamSubject = new BehaviorSubject<Team>(null);
  public bestTeam = this.bestTeamSubject.asObservable().pipe(distinctUntilChanged());

  constructor() { }

  public parseFileContent(textContent: string) {
    const rows = textContent.split(NEW_LINE_REGEX);

    if (rows.length === 0) {
      return;
    }

    this.workLogList = [];

    rows.forEach(row => {
      // Remove commas after week days that appear in some date formats to prevent splitting into additional columns
      // (e.g. Mon, Jan 25 2020 02:00:00 GMT+0200)
      row = row.replace(WEEKDAY_COMMA_REGEX, '$1');

      const columns = row.split(',');
      this.workLogList.push(new WorkLog(
        columns[0].trim(),
        columns[1].trim(),
        columns[2].trim(),
        columns[3]?.trim()
      ));
    });
  }

  public processWorkLogList() {
    this.resetLists();
    const listLength: number = this.workLogList.length;

    for (let i = 0; i < listLength - 1; i++) {
      for (let j = i + 1; j < listLength; j++) {
        const firstLog: WorkLog = this.workLogList[i];
        const secondLog: WorkLog = this.workLogList[j];

        if (firstLog.projectId === secondLog.projectId && checkOverlap(firstLog, secondLog)) {
          const overlappingDays: number = calculateOverlappingDays(firstLog, secondLog);
          if (overlappingDays > 0) {
            this.updateEmployeeLists(firstLog, secondLog, overlappingDays);
          }
        }
      }
    }

    // Sort the list with accumulated work days for all team pairs in descending direction
    this.accumulatedTeams.sort((p1, p2) => p2.daysWorked - p1.daysWorked);
    // The team with most work days should now be at the top of the list
    this.bestTeamSubject.next(this.accumulatedTeams[0]);
    // Filter employee project records that match the bestTeam pair so they can be displayed in the table
    const teamProjects = this.teamProjects.filter(p => isTheSamePair(p, this.bestTeamSubject.value));
    this.teamProjectsToShowSubject.next(teamProjects);

    console.log('team projects', this.teamProjectsToShowSubject.value);
    console.log('best team', this.bestTeamSubject.value);
  }

  public updateEmployeeLists(firstLog: WorkLog, secondLog: WorkLog, overlappingDays: number) {
    const teamProject: TeamProject = {
      firstEmployeeId: firstLog.employeeId,
      secondEmployeeId: secondLog.employeeId,
      projectId: firstLog.projectId,
      daysWorked: overlappingDays
    };

    this.teamProjects.push(teamProject);

    const existingTeam = this.accumulatedTeams.find(p => hasExistingPair(p, firstLog, secondLog));
    if (existingTeam) {
      // This pair of employees already exists in the accumulated list so we only add the overlappying days
      existingTeam.daysWorked += overlappingDays;
    } else {
      this.accumulatedTeams.push({
        firstEmployeeId: teamProject.firstEmployeeId,
        secondEmployeeId: teamProject.secondEmployeeId,
        daysWorked: overlappingDays
      });
    }
  }

  private resetLists() {
    this.teamProjects = [];
    this.accumulatedTeams = [];
    this.teamProjectsToShowSubject.next([]);
    this.bestTeamSubject.next(null);
  }
}
