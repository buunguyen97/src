import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';

@Component({
  selector: 'app-sopopup',
  templateUrl: './sopopup.component.html',
  styleUrls: ['./sopopup.component.scss']
})
export class SopopupComponent implements OnInit {

  @Input() visible1: boolean;
  @Output() sendMyEvent: EventEmitter<any> = new EventEmitter();

  constructor(

  ) {
  }

  ngOnInit(): void {
  }
}
