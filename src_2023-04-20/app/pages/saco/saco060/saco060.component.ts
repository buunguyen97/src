import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxDataGridComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { Saco060Service, Saco060VO } from './saco060.service';

@Component({
  selector: 'app-saco060',
  templateUrl: './saco060.component.html',
  styleUrls: ['./saco060.component.scss']
})
export class Saco060Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;

  G_TENANT: any;
  userGroup: any;
  userCompany: any;

  // Grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  mainFormData: Saco060VO = {} as Saco060VO;

  // DataSet
  dsExpt	= []; // 수출사
  dsUser    = []; // 사용자
  dsCaY 	= [];
  dsCaM 	= [];

  fromMonth = this.utilService.getFormatMonth(new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()));
  toMonth = this.utilService.getFormatMonth(new Date());

  constructor(public utilService: CommonUtilService,
              public bizService: BizCodeService,
              private service: Saco060Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
                this.G_TENANT = this.utilService.getTenant();
                this.ordGbNm = this.ordGbNm.bind(this);
                this.userGroup = this.utilService.getUserGroup();
                this.userCompany = this.utilService.getCompany();
  }

  // Grid State
  GRID_STATE_KEY = 'saor_saor140_1';
  loadStateMain  = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain  = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub   = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub   = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  ngOnInit(): void {

    // 수출사
    if (this.userGroup === '3') {
      this.service.getExptPtrn(this.G_TENANT, this.userCompany).subscribe(result => {
        this.dsExpt = result.data;
      });
    } else {
      this.bizService.getCust(this.G_TENANT, '', 'Y', '', 'Y', '', '').subscribe(result => {
        this.dsExpt = result.data;
      });
    }

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });

  }

  // 그리드 초기화 함수
  ngAfterViewInit(): void {
    this.initForm();
    this.utilService.getGridHeight(this.mainGrid);
  }

  initForm(): void {
    // 공통 조회 조건 set
  }

  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      this.mainFormData.fromClaimCaYM = document.getElementsByName('fromClaimCaYM').item(1).getAttribute('value').replace(/-/gi, '');
      this.mainFormData.toClaimCaYM = document.getElementsByName('toClaimCaYM').item(1).getAttribute('value').replace(/-/gi, '');

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStoreMainGrid = new ArrayStore({
          data: result.data,
          key: 'claim_no',
        });
        this.dsMainGrid = new DataSource({
          store: this.entityStoreMainGrid
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
  }

  // 검색영역 초기화
  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 작업상태 표현식
  ordGbNm(rowData): any {
    let nm = '';

    if ( this.utilService.getLanguage() === 'ko' ) {
      if (     rowData.ord_gb === '1'){ nm = '판매'; }
      else if (rowData.ord_gb === '2'){ nm = '렌탈'; }
      else if (rowData.ord_gb === '3'){ nm = '견본,타계정'; }
    }
    else {
      if (     rowData.ord_gb === '1'){ nm = 'Sale'; }
      else if (rowData.ord_gb === '2'){ nm = 'Rental'; }
      else if (rowData.ord_gb === '3'){ nm = 'Sample'; }
    }
    return nm;
  }

  // 달력 년/월 표현식
  clsMon(rowData): any {
    const clsMon = rowData.cls_mon;
    const yy = clsMon.substring(0, 4);
    const mm = clsMon.substring(4, 6);
    const result = yy + '-' + mm;

    return result;
  }
}
