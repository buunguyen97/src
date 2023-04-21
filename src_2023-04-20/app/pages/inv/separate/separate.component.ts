import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {DxAccordionComponent, DxButtonComponent, DxDataGridComponent} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {SeparateService, SeparateVO} from './separate.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import _ from 'lodash';

@Component({
  selector: 'app-separate',
  templateUrl: './separate.component.html',
  styleUrls: ['./separate.component.scss']
})
export class SeparateComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('subForm', {static: false}) subForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;
  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;


  // Global
  G_TENANT: any;
  changes = [];
  dsUser = [];

  // ***** main ***** //
  // Form
  mainFormData: {} = {};
  subFormData: SeparateVO = {} as SeparateVO;

  // Grid
  mainGridDataSource: DataSource;
  mainEntityStore: ArrayStore;
  key = 'uid';
  // ***** main ***** //

  dsWarehouse = [];
  dsDamageFlg = [];
  dsOwner = [];
  dsItemAdmin = [];
  dsItem = [];
  dsSpec = [];
  dsLoc = [];
  dsYN = [];

  GRID_STATE_KEY = 'wi_separate';
  saveState = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY);
  loadState = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY);

  constructor(
    public utilService: CommonUtilService,
    private service: SeparateService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService
  ) {
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
    this.mainForm.instance.focus();
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initForm();
    this.utilService.fnAccordionExpandAll(this.acrdn);
    this.utilService.getGridHeight(this.mainGrid);
// 아코디언 모두 펼치기
  }

  initForm(): void {
    // 공통 조회 조건 set
    this.mainForm.instance.getEditor('ownerId').option('value', this.utilService.getCommonOwnerId());
    this.mainForm.instance.getEditor('warehouseId').option('value', this.utilService.getCommonWarehouseId());
    this.mainForm.instance.getEditor('itemAdminId').option('value', this.utilService.getCommonItemAdminId());
  }

  initCode(): void {
    // 센터(창고)
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 로케이션코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.dsLoc = result.data;
    });

    // 회사
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 블량여부
    this.codeService.getCode(this.G_TENANT, 'DAMAGEFLG').subscribe(result => {
      this.dsDamageFlg = result.data;
    });

    // 품목
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItem = result.data;
    });

    // 스펙
    this.codeService.getSpec(this.G_TENANT).subscribe(result => {
      this.dsSpec = result.data;
    });


    // 품목관리사
    this.codeService.getItemAdmin(this.G_TENANT).subscribe(result => {
      this.dsItemAdmin = result.data;
    });

    // 사용자
    this.codeService.getUser(this.G_TENANT).subscribe(result => {
      this.dsUser = result.data;
    });
  }

  // 그리드 품목 선택시 시리얼 여부
  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.isSerial = this.dsItem.filter(el => el.uid === value)[0].isSerial;          // 시리얼여부
    rowData.unit = value;
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

  onFocusedRowChanged(e): void {
    try {
      this.subFormData = _.cloneDeep(e.row.data);
      this.subFormData.moveQty = 0;
    } catch {
    }
  }

  // 로트 변경
  async onExcute(): Promise<void> {
    const data = this.subForm.instance.validate();

    if (data.isValid) {
      const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('separate_button'));

      if (!await this.utilService.confirm(confirmMsg)) {
        return;
      }
      this.subFormData.lotAttribute.damageFlg = this.subForm.instance.getEditor('damageFlg').option('value');
      const result = await this.service.execute([this.subFormData]);

      if (this.resultMsgCallback(result, '재고조사확정')) {
        this.onSearch();
      } else {
        return;
      }
    } else {
      const msg = this.utilService.convert('bom_custom_qty1');
      this.utilService.notify_error(msg);
      return;
    }
  }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    this.initForm();
  }
}
