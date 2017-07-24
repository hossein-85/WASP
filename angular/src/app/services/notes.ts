import { Injectable } from '@angular/core';
import { ApiService } from './api';
import 'rxjs/Rx';

@Injectable()
export class NoteService {
  public path: string = '/notes';
  constructor(private apiService: ApiService) {}

  public createNote(note) {
    return this.apiService.post(this.path, note);
  }

  public getNotes() {
    return this.apiService.get(this.path);
  }

  public completeNote(note) {
    return this.apiService.delete(`${this.path}/${note.id}`);
  }
}
