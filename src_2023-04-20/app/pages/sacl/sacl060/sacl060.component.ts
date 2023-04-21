import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import {CommonUtilService} from 'src/app/shared/services/common-util.service';
import {CommonCodeService} from 'src/app/shared/services/common-code.service';
import {BizCodeService} from 'src/app/shared/services/biz-code.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent, DxDateBoxComponent} from 'devextreme-angular';
import {GridUtilService} from 'src/app/shared/services/grid-util.service';
import {Sacl060Service, Sacl060VO} from './sacl060.service';

@Component({
  selector: 'app-sacl060',
  templateUrl: './sacl060.component.html',
  styleUrls: ['./sacl060.component.scss']
})
export class Sacl060Component implements OnInit, AfterViewInit {

  constructor(public utilService: CommonUtilService,
              private service: Sacl060Service,
              private codeService: CommonCodeService,
              private bizService: BizCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.sessionUserId = this.utilService.getUserUid();
    this.userGroup = this.utilService.getUserGroup();
    this.userCompany = this.utilService.getCompany();

    this.allowEditing = this.allowEditing.bind(this);
  }

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  @ViewChild('clsYM', {static: false}) clsYM: DxDateBoxComponent;

  dsSaWhCd = []; // 창고
  dsClsYn = []; // 마감여부
  dsClsY = [];
  dsClsM = [];

  dsUser = []; // 사용자

  // Global
  G_TENANT: any;
  sessionUserId: any;
  userGroup: any;
  userCompany: any;

  mainFormData: Sacl060VO = {} as Sacl060VO;

  // main grid
  dsMainGrid: DataSource;
  entityStoreMainGrid: ArrayStore;

  saveData: Sacl060VO;

  selectedRows: number[];
  changes = [];
  key = 'expt_cd';

  now = this.utilService.getFormatMonth(new Date());

  // Grid State
  GRID_STATE_KEY = 'sacl_sacl060_1';
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');

  /**
   *  초기화 메소드 START
   */
  ngOnInit(): void {
    this.dsClsYn = [{cd: 'Y', nm: this.utilService.convert1('sales.close', '마감', 'Close')},
      {cd: 'N', nm: this.utilService.convert1('sales.un_close', '미마감', 'UnClose')}];

    // 창고
    this.bizService.getSaWhList(this.G_TENANT).subscribe(result => {
      this.dsSaWhCd = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  ngAfterViewInit(): void {
    this.initForm();

    this.utilService.getGridHeight(this.mainGrid);
  }

  // search Form 초기화
  initForm(): void {
    if (this.userGroup === '2') {
      this.mainForm.instance.getEditor('exptCd').option('value', this.userCompany);
      this.mainForm.instance.getEditor('exptCd').option('disabled', true);
    }
  }

  /**
   *  초기화 메소드 END
   */

  /**
   *  조회 메소드 START
   */
  // 메인 그리드 조회
  async onSearch(): Promise<void> {

    const data = this.mainForm.instance.validate();
    if (data.isValid) {
      this.mainFormData.clsYM = document.getElementsByName('clsYM').item(1).getAttribute('value').replace(/-/gi, '');
      // this.mainFormData["userId"]  = this.sessionUserId;

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
            key: this.key,
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
  }

  /**
   *  조회 메소드 END
   */

  /**
   *  이벤트 메소드 START
   */
  // 신규버튼 이벤트
  async onSave(): Promise<void> {

    try {
      let result;
      this.saveData = {tenant: this.G_TENANT, ...this.saveData};
      const saveContent = this.saveData as Sacl060VO;
      const detailList = this.bizService.collectGridData(this.changes, this.mainGrid, this.G_TENANT);

      if (!this.mainGrid.instance.hasEditData()) {
        //  변경된 데이터가 없습니다.
        const msg = this.utilService.convert('noChangedData');

        this.utilService.notify_error(msg);
        return;
      }

      const confirmMsg = this.utilService.convert('confirmSave', this.utilService.convert1('sales.mat_cls', '수불마감', 'In Out Close'));

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      saveContent.gridList = detailList;

      saveContent.createdby = this.sessionUserId;
      saveContent.modifiedby = this.sessionUserId;

      result = await this.service.mainSave(saveContent);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.utilService.notify_success('Save success');
        // this.popupForm.instance.resetValues();
        this.onSearch();
      }
    } catch {
      this.utilService.notify_error('There was an error!');
    }
  }


  // 그리드 셀 이동시 호출하는 함수
  onFocusedCellChanging(e, grid): void {
    grid.focusedRowIndex = e.rowIndex;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  // grid edit 제어
  allowEditing(e): any {
    return true;
  }
}
