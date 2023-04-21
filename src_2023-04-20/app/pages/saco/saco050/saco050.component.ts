import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Saco050Service, Saco050VO} from './saco050.service';

@Component({
  selector: 'app-saco050',
  templateUrl: './saco050.component.html',
  styleUrls: ['./saco050.component.scss']
})
export class Saco050Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Saco050Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.ordGbNm = this.ordGbNm.bind(this);
    this.sessionUserId = this.utilService.getUserUid();

  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;


  dsOrdGb     = []; // 주문구분
  dsUser      = []; // 사용자

  // Global
  G_TENANT: any;
  sessionUserId: any;

  mainFormData: Saco050VO = {} as Saco050VO;

  // main grid
  dsMainGrid: DataSource;
  dsSubGrid: DataSource;
  entityStoreMainGrid: ArrayStore;
  entityStoreSubGrid: ArrayStore;

  key = ['claim_no', 'depo_no'];

  // Grid State
  GRID_STATE_KEY = 'saor_saco050_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  ngOnInit(): void {
    // 주문구분
    this.dsOrdGb = [{cd: '1', nm: '판매'},
                    {cd: '2', nm: '렌탈'}];
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => { this.dsUser = result.data; });
}

  ngAfterViewInit(): void {
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.initForm();
    this.utilService.getGridHeight(this.subGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('depoDate').option('value', this.bizService.getDay(0, '-'));
  }

  // 작업상태 표현식
  ordGbNm(rowData): any {
    let nm = '';

    if ( this.utilService.getLanguage() === 'ko' ) {
      if (      rowData.ord_gb === '1' ) { nm = '판매'; }
      else if ( rowData.ord_gb === '2' ) { nm = '렌탈'; }
    }
    else {
      if (rowData.ord_gb === '1' ) { nm = 'Sale'; }
      else if ( rowData.ord_gb === '2' ) { nm = 'Rental'; }
    }
    return nm;
  }

  // 메인 그리드 조회
  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStoreMainGrid = new ArrayStore(
          {
            data: result.data,
            key: 'sale_depo_amt'
          }
        );
        this.dsMainGrid = new DataSource({
          store: this.entityStoreMainGrid
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        const keys = this.mainGrid.instance.getSelectedRowKeys();
        this.mainGrid.instance.deselectRows(keys);
      }
    }
    this.onSubSearch();
  }


  clsMon(rowData): any {
    const clsMon = rowData.cls_mon;
    const yy = clsMon.substring(0, 4);
    const mm = clsMon.substring(4, 6);
    const result = yy + '-' + mm;
    return result;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // 조회
  async onSubSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      const result = await this.service.subList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.subGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStoreSubGrid = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dsSubGrid = new DataSource({
          store: this.entityStoreSubGrid
        });
        this.subGrid.focusedRowKey = null;
        this.subGrid.paging.pageIndex = 0;

        const keys = this.subGrid.instance.getSelectedRowKeys();
        this.subGrid.instance.deselectRows(keys);
      }
    }
  }
}
