import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {LocationStatusService} from './location-status.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';


@Component({
  selector: 'app-location-status',
  templateUrl: './location-status.component.html',
  styleUrls: ['./location-status.component.scss']
})
export class LocationStatusComponent implements OnInit, AfterViewInit {

  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData = {};
  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';

  changes = [];

  // DataSet
  dsWarehouseId = [];
  dsLocation = [];
  dsLocationType = [];
  dsLocGroup = [];
  dsBuil = [];
  dsfloor = [];
  dszone = [];
  dslane = [];
  dsrange = [];
  dsqty1 = [];
  dscapacity = [];
  dsuseCapacity = [];
  dsOwner = [];
  dsUser = []; // 사용자

  dsYN = [];

  PAGE_PATH = '';


  // ***** main ***** //
  constructor(
    public utilService: CommonUtilService,
    private service: LocationStatusService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
    this.PAGE_PATH = this.utilService.getPagePath();
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();

    this.mainEntityStore = new ArrayStore(
      {
        data: [],
        key: this.key
      }
    );

    this.mainGridDataSource = new DataSource({
      store: this.mainEntityStore
    });
  }

  // 화면의 컨트롤까지 다 로드 후 호출
  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initForm();
  }

  initCode(): void {
    // // 로케이션
    // this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
    //   this.dsLocation = result.data;
    // });

    // 조회조건 로케이션
    this.codeService.getLocationWithWarehouseId(this.G_TENANT, this.utilService.getCommonWarehouseId().toString()).subscribe(result => {
      this.dsLocation = result.data;
      // this.dsLocId = result.data;
      // this.locIdStorage = [...result.data];
    });

    // 로케이션 타입
    this.codeService.getCode(this.G_TENANT, 'LOCTYPE').subscribe(result => {
      this.dsLocationType = result.data;
    });

    // 로케이션 그룹
    this.codeService.getCode(this.G_TENANT, 'LOCGROUP').subscribe(result => {
      this.dsLocGroup = result.data;
    });

    // 공랙여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });
    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
    // 창고
    this.codeService.getCommonWarehouse(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsWarehouseId = result.data;
    });
    // 화주(공통 화주)
    this.codeService.getCommonOwner(Number(this.utilService.getUserUid())).subscribe(result => {
      this.dsOwner = result.data;
    });
  }

// search Form 초기화
  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.utilService.getGridHeight(this.mainGrid);
    this.initCode();
    this.mainForm.instance.focus();
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);

      if (this.resultMsgCallback(result, 'Search')) {
        this.mainEntityStore = new ArrayStore(
          {
            data: result.data,
            key: this.key
          }
        );

        this.mainGridDataSource = new DataSource({
          store: this.mainEntityStore
        });
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      } else {
        return;
      }
    }
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }


  // 그리드 상태 저장
  saveStateGrid1 = (state) => {
    state.selectedRowKeys = [];
    state.pageIndex = 0;
    state.focusedRowKey = null;
    localStorage.setItem('inv_locationStatus', JSON.stringify(state));
  }

  // 그리드 상태 로드
  loadStateGrid1 = () => {

    return new Promise((resolve, reject) => {
      const data = localStorage.getItem('inv_locationStatus');
      if (data) {
        const state = JSON.parse(data);
        resolve(state);
      } else {
        resolve(null);
      }
    });
  }

  onValueChangedWarehouse(e): void {
    const findValue = this.dsWarehouseId.filter(code => code.uid === e.value);

    this.codeService.getLocation(this.G_TENANT, findValue[0].uid).subscribe(result => {
      this.dsLocation = result.data;
    });
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.initForm();
  }
}
