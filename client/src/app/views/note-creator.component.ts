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
    <div class="note-creator shadow-2" [ngStyle]="{'background-color': newNote.bgColor}">
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
  public colors: string[] = [
    '#B19CD9',
    '#FF6961',
    '#77DD77',
    '#AEC6CF',
    '#F49AC2',
    '#FFFF00',
    '#00FFFF',
    '#FFFFFF'
  ];
  public newNote = {
    title: '',
    value: '',
    bgColor: 'white'
  };
  public fullForm: boolean = false;

  public onCreateNote() {

    const { title, value, bgColor } = this.newNote;

    if (title && value) {
      let items = [{content: value}];
      this.createNote.next({ title, items, bgColor });
    }

    this.reset();
    this.fullForm = false;
  }

  public reset() {
    this.newNote = {
      title: '',
      value: '',
      bgColor: 'white'
    };
  }

  public toggle(value: boolean) {
    this.fullForm = value;
  }

  public onColorSelect(color: string) {
    this.newNote.bgColor = color;
  }
}
