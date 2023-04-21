import {Component, OnInit, AfterViewInit, ViewChild} from '@angular/core';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxDataGridComponent} from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { Saca020Service, Saca020VO } from './saca020.service';

@Component({
  selector: 'app-saca020',
  templateUrl: './saca020.component.html',
  styleUrls: ['./saca020.component.scss']
})

export class Saca020Component implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('subGrid', {static: false}) subGrid: DxDataGridComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  G_TENANT: any;

  // Grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;
  dsSubGrid: DataSource;
  entityStoreSubGrid: ArrayStore;

  mainFormData: Saca020VO = {} as Saca020VO;

  dsUser = [];

  now = this.utilService.getFormatMonth(new Date());

  constructor(public utilService: CommonUtilService,
              public bizService: BizCodeService,
              private service: Saca020Service,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
                this.G_TENANT = this.utilService.getTenant();
                this.ordGbNm = this.ordGbNm.bind(this);
  }

  key = ['claim_no', 'out_ord_no'];

  // Grid State
  GRID_STATE_KEY = 'saor_saor140_1';
  loadStateMain  = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain  = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateSub   = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_sub');
  saveStateSub   = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_sub');

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    // 아코디언 모두 펼치기
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.initForm();
    this.utilService.getGridHeight(this.subGrid);
  }

  // search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
  }

  // 작업상태 표현식
  ordGbNm(rowData): any {
    let nm = '';
    if ( this.utilService.getLanguage() === 'ko' ) {
      if (      rowData.ord_gb === '1' ) { nm = '판매'; }
      else if ( rowData.ord_gb === '2' ) { nm = '렌탈'; }
    }
    else {
      if (      rowData.ord_gb === '1' ) { nm = 'Sale'; }
      else if ( rowData.ord_gb === '2' ) { nm = 'Rental'; }
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

  // 메인 그리드 조회
  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    if (data.isValid) {

      // Sub 그리드 비우기.
      if (!!this.dsSubGrid) {
        this.entityStoreSubGrid.clear();
        this.dsSubGrid.reload();
      }

      this.mainFormData.caYM = document.getElementsByName('caYM').item(1).getAttribute('value').replace(/-/gi, '');

      const result = await this.service.mainList(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        this.entityStoreMainGrid = new ArrayStore({
          data: result.data,
          key: 'ord_gb',
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

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  onFocusedRowChanged(e, grid): void {
    console.log('onFocusedRowChanged   ROW Changing');
    // grid.focusedRowIndex = e.rowIndex;

    if (e.row) {
      this.onSubSearch(e.row.data.ord_gb, this.mainFormData.caYM);  // 상세조회
    }
  }

  // 조회
  async onSubSearch(ordGb: string, caYM: string): Promise<void> {
    if (ordGb) {
      // Service의 get 함수 생성
      const result = await this.service.subList({ord_gb: ordGb, caYM});

      // 조회 결과가 success이면 화면표시, 실패면 메시지 표시

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      }
      else {
        this.subGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');
        // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        this.entityStoreSubGrid = new ArrayStore({
          data: result.data,
          key: this.key,
        });
        // ArrayStore - DataSource와 바인딩.
        // 그리드와 매핑되어 그리드를 Reload하거나 할 수 있음.
        this.dsSubGrid = new DataSource({
          store: this.entityStoreSubGrid
        });
        // 그리드 상태가 수시로 저장되어 포커스가 있을경우 해당 포커스로 강제 페이지 이동되기 때문에, 그리드의 포커스 없앰
        // 페이징번호도 강제로 1페이지로 Fix
        // 참고 : grid1은 HTML에서 그리드의 이름이 #grid1로 명시되어 있으며, Behind 상단에 @ViewChild에 DxDataGridComponent로 선언되어 있음.
        this.subGrid.focusedRowKey = null;
        this.subGrid.paging.pageIndex = 0;
      }
    }
  }
}
