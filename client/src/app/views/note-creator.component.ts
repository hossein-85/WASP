import {
  Component,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'note-creator',
  styles: [`
    .note-creator {
      padding: 20px;
      background-color: white;
      border-radius: 3px;
    }
    .title {
      font-weight: bold;
      color: rgba(0,0,0,0.8);
    }
    .full {
      height: 100px;
    }
  `],
  template: `
    <div class="note-creator shadow-2" [ngStyle]="{'background-color': newNote.color}">
      <form class="row" (ngSubmit)="onCreateNote()">
        <input
          type="text"
          (focus)="toggle(true)"
          [(ngModel)]="newNote.title"
          name="newNoteTitle"
          placeholder="Title"
          class="col-xs-10 title"
          *ngIf="fullForm"
        >
        <input
          type="text"
          (focus)="toggle(true)"
          [(ngModel)]="newNote.value"
          name="newNoteValue"
          placeholder="Take a note..."
          class="col-xs-10"
        >
        <div class="actions col-xs-12 row between-xs" *ngIf="fullForm">
          <div class="col-xs-3">
            <color-picker
              (selected)="onColorSelect($event)"
              [colors]="colors"
            >
            </color-picker>
          </div>
          <button
            type="submit"
            class="btn-light"
           >
            Done
          </button>
        </div>
      </form>
    </div>
  `
})
export class NoteCreatorComponent {
  @Output() public createNote = new EventEmitter();
  public colors: string[] = ['#B19CD9', '#FF6961', '#77DD77', '#AEC6CF', '#F49AC2', 'white'];
  public newNote = {
    title: '',
    value: '',
    color: 'white'
  };
  public fullForm: boolean = false;

  public onCreateNote() {

    const { title, value, color } = this.newNote;

    if (title && value) {
      this.createNote.next({ title, value, color });
    }

    this.reset();
    this.fullForm = false;
  }

  public reset() {
    this.newNote = {
      title: '',
      value: '',
      color: 'white'
    };
  }

  public toggle(value: boolean) {
    this.fullForm = value;
  }

  public onColorSelect(color: string) {
    this.newNote.color = color;
  }
}
