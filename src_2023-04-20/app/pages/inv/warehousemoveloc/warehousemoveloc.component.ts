import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {DxFormComponent} from 'devextreme-angular/ui/form';
import {
  DxAccordionComponent,
  DxButtonComponent,
  DxDataGridComponent,
  DxFileUploaderComponent,
  DxPopupComponent
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import {CommonUtilService} from '../../../shared/services/common-util.service';
import {CommonCodeService} from '../../../shared/services/common-code.service';
import {WarehousemovelocService, WarehouseMoveVO} from './warehousemoveloc.service';
import {GridUtilService} from '../../../shared/services/grid-util.service';
import {RiInstructVO} from '../ri-instruct/ri-instruct.service';
import {RcvCommonUtils} from '../../rcv/rcvCommonUtils';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-warehousemoveloc',
  templateUrl: './warehousemoveloc.component.html',
  styleUrls: ['./warehousemoveloc.component.scss']
})
export class WarehousemovelocComponent implements OnInit, AfterViewInit {
  @ViewChild('mainForm', {static: false}) mainForm: DxFormComponent;
  @ViewChild('subForm', {static: false}) subForm: DxFormComponent;
  @ViewChild('mainGrid', {static: false}) mainGrid: DxDataGridComponent;

  @ViewChild('serialPopup', {static: false}) serialPopup: DxPopupComponent;
  @ViewChild('serialForm', {static: false}) serialForm: DxFormComponent;
  @ViewChild('serialGrid', {static: false}) serialGrid: DxDataGridComponent;

  @ViewChild('fileUploader', {static: false}) fileUploader: DxFileUploaderComponent;

  @ViewChild('foldableBtn', {static: false}) foldableBtn: DxButtonComponent;
  @ViewChild('acrdn', {static: false}) acrdn: DxAccordionComponent;

  // Global
  G_TENANT: any;

  // ***** main ***** //
  // Form
  mainFormData: RiInstructVO = {} as RiInstructVO;
  // Grid
  mainDataSource: DataSource;
  mainEntityStore: ArrayStore;
  mainKey = 'uid';
  selectedRows: number[];
  changes = [];
  // ***** main ***** //

  serialDataSource: DataSource;
  serialEntityStore: ArrayStore;
  serialKey = 'serial';

  serialFormData: WarehouseMoveVO = {} as WarehouseMoveVO;

  dsFromLoc = [];
  dsFilteredItem = [];
  dsSpec = [];
  dsTransLoc = [];
  dsToLoc = [];
  locIdStorage = [];

  dsWarehouse = [];

  dsOwner = [];
  dsItemAdmin = [];
  dsItem = [];
  dsYN = [];
  dsUser = [];

  GRID_STATE_KEY = 'wi_wahmoveloc';
  saveStateMain = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_main');
  loadStateMain = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_main');
  saveStateSerial = this.gridUtil.fnGridSaveState(this.GRID_STATE_KEY + '_serial');
  loadStateSerial = this.gridUtil.fnGridLoadState(this.GRID_STATE_KEY + '_serial');


  constructor(
    public utilService: CommonUtilService,
    private service: WarehousemovelocService,
    private codeService: CommonCodeService,
    public gridUtil: GridUtilService,
  ) {
    // this.onValueChangedItemAdmin = this.onValueChangedItemAdmin.bind(this);
    this.onValueChangedTransWarehouse = this.onValueChangedTransWarehouse.bind(this);
    this.onValueChangedToWarehouse = this.onValueChangedToWarehouse.bind(this);
  }

  ngOnInit(): void {
    this.G_TENANT = this.utilService.getTenant();
    this.initCode();
    this.inputDataSource([], 'main');
  }

  ngAfterViewInit(): void {
    this.utilService.getFoldable(this.mainForm, this.foldableBtn);
    this.initFormData(this.mainForm, 'main');
    this.initFormData(this.subForm, 'sub');
    this.inputDataSource([], 'serial');
    this.utilService.fnAccordionExpandAll(this.acrdn);  // 아코디언 모두 펼치기
    this.utilService.getGridHeight(this.mainGrid);
  }

  initCode(): void {
    // 창고
    this.codeService.getWarehouse(this.G_TENANT, null, null).subscribe(result => {
      this.dsWarehouse = result.data;
    });

    // 화주
    this.codeService.getCompany(this.G_TENANT, true, null, null, null, null, null, null).subscribe(result => {
      this.dsOwner = result.data;
    });

    // 로케이션코드
    this.codeService.getLocation(this.G_TENANT, null).subscribe(result => {
      this.locIdStorage = result.data;
      this.dsFromLoc = [...result.data].filter(el => el.warehouseId === this.utilService.getCommonWarehouseId());
    });

    // 가용여부
    this.codeService.getCode(this.G_TENANT, 'YN').subscribe(result => {
      this.dsYN = result.data;
    });

    // 물품
    this.codeService.getItem(this.G_TENANT).subscribe(result => {
      this.dsItem = result.data;
      this.dsFilteredItem = this.dsItem.filter(el => el.itemAdminId === this.utilService.getCommonItemAdminId());
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

  inputDataSource(inputData, type): void {

    this[type + 'EntityStore'] = new ArrayStore({
        data: inputData,
        key: this[type + 'Key']
      }
    );

    this[type + 'DataSource'] = new DataSource({
      store: this[type + 'EntityStore']
    });
  }

  async onSearch(): Promise<void> {
    const data = this.mainForm.instance.validate();
    await this.mainGrid.instance.deselectAll();
    this.mainGrid.instance.cancelEditData();

    if (data.isValid) {
      const result = await this.service.get(this.mainFormData);
      const MOVEQTY = 'moveQty';

      result.data.map(el => {
        el[MOVEQTY] = 0;
      });

      if (this.resultMsgCallback(result, 'Search')) {
        this.inputDataSource(result.data, 'main');
        this.mainGrid.focusedRowKey = null;
        this.mainGrid.paging.pageIndex = 0;
      }
    }
  }

  async onExcute(): Promise<void> {
    const selectList = await this.mainGrid.instance.getSelectedRowsData();
    const subCheck = this.subForm.instance.validate();
    const subFormData = this.subForm.formData;

    if (subCheck.isValid) {

      if (selectList.length > 0) {
        let check = false;
        let rowIdx;

        for (const selectRow of selectList) {
          rowIdx = this.mainGrid.instance.getRowIndexByKey(selectRow.uid);
          const toLocId = this.mainGrid.instance.cellValue(rowIdx, 'toLocId');
          const moveQty = this.mainGrid.instance.cellValue(rowIdx, 'moveQty');
          const qty = this.mainGrid.instance.cellValue(rowIdx, 'qty1');
          const isSerial = this.mainGrid.instance.cellValue(rowIdx, 'isSerial');

          if (!toLocId) {
            this.utilService.notify_error(this.utilService.convert('com_valid_required', !toLocId ? 'toLocId' : 'moveQty'));
            this.setFocusRow(rowIdx);
            check = true;
            break;
          } else {
            selectRow.toLocId = toLocId;
            Object.assign(selectRow, subFormData);
          }

          if (!moveQty) {
            this.utilService.notify_error(this.utilService.convert('so_valid_qtygt', this.utilService.convert('so_so_expectQty1'), '0'));
            this.setFocusRow(rowIdx);
            check = true;
            break;
          } else {

            if (qty < moveQty) {
              this.utilService.notify_error(this.utilService.convert('so_valid_qtylt', this.utilService.convert('inv_warehousemoveloc_moveQty'),
                this.utilService.convert('inv_warehousemoveloc_qty1')));
              this.setFocusRow(rowIdx);
              check = true;
              break;
            }
            selectRow.moveQty = moveQty;
            Object.assign(selectRow, subFormData);
          }

          if (isSerial === 'Y') {
            const serialList = await this.mainGrid.instance.cellValue(rowIdx, 'serialList');

            if (!serialList) {
              this.utilService.notify_error(this.utilService.convert('so_valid_qtygt', this.utilService.convert('so_so_tagQty'), '0'));
              check = true;
              break;
            }

            if (serialList.length > moveQty) {
              this.utilService.notify_error(this.utilService.convert('so_valid_qtygt',
                this.utilService.convert('inv_warehousemoveloc_moveQty'), this.utilService.convert('so_so_tagQty')));
              check = true;
              break;
            } else {
              selectRow.serialList = serialList;
            }
          }
        }

        if (check) {
          return;
        }
        const confirmMsg = this.utilService.convert('confirmExecute', this.utilService.convert('phyinstruct_button_instruct'));

        if (!await this.utilService.confirm(confirmMsg)) {
          return;
        }

        const result = await this.service.execute(selectList);

        if (this.resultMsgCallback(result, 'Search')) {
          await this.onSearch();
        }
      } else {
        this.utilService.notify_error('선택된 데이터가 없습니다');
      }
    }
  }

  initFormData(form, type): void {
    let data;

    if (type === 'main') {
      data = {
        tenant: this.G_TENANT,
        warehouseId: this.utilService.getCommonWarehouseId(),
        ownerId: this.utilService.getCommonOwnerId(),
        itemAdminId: this.utilService.getCommonItemAdminId()
      };
      form.instance.focus();
    } else {

      data = {
        fromWarehouseId: this.utilService.getCommonWarehouseId(),
        ownerId: this.utilService.getCommonOwnerId(),
        companyId: this.utilService.getCommonOwnerId(),
        moveDate: this.utilService.formatDate(new Date()),
        fromLogisticsId: this.utilService.getCommonWarehouseVO().logisticsId,
        fromLatitude: this.utilService.getCommonWarehouseVO().latitude,
        fromLongitude: this.utilService.getCommonWarehouseVO().longitude
      };
    }
    form.formData = data;
  }

  resultMsgCallback(result, msg): boolean {

    if (result.success) {
      this.utilService.notify_success(msg + ' success');
    } else {
      this.utilService.notify_error(result.msg);
    }
    return result.success;
  }

  onValueChangedToWarehouse(e): void {

    // if (this.changes.length > 0) {
    //   const check = await this.utilService.confirm(this.utilService.convert('inv_move_changeToWarehouse'));
    //
    //   if (check) {
    //     return;
    //   } else {
    //     this.mainGrid.instance.cancelEditData();
    //   }
    // }
    if (!e.value) {
      this.subForm.formData.toWarehouseId = e.value;
      this.subForm.formData.toLogisticsId = e.value;
      this.dsToLoc = [];
    } else {
      const data = this.dsWarehouse.filter(el => el.uid === e.value);

      this.subForm.formData.toWarehouseId = e.value;
      this.subForm.formData.toLogisticsId = data[0].logisticsId;
      this.subForm.formData.toLatitude = data[0].latitude;
      this.subForm.formData.toLongitude = data[0].longitude;

      this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
        this.dsToLoc = result.data;
      });
    }
  }

  onValueChangedTransWarehouse(e): void {

    if (!e.value) {
      this.subForm.formData.transWarehouseId = e.value;
      this.subForm.formData.transLogisticsId = e.value;
      this.dsTransLoc = [];
    } else {
      const data = this.dsWarehouse.filter(el => el.uid === e.value);

      this.subForm.formData.transWarehouseId = e.value;
      this.subForm.formData.transLogisticsId = data[0].logisticsId;
      this.subForm.formData.tranLatitude = data[0].latitude;
      this.subForm.formData.tranLongitude = data[0].longitude;

      this.codeService.getLocationWithWarehouseId(this.G_TENANT, e.value).subscribe(result => {
        this.dsTransLoc = result.data;
      });
    }
  }

  // onValueChangedItemAdmin(e): void {
  //
  //   if (!e.value) {
  //     this.dsItem = null;
  //     this.mainFormData.itemId = null;
  //     return;
  //   }
  //   const findValue = this.dsItemAdmin.filter(code => code.uid === e.value);
  //
  //   this.codeService.getItemWithItemAdminId(this.G_TENANT, findValue[0].uid).subscribe(result => {
  //     this.dsItem = result.data;
  //   });
  // }

  async onReset(): Promise<void> {
    await this.mainForm.instance.resetValues();
    await this.subForm.instance.resetValues();
    await this.initFormData(this.mainForm, 'main');
    await this.initFormData(this.subForm, 'sub');
    this.dsToLoc = [];
  }

  setFocusRow(index): void {
    this.mainGrid.focusedRowIndex = index;
  }

  setItemValue(rowData: any, value: any): void {
    rowData.itemId = value;
    rowData.unit = value;
  }

  isUploadButtonVisible(e): boolean {
    return e.row.data.isSerial === RcvCommonUtils.FLAG_TRUE;
  }

  async onSerialPopupClick(e, rowIdx: any): Promise<void> {
    const uid = this.mainGrid.instance.cellValue(rowIdx, 'uid');
    const itemId = this.mainGrid.instance.cellValue(rowIdx, 'itemId');
    const qty1 = this.mainGrid.instance.cellValue(rowIdx, 'qty1');
    const moveQty = this.mainGrid.instance.cellValue(rowIdx, 'moveQty');
    const serialList = this.mainGrid.instance.cellValue(rowIdx, 'serialList');

    if (moveQty <= 0) {
      this.utilService.notify_error(this.utilService.convert('so_valid_qtygt'
        , this.utilService.convert('inv_warehousemoveloc_moveQty'), '0'));
      return;
    }

    if (qty1 < moveQty) {
      this.utilService.notify_error(this.utilService.convert('so_valid_qtylt'
        , this.utilService.convert('inv_warehousemoveloc_moveQty'), this.utilService.convert('inv_warehousemoveloc_qty1')));
      return;
    }

    this.serialFormData.uid = uid;
    this.serialFormData.itemId = itemId;
    this.serialFormData.moveQty = moveQty;
    this.serialPopup.visible = true;

    if (serialList.length > 0) {
      this.inputDataSource(serialList, 'serial');
    }
  }

  onSerialCancelClick(): void {
    this.serialPopup.visible = false;
  }

  onSerialPopupClosed(): void {
    this.serialForm.instance.resetValues();
    this.fileUploader.instance.reset();
    this.inputDataSource([], 'serial');
  }

  onResetFileUploader(): void {
    this.fileUploader.instance.reset();
    this.inputDataSource([], 'serial');

    const rowIdx = this.mainGrid.instance.getRowIndexByKey(this.serialFormData.uid);
    this.mainGrid.instance.cellValue(rowIdx, 'tagQty', null);
    this.mainGrid.instance.cellValue(rowIdx, 'serialList', null);
  }


  async onSerialFileUploader(): Promise<void> {
    let workBook = null;
    let jsonData = null;
    const reader = new FileReader();
    const file = this.fileUploader.value[0];

    if (!file) {
      return;
    }

    let Sheet1 = [];
    reader.onload = (event: any) => {
      const data = reader.result;
      workBook = XLSX.read(data, {type: 'binary'});
      jsonData = workBook.SheetNames.reduce((initial, name) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const mapData = JSON.parse(dataString);

      Sheet1 = mapData.Sheet1;
      for (const key in Sheet1) {
        if (Sheet1.hasOwnProperty(key)) {
          Sheet1[key].tenant = this.G_TENANT;
        }
      }
      const rowIdx = this.mainGrid.focusedRowIndex;

      const moveQty = this.serialFormData.moveQty;

      if (moveQty === Sheet1.length) {
        this.mainGrid.instance.cellValue(rowIdx, 'serialList', Sheet1);
        this.mainGrid.instance.cellValue(rowIdx, 'tagQty', Sheet1.length);
      } else {
        this.utilService.notify_error(this.utilService.convert('so_valid_qtyeq'
          , this.utilService.convert('inv_warehousemove_expectQty1'), this.utilService.convert('inv_invadjust_tagQty')));
      }
      this.inputDataSource(Sheet1, 'serial');
    };
    reader.readAsBinaryString(file);
  }

  onToolbarPreparingWithExtra(e): void {
    const toolbarItems = e.toolbarOptions.items;
    const newToolbarItems = [];

    newToolbarItems.push(toolbarItems.find(item => item.name === 'searchPanel'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'exportButton'));
    newToolbarItems.push(toolbarItems.find(item => item.name === 'columnChooserButton'));

    newToolbarItems.push({  // 엑셀다운로드
      location: 'after',
      widget: 'dxButton',
      options: {
        icon: 'check',
        text: this.utilService.convert1('serialTemplete', '양식다운로드'),
        onClick: this.downloadExcel.bind(this)
      }
    });
    e.toolbarOptions.items = newToolbarItems;
  }

  async downloadExcel(): Promise<void> {
    this.utilService.downloadSerialExcel();
  }

  test(e): void {
    const qty1 = e.row.qty1;
    const moveQty = e.row.moveQty;
    console.log(e);
    const moveQty1 = this.mainGrid.instance.cellValue(e.rowIndex, 'moveQty');

    console.log(moveQty1);


    if (qty1 < moveQty) {
      console.log(e.row);
      console.log(e.row.column);
    }
  }
}
