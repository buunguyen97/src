import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {MmSerialService} from './mm-serial.service';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';

@Component({
  selector: 'app-mm-serial',
  templateUrl: './mm-serial.component.html',
  styleUrls: ['./mm-serial.component.scss']
})
export class MmSerialComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('execCondForm', {static: false}) execCondForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  dsSerialType = [];
  dsActFlg = [];
  execFormData: any = {};

  // Global
  G_TENANT: any;

  mainFormData: any = {};

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  key = 'uid';
  changes = [];

  GRID_STATE_KEY = 'mm_mmSerial';
  saveState1 = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState1 = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  pageSizeFilter = [];

  constructor(public utilService: CommonUtilService,
              private service: MmSerialService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
    this.onSelectCheckBox = this.onSelectCheckBox.bind(this);
  }

  ngOnInit(): void {
    this.initCode();

    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.dataSource = new DataSource({
      store: this.entityStore
    });
  }

  ngAfterViewInit(): void {
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
  }

  initCode(): void {
    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    // 시리얼타입
    this.codeService.getCode(this.G_TENANT, 'SERIALTYPE').subscribe(result => {
      this.dsSerialType = result.data;
    });

    // 페이징 필터
    this.pageSizeFilter = this.gridUtil.getAllowedPageSize();
    this.pageSizeFilter = this.pageSizeFilter.filter(el => el !== 'all');
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('search success');

        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        await this.mainGrid.instance.deselectAll();
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;

        // 횡스크롤 제거
        this.gridUtil.fnScrollOption(this.mainGrid);
      }
    }
  }

  onFocusedCellChanging(e, grid): void {
    this.setFocusRow(e.rowIndex, grid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async generateSerial(): Promise<void> {
    const saveData = this.execCondForm.instance.validate();

    if (saveData.isValid) {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert1('시리얼생성', '시리얼생성'));
      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }

      console.log(this.execFormData);

      const result = await this.service.generateSerial(this.execFormData);

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData();
        this.utilService.notify_success('Save success');
        await this.onSearch();
      }
    }
  }

  async onSelectCheckBox(e): Promise<void> {
    if (e.value) {
      this.execCondForm.instance.getEditor('serialKey').option('value', '');
      this.execCondForm.instance.getEditor('serialKey').option('disabled', true);

      this.execCondForm.instance.validate();
    } else {
      this.execCondForm.instance.getEditor('serialKey').option('disabled', false);
    }
  }

}
