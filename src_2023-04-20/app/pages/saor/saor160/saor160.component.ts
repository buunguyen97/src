import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saor160Service, Saor160VO} from './saor160.service';


@Component({
  selector: 'app-saor160',
  templateUrl: './saor160.component.html',
  styleUrls: ['./saor160.component.scss']
})
export class Saor160Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saor160Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.ordGbNm = this.ordGbNm.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('fromOutDate', {static: false}) fromOutDate: DxDateBoxComponent;
  @ViewChild('toOutDate', {static: false}) toOutDate: DxDateBoxComponent;

  G_TENANT: any;
  mainFormData: Saor160VO = {} as Saor160VO;
  key = ['out_ord_no', 'item_cd'];

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;

  dsCountry = []; // 국가
  dsUser = []; // 사용자
  dsUnit = []; // 단위
  dsPort      = []; // 항구

  ngAfterViewInit(): void {
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  ngOnInit(): void {

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    // 단위
    this.codeService.getCode(this.G_TENANT, 'UNITSTYLE').subscribe(result => {
      this.dsUnit = result.data;
    });

    // 항구
    this.codeService.getCode(this.G_TENANT, 'PORT').subscribe(result => { this.dsPort = result.data; });
  }


  // 메인 그리드 조회
  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.fromOutDate = document.getElementsByName('fromOutDate').item(1).getAttribute('value');
      this.mainFormData.toOutDate = document.getElementsByName('toOutDate').item(1).getAttribute('value');

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key,
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  /**
   *  이벤트 메소드 START
   */
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // search Form 초기화
  initForm(): void {
    const rangeDate = this.utilService.getDateRange();

    this.fromOutDate.value = rangeDate.fromDate;
    this.toOutDate.value = rangeDate.toDate;
  }


  // 작업상태 표현식
  ordGbNm(rowData): any {

    let nm = '';
    if (this.utilService.getLanguage() === 'ko') {
      if (rowData.ord_gb === '1') {
        nm = '판매';
      } else if (rowData.ord_gb === '2') {
        nm = '렌탈';
      } else if (rowData.ord_gb === '3') {
        nm = '견본,타계정';
      }
    } else {
      if (rowData.ord_gb === '1') {
        nm = 'Sale';
      } else if (rowData.ord_gb === '2') {
        nm = 'Rental';
      } else if (rowData.ord_gb === '3') {
        nm = 'Sample';
      }
    }
    return nm;
  }

}
