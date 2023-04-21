import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {Saor130Service, Saor130VO} from './saor130.service';

@Component({
  selector: 'app-saor130',
  templateUrl: './saor130.component.html',
  styleUrls: ['./saor130.component.scss']
})
export class Saor130Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('fromOutDate', {static: false}) fromOutDate: DxDateBoxComponent;
  @ViewChild('toOutDate', {static: false}) toOutDate: DxDateBoxComponent;

  G_TENANT: any;
  key = ['item_cd', 'item_nm', 'out_ord_no'];

  // main grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  mainFormData: Saor130VO = {} as Saor130VO;

  dsItemcode = [];	// 품목
  dsUser = [];		// 사용자
  dsUnit = [];		// 단위
  dsPort      = []; // 항구

  constructor(public utilService: CommonUtilService,
              public bizService: BizCodeService,
              private service: Saor130Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.ordGbNm = this.ordGbNm.bind(this);
  }

  ngOnInit(): void {
    // 품목
    this.bizService.getItem(this.G_TENANT, '', '', '', '', '').subscribe(result => {
      this.dsItemcode = result.data;
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

  ngAfterViewInit(): void {
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
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
        this.entityStore = new ArrayStore({
          data: result.data,
          key: this.key,
        });

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

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
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
