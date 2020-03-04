import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { EmployeeService, Team, TeamProject } from './core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  fileName: string;
  teamProjectsToShow$: Observable<TeamProject[]> = this.employeeService.teamProjectsToShow;
  bestTeam$: Observable<Team> = this.employeeService.bestTeam;

  constructor(private employeeService: EmployeeService) { }

  onFileChange(event: Event) {
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    if (fileInput.files.length === 0) {
      return;
    }

    const file = fileInput.files[0];
    this.fileName = file.name;

    const reader = new FileReader();
    reader.onload = () => this.onFileLoad(reader.result as string);
    reader.readAsText(file);
  }

  onFileLoad(readerResult: string) {
    if (!readerResult) {
      throw new Error('Can\'t read file content.');
    }

    this.employeeService.parseFileContent(readerResult);
    this.employeeService.processWorkLogList();
  }

}
