import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import DataSource from 'devextreme/data/data_source';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {TruckService} from './truck.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';

@Component({
  selector: 'app-truck',
  templateUrl: './truck.component.html',
  styleUrls: ['./truck.component.scss']
})
export class TruckComponent implements OnInit, AfterViewInit {

  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('mainForm', {static: false}) searchForm: DxFormComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;

  // Global
  G_TENANT: any;

  mainFormData = {};
  dsCountry = [];
  dsVehicleType = [];
  dsActFlg = [];
  dsYN = [];
  dsUser = [];
  dataSource: DataSource;
  selectedRows: number[];

  GRID_STATE_KEY = 'mm_truck';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);
  entityStore: ArrayStore;

  key = 'uid';
  changes = [];

  constructor(public utilService: CommonUtilService,
              private service: TruckService,
              public gridUtil: GridUtilService,
              private codeService: CommonCodeService
  ) {
    this.G_TENANT = this.utilService.getTenant();
  }

  addClick(e): void {
    this.mainGrid.instance.addRow().then(r => this.setFocusRow(0));
  }

  async deleteClick(e): Promise<void> {

    if (this.mainGrid.focusedRowIndex > -1) {
      this.mainGrid.instance.deleteRow(this.mainGrid.focusedRowIndex);
      this.entityStore.push([{type: 'remove', key: this.mainGrid.focusedRowKey}]);
    }
  }

  // 조회
  async onSearch(): Promise<void> {
    // 조회패널에 필수컬럼에 값 있는지 체크
    const data = this.searchForm.instance.validate();
    // 값이 모두 있을 경우 조회 호출
    if (data.isValid) {
      // Service의 get 함수 생성
      const result = await this.service.get(this.mainFormData);

      // 조회 결과가 success이면 화면표시, 실패면 메시지 표시

      if (!result.success) {
        this.utilService.notify_error(result.msg);
        return;
      } else {
        this.mainGrid.instance.cancelEditData(); // 수정하는거 다 취소 시킨다는거?
        this.utilService.notify_success('search success');
        // 조회 성공 시 해당 내역을 ArrayStore에 바인딩, Key는 실제 DB의 Key를 권장
        // Front에서 데이터의 CRUD를 컨트롤 할 수 있음.
        // Grid1
        this.entityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );
        console.log(result.data);

        // ArrayStore - DataSource와 바인딩
        // 그리도와 매핑되어 그리드를 Reload하거나 할 수 있음.
        this.dataSource = new DataSource({
          store: this.entityStore
        });
        // 그리드 상태가 수시로 저장되어 포커스가 있을 경우 해당 포커스로 강제 페이지 이동되기 때문에, 그리드의 포커스 없앰
        // 페이징번호도 강제로 1페이지로 Fix
        // 참고: grid1은 HTML에서 그리드의 이름이 #grid1로 명시되어 있으며, Behind 상단에 @ViewChild에 DxDataGridComponent로 선언되어 있음.
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async onSave(): Promise<void> {
    const columns = ['country', 'vehicleType', 'ownerName', 'cbm', 'cbmAble'];
    const tempData = this.collectGridData(this.changes);

    for (const item of tempData) {
      if (!item.key && !item.uid) {
        for (const col of columns) {
          if ((item[col] === undefined) || (item[col] === '')) {
            this.utilService.notify_error('An empty value exists');
            return;
          }
        }
      }
      this.mainGrid.instance.byKey(item.key).then(
        (dataItem) => {
          for (const col of columns) {
            if ((dataItem[col] === undefined) || (dataItem[col] === '')) {
              this.utilService.notify_error('An empty value exists');
              return;
            }
          }
        }
      );
    }

    this.mainGrid.instance.saveEditData();
    // const saveData = changeData;
    const result = await this.service.save(tempData);

    if (result.success) {
      this.utilService.notify_success('save success');
    } else {
      this.utilService.notify_success('save failed');
    }
    this.onSearch();

  }

  collectGridData(changes: any): any[] {
    const gridList = [];
    for (const rowIndex in changes) {
      // Insert일 경우 UID가 들어가 있기 떄문에 Null로 매핑한다.
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

  onFocusedCellChanging(e): void {
    this.setFocusRow(e.rowIndex);
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

  ngOnInit(): void {
    this.entityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    // ArrayStore - DataSource와 바인딩
    // 그리도와 매핑되어 그리드를 Reload하거나 할 수 있음.
    this.dataSource = new DataSource({
      store: this.entityStore
    });
  }

// 화면 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 국가
    this.codeService.getCode(this.G_TENANT, 'COUNTRY').subscribe(result => {
      this.dsCountry = result.data;
    });

    // 차량타입
    this.codeService.getCode(this.G_TENANT, 'VEHICLETYPE').subscribe(result => {
      this.dsVehicleType = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });

    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsActFlg = result.data;
    });

    this.utilService.getGridHeight(this.mainGrid);
    this.initForm();
  }

  initForm(): void {
    this.searchForm.instance.getEditor('actFlg').option('value', 'Y');
    this.searchForm.instance.focus();
  }

}

