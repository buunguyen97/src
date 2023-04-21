import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxDataGridComponent} from 'devextreme-angular';
import {RcvTagDetailVO} from '../rcvperformregistration/rcvperformregistration.service';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {RcvmodifyschdateService} from './rcvmodifyschdate.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';

@Component({
  selector: 'app-modify-rcv-sch-date',
  templateUrl: './rcvmodifyschdate.component.html',
  styleUrls: ['./rcvmodifyschdate.component.scss']
})
export class RcvmodifyschdateComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  // Global
  G_TENANT: any;
  ACT_FLG_SEARCH_VALUE = 'Y';

  mainFormData: RcvTagDetailVO = {} as RcvTagDetailVO;

  // grid
  dataSource: DataSource;
  entityStore: ArrayStore;
  key = 'uid';
  changes = [];

  dsRcvStatus = [];   // 입고상태
  dsRcvType = [];   // 입고타입
  dsItemId = [];   // 품목코드
  dsCompany = [];   // 거래처코드
  dsLocation = [];   // 로케이션
  dsActFlg = [];   // 사용여부

  // Grid State
  GRID_STATE_KEY = 'rcv_rcvmodifyschdate1';
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);

  constructor(public utilService: CommonUtilService,
              private service: RcvmodifyschdateService,
              private codeService: CommonCodeService,
              public gridUtil: GridUtilService) {
    this.G_TENANT = this.utilService.getTenant();
  }

  ngOnInit(): void {
    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );
    this.dataSource = new DataSource({
      store: this.entityStore
    });

    // 입고상태
    this.codeService.getCode(this.G_TENANT, 'RCVSTATUS').subscribe(result => {
      this.dsRcvStatus = result.data;
    });

    // 입고타입
    this.codeService.getCode(this.G_TENANT, 'RCVTYPE').subscribe(result => {
      this.dsRcvType = result.data;
    });

    // 거래처
    this.codeService.getCompany(this.G_TENANT, null, null, null, null, null, null, null).subscribe(result => {
      this.dsCompany = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItemId = result.data;
    });

    // 로케이션
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLocation = result.data;
    });

    // 사용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  ngAfterViewInit(): void {
    this.initForm();
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
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex, this.mainGrid);
  }

  setFocusRow(index, grid): void {
    grid.focusedRowIndex = index;
  }

  async modifySchDate(): Promise<void> {
    const changes = this.collectGridData(this.changes);
    if (changes.length > 0) {
      await this.service.modifySchDate(changes);
    } else {
      this.utilService.notify_error(this.utilService.convert1('inv_rcvmodifyschdate_inputmessage', '입고예정일을 입력하세요.'));
      return;
    }
    await this.mainGrid.instance.deselectAll();
    await this.onSearch();
  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
      // Insert일 경우 UUID가 들어가 있기 때문에 Null로 매핑한다.
      if (changes[rowIndex].type === 'insert') {
        gridList.push(Object.assign({
          operType: changes[rowIndex].type,
          uid: null,
          tenant: this.G_TENANT
        }, changes[rowIndex].data));
      } else if (changes[rowIndex].type === 'remove') {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data)
        );
      } else {
        gridList.push(
          Object.assign(
            {operType: changes[rowIndex].type, uid: changes[rowIndex].key}, changes[rowIndex].data
          )
        );
      }
    }
    return gridList;
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }

  initForm(): void {
    // from입고예정일자 setter
    // this.mainForm.instance.getEditor('fromRcvSchDate').option('value', this.gridUtil.getToday());
  }
}
