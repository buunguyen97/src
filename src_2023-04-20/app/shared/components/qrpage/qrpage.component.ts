import {Component, OnInit} from '@angular/core';
import {RcvexpectedService} from '../../../pages/rcv/rcvexpected/rcvexpected.service';

@Component({
  selector: 'app-qrpage',
  templateUrl: './qrpage.component.html',
  styleUrls: ['./qrpage.component.scss']
})
export class QrpageComponent implements OnInit {

  fromDate;
  toDate;

  constructor(
    private service: RcvexpectedService
  ) {
    const body = document.getElementsByTagName('body').item(0);
    body.setAttribute('style', 'min-width: 0px;');
  }

  ngOnInit(): void {

    this.onSearch();
  }

  async onSearch(): Promise<void> {
    const result = await this.service.getRcvFull({uid: 560});

    // console.log(result.data);
    this.fromDate = result.data.rcvSchDate;
    this.toDate = result.data.rcvSchDate;
  }

}
